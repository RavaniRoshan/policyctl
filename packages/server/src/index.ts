import { Hono } from "hono";
import type { Env, ReportResult, Role, User } from "./types.js";
import { bearerToken, orgQuery } from "./auth.js";
import {
  addMember,
  aggByRepo,
  aggByRule,
  createOrg,
  getPolicy,
  getUserByToken,
  listOrgs,
  listVersions,
  listViolations,
  pushPolicy,
  reportViolations,
  resolveOrg,
  rollback,
  trend,
  upsertUser,
} from "./store.js";
import { loginPage, renderDashboard } from "./dashboard.js";

const app = new Hono<{ Bindings: Env }>();
const API = "/api";

// ── CORS for /api (lets the future dashboard SPA call cross-origin) ──
app.use(`${API}/*`, async (c, next) => {
  await next();
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "content-type, authorization");
});
app.options(`${API}/*`, (c) => c.body(null, 204));

async function requireUser(c: { env: Env; req: { header: (k: string) => string | undefined; query: (k: string) => string | undefined } }): Promise<User | null> {
  const token = bearerToken(c as any);
  return getUserByToken(c.env.DB, token);
}

// ── Auth ─────────────────────────────────────────────────────────────
app.post(`${API}/login`, async (c) => {
  const body = (await c.req.json<{ email?: string }>().catch(() => ({}))) as { email?: string };
  if (!body.email) return c.json({ error: "email required" }, 400);
  const user = await upsertUser(c.env.DB, body.email);
  return c.json({ token: user.token, email: user.email, id: user.id });
});

// ── Policy (org-scoped; defaults to the user's primary org) ──────────
app.post(`${API}/policy`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json<{ yaml?: string; note?: string }>().catch(() => ({}))) as { yaml?: string; note?: string };
  if (typeof body.yaml !== "string") return c.json({ error: "yaml required" }, 400);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const v = await pushPolicy(c.env.DB, org.id, body.yaml, user.id, body.note);
  return c.json({ ok: true, version: v.version, id: v.id });
});

app.get(`${API}/policy`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const yaml = await getPolicy(c.env.DB, org.id);
  return c.json({ yaml });
});

app.get(`${API}/policy/versions`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  return c.json({ versions: await listVersions(c.env.DB, org.id) });
});

app.post(`${API}/policy/versions/:id/rollback`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const id = Number(c.req.param("id"));
  const res = await rollback(c.env.DB, org.id, id);
  return res.ok ? c.json({ ok: true }) : c.json({ error: res.error }, 400);
});

// ── Violations ───────────────────────────────────────────────────────
app.post(`${API}/report`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req
    .json<{ repo?: string; agent?: string; results?: ReportResult[] }>()
    .catch(() => ({}))) as { repo?: string; agent?: string; results?: ReportResult[] };
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const results = Array.isArray(body.results) ? body.results : [];
  const repo = String(body.repo ?? "");
  const agent = String(body.agent ?? "ci");
  const count = await reportViolations(c.env.DB, org.id, repo, agent, results);
  return c.json({ ok: true, count });
});

app.get(`${API}/violations`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  return c.json({ violations: await listViolations(c.env.DB, org.id) });
});

// ── Orgs & members ───────────────────────────────────────────────────
app.get(`${API}/orgs`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  return c.json({ orgs: await listOrgs(c.env.DB, user.id) });
});

app.post(`${API}/orgs`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json<{ name?: string }>().catch(() => ({}))) as { name?: string };
  if (!body.name) return c.json({ error: "name required" }, 400);
  return c.json({ org: await createOrg(c.env.DB, user.id, body.name) }, 201);
});

app.post(`${API}/orgs/:id/members`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const orgId = Number(c.req.param("id"));
  const body = (await c.req.json<{ email?: string; role?: Role }>().catch(() => ({}))) as { email?: string; role?: Role };
  if (!body.email || !body.role) return c.json({ error: "email and role required" }, 400);
  const res = await addMember(c.env.DB, orgId, user.id, body.email, body.role);
  return res.ok ? c.json({ ok: true }) : c.json({ error: res.error }, 403);
});

// ── Dashboard (server-rendered) ──────────────────────────────────────
app.get("/dashboard", async (c) => {
  const token = bearerToken(c);
  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.redirect("/");
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.html("<p>No organization found.</p>");
  const [orgs, versions, violations, byRepo, byRule, tr] = await Promise.all([
    listOrgs(c.env.DB, user.id),
    listVersions(c.env.DB, org.id),
    listViolations(c.env.DB, org.id, 200),
    aggByRepo(c.env.DB, org.id),
    aggByRule(c.env.DB, org.id),
    trend(c.env.DB, org.id, 14),
  ]);
  return c.html(renderDashboard({ org, orgs, versions, violations, byRepo, byRule, trend: tr, token }));
});

app.get("/", async (c) => {
  const token = bearerToken(c);
  if (!token) return c.html(loginPage());
  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.html(loginPage());
  return c.redirect("/dashboard");
});

export default { fetch: app.fetch };
