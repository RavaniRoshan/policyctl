import { Hono } from "hono";
import type { Env, ReportResult, Role, User } from "./types.js";
import { bearerToken, orgQuery } from "./auth.js";
import {
  addMember,
  aggByRepo,
  aggByRule,
  analytics,
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
  toCsv,
  trend,
  upsertUser,
} from "./store.js";
import { loginPage, renderDashboard } from "./dashboard.js";
import { makeR2 } from "./s3.js";
import { cacheGetPolicy, cacheGetUser, cacheInvalidatePolicy, cachePutPolicy, cachePutUser } from "./cache.js";
import { analyzeDiff, authorRule } from "./ai.js";
import { PolicySession } from "./session.js";

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
  // KV cache first (sub-ms), fall back to D1 on miss.
  const cached = await cacheGetUser(c.env, token);
  if (cached != null) {
    const u = await getUserByToken(c.env.DB, token);
    if (u) return u;
  }
  const u = await getUserByToken(c.env.DB, token);
  if (u) await cachePutUser(c.env, token, u.id);
  return u;
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
  await cacheInvalidatePolicy(c.env, org.id);
  return c.json({ ok: true, version: v.version, id: v.id });
});

app.get(`${API}/policy`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  // KV cache first, fall back to D1.
  const cached = await cacheGetPolicy(c.env, org.id);
  if (cached != null) return c.json({ yaml: cached });
  const yaml = await getPolicy(c.env.DB, org.id);
  if (yaml) await cachePutPolicy(c.env, org.id, yaml);
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
  if (res.ok) await cacheInvalidatePolicy(c.env, org.id);
  return res.ok ? c.json({ ok: true }) : c.json({ error: res.error }, 400);
});

// ── Violations ───────────────────────────────────────────────────────
app.post(`${API}/report`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req
    .json<{ repo?: string; agent?: string; results?: ReportResult[]; actor?: "agent" | "human" }>()
    .catch(() => ({}))) as { repo?: string; agent?: string; results?: ReportResult[]; actor?: "agent" | "human" };
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const results = Array.isArray(body.results) ? body.results : [];
  const repo = String(body.repo ?? "");
  const agent = String(body.agent ?? "ci");
  const actor = body.actor === "human" ? "human" : "agent";
  const count = await reportViolations(c.env.DB, org.id, repo, agent, results, actor);
  return c.json({ ok: true, count });
});

app.get(`${API}/violations`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  return c.json({ violations: await listViolations(c.env.DB, org.id) });
});

// ── Phase C: analytics ───────────────────────────────────────────────
app.get(`${API}/analytics`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const days = Number(c.req.query("days") ?? 30);
  return c.json({ analytics: await analytics(c.env.DB, org.id, days) });
});

// ── Phase D: Workers AI — semantic policy intelligence (paid-only) ──
// TODO: gate behind paid-plan check once billing is wired
app.post(`${API}/ai/analyze`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json<{ diff?: string; policy?: string; repo?: string }>().catch(() => ({}))) as { diff?: string; policy?: string; repo?: string };
  if (typeof body.diff !== "string") return c.json({ error: "diff required" }, 400);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const currentPolicy = body.policy ?? (await getPolicy(c.env.DB, org.id));
  const result = await analyzeDiff(c.env, body.diff, currentPolicy, body.repo ?? "");
  return c.json(result);
});

app.post(`${API}/ai/author`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json<{ intent?: string }>().catch(() => ({}))) as { intent?: string };
  if (typeof body.intent !== "string") return c.json({ error: "intent required" }, 400);
  const result = await authorRule(c.env, body.intent);
  return c.json(result);
});

// ── Phase C: export violations (R2-backed) ───────────────────────────
app.get(`${API}/export/violations.csv`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const rows = await listViolations(c.env.DB, org.id, 5000);
  const csv = toCsv(rows);
  try {
    const r2 = makeR2(c.env);
    const key = `exports/org-${org.id}/violations-${Date.now()}.csv`;
    await r2.putObject(key, csv, "text/csv");
    const url = r2.presignedGet(key, 900);
    return c.json({ ok: true, url, key });
  } catch (e) {
    // R2 not configured yet — return the CSV inline so the feature still works.
    return new Response(csv, {
      headers: {
        "content-type": "text/csv",
        "content-disposition": `attachment; filename="policyctl-violations-org-${org.id}.csv"`,
      },
    });
  }
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

// ── Phase D: Durable Objects — live enforcement sessions ─────────────
// Create/get a session DO stub keyed by orgId:sessionKey
async function sessionStub(env: Env, orgId: number, sessionKey: string) {
  const id = env.POLICY_SESSION.idFromName(`${orgId}:${sessionKey}`);
  return env.POLICY_SESSION.get(id);
}

app.post(`${API}/session/init`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json<{ sessionKey?: string; policy?: string }>().catch(() => ({}))) as { sessionKey?: string; policy?: string };
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const key = body.sessionKey ?? `s-${Date.now()}`;
  const stub = await sessionStub(c.env, org.id, key);
  const res = await stub.fetch(c.req.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "init", orgId: org.id, sessionKey: key, policy: body.policy ?? "" }),
  });
  return new Response(await res.text(), { headers: { "content-type": "application/json" } });
});

// WebSocket upgrade for live session stream
app.get(`${API}/session/:key/stream`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const key = c.req.param("key");
  const stub = await sessionStub(c.env, org.id, key);
  // Forward the WebSocket upgrade to the DO
  return stub.fetch(c.req.raw);
});

// Report a tool call / violation into the session
app.post(`${API}/session/:key/report`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const key = c.req.param("key");
  const stub = await sessionStub(c.env, org.id, key);
  const body = await c.req.json();
  const res = await stub.fetch(c.req.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, actor: body.actor ?? "agent" }),
  });
  return new Response(await res.text(), { headers: { "content-type": "application/json" } });
});

export { PolicySession };
export default { fetch: app.fetch };
