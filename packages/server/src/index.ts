import { Hono } from "hono";
import type { Env, ReportResult, Role, User } from "./types.js";
import {
  bearerToken,
  getSessionToken,
  orgQuery,
  setSessionCookie,
  clearSessionCookie,
  verifyPassword,
  verifyTurnstile,
} from "./auth.js";
import {
  addMember,
  aggByRepo,
  aggByRule,
  analytics,
  createOrg,
  createUser,
  getPolicy,
  getUserByEmail,
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

// Map a server-side User row to the web app's User shape (string id, camelCase).
function toWebUser(u: User) {
  return { id: String(u.id), email: u.email, displayName: u.display_name, provider: u.provider };
}

// Resolve the session token from Authorization header, ?token=, or the pc_session cookie.
function sessionToken(c: { env: Env; req: { header: (k: string) => string | undefined; query: (k: string) => string | undefined } }): string | null {
  const bearer = bearerToken(c as any);
  if (bearer) return bearer;
  return getSessionToken(c as any);
}

async function requireUser(c: { env: Env; req: { header: (k: string) => string | undefined; query: (k: string) => string | undefined } }): Promise<User | null> {
  const token = sessionToken(c);
  if (!token) return null;
  // KV cache first (sub-ms) — quick reject of unknown tokens.
  const cachedUid = await cacheGetUser(c.env, token);
  if (cachedUid != null) {
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

// ── Auth (Phase B+: full session-based auth for the web app) ─────────

/** GET /api/me — returns the authenticated session user, or null. */
app.get(`${API}/me`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ user: null });
  return c.json({ user: toWebUser(user) });
});

/** POST /api/auth/logout — clears the session cookie. */
app.post(`${API}/auth/logout`, async (c) => {
  clearSessionCookie(c);
  return c.json({ ok: true });
});

/** POST /api/auth/signup — email/password signup with Turnstile. */
app.post(`${API}/auth/signup`, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    email?: string; password?: string; displayName?: string; turnstile?: string;
  };
  if (!body.email || !body.password) {
    return c.json({ error: "email and password required" }, 400);
  }
  // Verify Turnstile if configured.
  if (c.env.TURNSTILE_SECRET_SITE) {
    const ok = await verifyTurnstile(body.turnstile, c.env.TURNSTILE_SECRET_SITE);
    if (!ok) return c.json({ error: "turnstile verification failed" }, 403);
  }
  // Check for existing user.
  const existing = await getUserByEmail(c.env.DB, body.email);
  if (existing) return c.json({ error: "email already registered" }, 409);
  // Create user with hashed password + auto-provisioned org.
  const user = await createUser(c.env.DB, body.email, body.password, body.displayName ?? null, "email");
  setSessionCookie(c, user.token);
  return c.json({ user: toWebUser(user) });
});

/** POST /api/auth/login — email/password login with Turnstile + session cookie. */
app.post(`${API}/auth/login`, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    email?: string; password?: string; turnstile?: string;
  };
  if (!body.email || !body.password) {
    return c.json({ error: "email and password required" }, 400);
  }
  // Verify Turnstile if configured.
  if (c.env.TURNSTILE_SECRET_SITE) {
    const ok = await verifyTurnstile(body.turnstile, c.env.TURNSTILE_SECRET_SITE);
    if (!ok) return c.json({ error: "turnstile verification failed" }, 403);
  }
  const user = await getUserByEmail(c.env.DB, body.email);
  if (!user || !user.password_hash || !(await verifyPassword(body.password, user.password_hash))) {
    return c.json({ error: "invalid credentials" }, 401);
  }
  setSessionCookie(c, user.token);
  await cachePutUser(c.env, user.token, user.id);
  return c.json({ user: toWebUser(user) });
});

/** GET /api/auth/oauth/google — redirect to Google OAuth consent screen. */
app.get(`${API}/auth/oauth/google`, (c) => {
  const clientId = c.env.OAUTH_GOOGLE_CLIENT_ID;
  const redirectUri = c.env.OAUTH_REDIRECT_URI ?? "https://policyctl-server.shivamkumar10958.workers.dev/api/auth/oauth/callback";
  if (!clientId) return c.json({ error: "OAuth not configured" }, 501);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("scope", "openid email profile");
  return c.redirect(url.toString(), 302);
});

/** GET /api/auth/oauth/callback — Google OAuth callback handler. */
app.get(`${API}/auth/oauth/callback`, async (c) => {
  const code = c.req.query("code");
  const error = c.req.query("error");
  if (error) return c.redirect("/login?error=" + encodeURIComponent(error));
  if (!code) return c.redirect("/login?error=no_code");

  const clientId = c.env.OAUTH_GOOGLE_CLIENT_ID;
  const clientSecret = c.env.OAUTH_GOOGLE_CLIENT_SECRET;
  const redirectUri = c.env.OAUTH_REDIRECT_URI ?? "https://policyctl-server.shivamkumar10958.workers.dev/api/auth/oauth/callback";

  if (!clientId || !clientSecret) {
    return c.json({ error: "OAuth not configured" }, 501);
  }

  // Exchange code for access token.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) return c.redirect("/login?error=token_exchange_failed");

  // Fetch user info.
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const googleUser = (await userRes.json()) as { email?: string; name?: string; verified_email?: boolean };
  if (!googleUser.email || googleUser.verified_email !== true) {
    return c.redirect("/login?error=email_unavailable");
  }

  // Find or create the user (OAuth flow — no password).
  const user = await upsertUser(c.env.DB, googleUser.email);
  setSessionCookie(c, user.token);
  await cachePutUser(c.env, user.token, user.id);
  return c.redirect("/dashboard", 302);
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

// ── Phase D: read daily compliance report ───────────────────────────
app.get(`${API}/report/daily`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await resolveOrg(c.env.DB, user.id, orgQuery(c));
  if (!org) return c.json({ error: "no org" }, 400);
  const cached = await c.env.POLICYCTL_CACHE.get(`report:daily:org:${org.id}`, "text");
  if (!cached) return c.json({ report: null, message: "No report yet. Next daily report at 9am UTC." });
  return c.json({ report: JSON.parse(cached) });
});

// ── Phase D: Cron Triggers — daily compliance report ────────────────
async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  // Daily at 9am UTC: scan all orgs, generate compliance summary
  const d1 = env.DB;

  // Get all orgs
  const orgs = (await d1.prepare("SELECT id, name FROM orgs").all()) as unknown as { results: { id: number; name: string }[] };

  for (const org of orgs.results) {
    const since = Date.now() - 24 * 3600 * 1000; // last 24h
    const totalRow = (await d1.prepare("SELECT COUNT(*) AS c FROM violations WHERE org_id = ? AND created_at >= ?").bind(org.id, since).first()) as { c: number };
    const total = totalRow?.c ?? 0;

    const byActor = (await d1.prepare("SELECT COALESCE(actor,'agent') AS actor, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY COALESCE(actor,'agent')").bind(org.id, since).all()) as unknown as { results: { actor: string; count: number }[] };

    const repeatOffenders = (await d1.prepare(
      `SELECT COALESCE(rule_id,'(unknown)') AS rule_id, COALESCE(repo,'(unknown)') AS repo, COUNT(*) AS count
       FROM violations WHERE org_id = ? AND created_at >= ?
       GROUP BY rule_id, repo HAVING count > 1 ORDER BY count DESC LIMIT 5`,
    ).bind(org.id, since).all()) as unknown as { results: { rule_id: string; repo: string; count: number }[] };

    // Store the report in KV for the dashboard to read
    const report = {
      generatedAt: Date.now(),
      period: "24h",
      total,
      byActor: byActor.results,
      repeatOffenders: repeatOffenders.results,
    };
    await env.POLICYCTL_CACHE.put(`report:daily:org:${org.id}`, JSON.stringify(report), { expirationTtl: 86400 * 7 });

    console.log(`[cron] Daily report for org ${org.id} (${org.name}): ${total} violations, ${repeatOffenders.results.length} repeat offenders`);
  }
}

export { PolicySession };
export default { fetch: app.fetch, scheduled };
