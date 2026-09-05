import { Hono } from "hono";
import type { Context } from "hono";
import Stripe from "stripe";
import type { Env, ReportResult, Role, User, Org, Subscription, Violation } from "./types.js";
import type { User as WebUser, OrgMember } from "@policyctl/types";
import type { BillingStatus } from "@policyctl/types";
import { bearerToken, orgQuery, verifyTurnstile } from "./auth.js";
import { verifyAuth0Token } from "./auth0.js";
import {
  addMember,
  analytics,
  createApiKey,
  createOrg,
  deleteOrg,
  getPolicy,
  getUserByToken,
  getOrCreateUserByAuth0Sub,
  listOrgs,
  listMembers,
  listVersions,
  listViolations,
  pushPolicy,
  reportViolations,
  resolveOrg,
  rollback,
  saveAiInsight,
  countAiInsights,
  toCsv,
  toWebOrg,
  toWebAnalytics,
  toWebPolicyVersion,
  toWebViolation,
  upsertUser,
  getOrgSubscription,
  getSeatCount,
  getRole,
  getOrgOwner,
  verifyApiKey,
  upsertSubscription,
  updateOrgSubscription,
  getSubscriptionByStripeId,
  updateMemberRole,
  removeMember,
  updateSubscriptionStatus,
} from "./store.js";
import { cacheGetPolicy, cacheGetUser, cacheInvalidatePolicy, cachePutPolicy, cachePutUser, cacheGetUserBySub, cachePutUserBySub } from "./cache.js";
import type { BillingPlan } from "./store.js";
import { analyzeDiff, authorRule } from "./ai.js";
import { PolicySession } from "./session.js";

const app = new Hono<{ Bindings: Env }>();
const API = "/api";

// Global error handler — return JSON so the SPA can parse errors.
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// ── CORS for /api (lets the dashboard SPA call cross-origin with credentials) ──
function allowedOrigins(env: Env): string[] {
  const raw = env.ALLOWED_ORIGINS;
  if (raw) return raw.split(",").map((o) => o.trim());
  return [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://policyctl-web.pages.dev",
  ];
}
app.use(`${API}/*`, async (c, next) => {
  await next();
  const origin = c.req.header("origin") ?? "";
  if (allowedOrigins(c.env).includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
  }
  c.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "content-type, authorization");
  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Max-Age", "86400");
});
app.options(`${API}/*`, (c) => {
  const origin = c.req.header("origin") ?? "";
  if (allowedOrigins(c.env).includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
  }
  c.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "content-type, authorization");
  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Max-Age", "86400");
  return c.body(null, 204);
});

// Map a server-side User row to the web app's User shape (string id, camelCase).
function toWebUser(u: User): WebUser {
  return { id: String(u.id), email: u.email, displayName: u.display_name, provider: u.provider };
}

function toWebOrgMember(row: { id: number; email: string; display_name: string | null; role: string; invited_at: number; accepted_at: number | null }): OrgMember {
  return {
    id: String(row.id),
    email: row.email,
    display_name: row.display_name,
    role: row.role as OrgMember["role"],
    invited_at: new Date(row.invited_at).toISOString(),
    accepted_at: row.accepted_at ? new Date(row.accepted_at).toISOString() : null,
    is_billable: row.role !== "viewer",
  };
}

// Extract the auth token from Authorization header or ?token= query param.
// No cookie-based session — Auth0 JWTs are passed as Bearer tokens.
function sessionToken(c: { env: Env; req: { header: (k: string) => string | undefined; query: (k: string) => string | undefined } }): string | null {
  return bearerToken(c as any);
}

/**
 * Resolve the authenticated user from the request.
 *
 * 1. Try Auth0 JWT verification (primary auth for the SPA). The access token
 *    is RS256-signed by Auth0 and verified against its JWKS. On success, we
 *    look up (or auto-provision) the user in D1 by auth0_sub.
 *
 * 1b. Try control-plane API keys (pc_live_*). Keys are org-bound: on success
 *    we act as the keyed org's owner and pin requestOrg() to that org, so a
 *    key can never reach another org even with ?org=.
 *
 * 2. Fall back to legacy token-based auth (CLI magic-link) for backward compat.
 */
async function requireUser(c: { env: Env; req: { header: (k: string) => string | undefined; query: (k: string) => string | undefined } }): Promise<User | null> {
  const token = sessionToken(c);
  if (!token) return null;

  // 1. Auth0 JWT path.
  const identity = await verifyAuth0Token(c.env, token);
  if (identity?.sub) {
    const cached = await cacheGetUserBySub(c.env, identity.sub);
    if (cached) return cached;
    const user = await getOrCreateUserByAuth0Sub(c.env.DB, identity.sub, identity.email ?? "", identity.name ?? null);
    await cachePutUserBySub(c.env, identity.sub, user);
    return user;
  }

  // 1b. API key path.
  if (token.startsWith("pc_live_")) {
    const orgId = await verifyApiKey(c.env.DB, token);
    if (orgId == null) return null;
    const owner = await getOrgOwner(c.env.DB, orgId);
    if (!owner) return null;
    (c as unknown as { set: (k: string, v: unknown) => void }).set?.("apiKeyOrgId", orgId);
    return owner;
  }

  // 2. Legacy token path (CLI magic-link backward compat).
  const cachedUid = await cacheGetUser(c.env, token);
  if (cachedUid != null) {
    const u = await getUserByToken(c.env.DB, token);
    if (u) return u;
  }
  const u = await getUserByToken(c.env.DB, token);
  if (u) await cachePutUser(c.env, token, u.id);
  return u;
}

const ORG_COLUMNS = `id, name, current_version, stripe_customer_id, stripe_sub_id,
  subscription_status, subscription_tier, seat_count, trial_ends_at,
  current_period_end, price_id, plan`;

/**
 * Org resolution for request handlers. API-key callers are pinned to the
 * keyed org (set by requireUser); everyone else resolves ?org= or primary.
 */
async function requestOrg(db: D1Database, c: Context, user: User): Promise<Org | null> {
  const keyed = (c as unknown as { get: (k: string) => unknown }).get?.("apiKeyOrgId") as number | undefined;
  if (keyed != null) {
    return (await db.prepare(`SELECT ${ORG_COLUMNS} FROM orgs WHERE id = ?`).bind(keyed).first()) as Org | null;
  }
  return resolveOrg(db, user.id, orgQuery(c));
}

/** True when the user holds one of the given roles in the org. */
async function hasOrgRole(db: D1Database, orgId: number, userId: number, allowed: Role[]): Promise<boolean> {
  const role = await getRole(db, orgId, userId);
  return role != null && allowed.includes(role);
}

// ── Auth (legacy CLI magic-link — kept for backward compat) ─────────
app.post(`${API}/login`, async (c) => {
  if (await rateLimited(c, "login", 10, 60)) {
    return c.json({ error: "Too many requests. Try again later." }, 429);
  }

  const body = (await c.req.json<{ email?: string; turnstile_token?: string }>().catch(() => ({}))) as {
    email?: string;
    turnstile_token?: string;
  };
  if (!body.email) return c.json({ error: "email required" }, 400);

  // Verify Turnstile if a token was provided (SPA forms).
  // CLI login (legacy magic-link) doesn't send a token yet — see AGENTS.md for auth unification plan.
  if (body.turnstile_token) {
    const ok = await verifyTurnstile(body.turnstile_token, c.env.TURNSTILE_SECRET_SITE);
    if (!ok) return c.json({ error: "Bot protection failed. Try again." }, 400);
  }

  const user = await upsertUser(c.env.DB, body.email);
  return c.json({ token: user.token, email: user.email, id: user.id });
});

// ── Auth (Auth0 JWT verification — see auth0.ts) ─────────────────────
// Auth0 handles signup/login/logout/social OAuth on the frontend via
// @auth0/auth0-react (Universal Login). The Worker only verifies the
// resulting JWT bearer token. Legacy CLI magic-link via /api/login is kept.

/** GET /api/me — returns the authenticated user (Auth0 JWT or legacy token), or null. */
app.get(`${API}/me`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ user: null });
  return c.json({ user: toWebUser(user) });
});

// ── Public: Auth0 device-flow config for the CLI ───────────────────────
// Returns the Auth0 tenant domain, a public client_id (device-flow enabled),
// and the API audience so the CLI can run `device/code` → `oauth/token` without
// hardcoding tenant details. No auth required — all values are public.
app.get(`${API}/auth0/config`, async (c) => {
  const domain = c.env.AUTH0_DOMAIN;
  const audience = c.env.AUTH0_AUDIENCE;
  if (!domain || !audience) {
    return c.json({ error: "Auth0 not configured on the server" }, 503);
  }
  // The CLI uses its own device-flow client_id (a Native-type Auth0 application
  // with the Device Code grant). Fail closed when unset — an empty string or
  // the SPA audience here would make every `policyctl login` fail at Auth0.
  const cliClientId = c.env.AUTH0_CLI_CLIENT_ID;
  if (!cliClientId) {
    return c.json({ error: "CLI device login is not configured on the server" }, 503);
  }
  return c.json({ domain, client_id: cliClientId, audience });
});

// Simple KV-based rate limiter keyed by IP. Used for AI endpoints (Phase D).
async function rateLimited(c: { env: Env; req: { header: (k: string) => string | undefined } }, key: string, limit = 10, window = 60): Promise<boolean> {
  const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const cacheKey = `rl:${key}:${ip}`;
  const current = Number((await c.env.POLICYCTL_CACHE.get(cacheKey)) ?? "0");
  if (current >= limit) return true;
  await c.env.POLICYCTL_CACHE.put(cacheKey, String(current + 1), { expirationTtl: window });
  return false;
}

// ── Stripe helper (lazy singleton per Worker instance) ──────────────────────

let _stripe: Stripe | null = null;
function getStripe(env: Env): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (_stripe) return _stripe;
  _stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  return _stripe;
}

/**
 * Determine if an org is in good standing. `past_due` keeps access during
 * Stripe Smart Retries; access is revoked on `unpaid`/`canceled`/`incomplete`.
 */
export function isOrgActive(org: Org | null): boolean {
  if (!org) return false;
  const s = org.subscription_status;
  return s === "active" || s === "trialing" || s === "past_due";
}

/** Map a Stripe price ID to our internal plan name (growth default). */
export function priceIdToPlan(env: Env, priceId: string | null): BillingPlan {
  if (!priceId) return "growth";
  if (priceId === env.STRIPE_PRICE_ID_PRO_MONTHLY || priceId === env.STRIPE_PRICE_ID_PRO_ANNUAL) {
    return "pro";
  }
  return "growth";
}

/**
 * Push the current billable seat count to Stripe. Best-effort: failures are
 * logged but never break the member mutation (D1 stays the source of truth).
 */
async function syncStripeSeats(env: Env, db: D1Database, orgId: number): Promise<void> {
  try {
    const stripeClient = getStripe(env);
    if (!stripeClient) return;
    const row = (await db
      .prepare("SELECT stripe_sub_id FROM orgs WHERE id = ?")
      .bind(orgId)
      .first()) as { stripe_sub_id: string | null } | null;
    if (!row?.stripe_sub_id) return;
    const seats = Math.max(await getSeatCount(db, orgId), 1);
    const sub = await stripeClient.subscriptions.retrieve(row.stripe_sub_id);
    const item = sub.items.data[0];
    if (!item || item.quantity === seats) return;
    await stripeClient.subscriptions.update(row.stripe_sub_id, {
      items: [{ id: item.id, quantity: seats }],
      proration_behavior: "create_prorations",
    });
    console.log(`[billing] synced org ${orgId} seats -> ${seats}`);
  } catch (err: any) {
    console.error(`[billing] seat sync failed for org ${orgId}: ${err?.message ?? err}`);
  }
}

/** Get the frontend origin for redirects (from request origin or env). */
function frontendOrigin(c: { env: Env; req: { header: (k: string) => string | undefined } }): string {
  const fromEnv = c.env.ALLOWED_ORIGINS;
  if (fromEnv) {
    // Use the first non-localhost origin as the production frontend URL.
    const origins = fromEnv.split(",").map((o) => o.trim());
    const prod = origins.find((o) => !o.includes("localhost"));
    if (prod) return prod;
    return origins[0];
  }
  return "https://policyctl-web.pages.dev";
}

// ── Policy (org-scoped; defaults to the user's primary org) ──────────
app.post(`${API}/policy`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json<{ yaml?: string; note?: string }>().catch(() => ({}))) as { yaml?: string; note?: string };
  if (typeof body.yaml !== "string") return c.json({ error: "yaml required" }, 400);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin", "member"]))) {
    return c.json({ error: "forbidden" }, 403);
  }
  const v = await pushPolicy(c.env.DB, org.id, body.yaml, user.id, body.note);
  await cacheInvalidatePolicy(c.env, org.id);
  return c.json({ ok: true, version: v.version, id: v.id });
});

app.get(`${API}/policy`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
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
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  const rows = await listVersions(c.env.DB, org.id);
  return c.json(rows.map(toWebPolicyVersion));
});

app.post(`${API}/policy/versions/:id/rollback`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin", "member"]))) {
    return c.json({ error: "forbidden" }, 403);
  }
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
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin", "member"]))) {
    return c.json({ error: "forbidden" }, 403);
  }
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
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  const includeDismissed = c.req.query("include_dismissed") === "1";
  const rows = await listViolations(c.env.DB, org.id, 200, includeDismissed);
  return c.json(rows.map(toWebViolation));
});

app.get(`${API}/violations/:id`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  const id = Number(c.req.param("id"));
  const row = (await c.env.DB.prepare("SELECT * FROM violations WHERE id = ? AND org_id = ?").bind(id, org.id).first()) as Violation | null;
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json(toWebViolation(row));
});

app.post(`${API}/violations/:id/dismiss`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin", "member"]))) {
    return c.json({ error: "forbidden" }, 403);
  }
  const id = Number(c.req.param("id"));
  const body = (await c.req.json<{ reason?: string }>().catch(() => ({}))) as { reason?: string };
  const r = (await c.env.DB.prepare("UPDATE violations SET dismissed_at = ?, dismissed_by = ?, dismiss_reason = ? WHERE id = ? AND org_id = ?")
    .bind(Date.now(), user.id, body.reason ?? "", id, org.id)
    .run()) as unknown as { meta?: { changes?: number } };
  if (!r.meta?.changes) return c.json({ error: "not found" }, 404);
  return c.json({ ok: true });
});

// ── Phase C: analytics ───────────────────────────────────────────────
app.get(`${API}/analytics`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  const days = Number(c.req.query("days") ?? 30);
  const a = await analytics(c.env.DB, org.id, days);
  const violations24h = (await c.env.DB.prepare(
    "SELECT COUNT(*) AS c FROM violations WHERE org_id = ? AND created_at >= ? AND dismissed_at IS NULL",
  ).bind(org.id, Date.now() - 86400000).first<{ c: number }>())?.c ?? 0;
  // active_sessions: distinct agents seen in the last 24h (proxy for live sessions).
  const activeSessionsRow = (await c.env.DB.prepare(
    "SELECT COUNT(DISTINCT agent) AS c FROM violations WHERE org_id = ? AND created_at >= ? AND dismissed_at IS NULL",
  ).bind(org.id, Date.now() - 86400000).first<{ c: number }>())?.c ?? 0;
  const aiInsights = await countAiInsights(c.env.DB, org.id);
  return c.json(toWebAnalytics(a, violations24h, activeSessionsRow, aiInsights));
});

// ── Phase D: Workers AI — semantic policy intelligence (paid-only) ──
app.post(`${API}/ai/analyze`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  if (await rateLimited(c, "ai-analyze", 30, 60)) {
    return c.json({ error: "Rate limited. Try again in a minute." }, 429);
  }
  const body = (await c.req.json<{ diff?: string; policy?: string; repo?: string }>().catch(() => ({}))) as { diff?: string; policy?: string; repo?: string };
  if (typeof body.diff !== "string") return c.json({ error: "diff required" }, 400);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  // Gate: AI features require a paid subscription (active, trial, or past_due
  // grace during Stripe retries).
  if (!isOrgActive(org)) {
    return c.json({ error: "AI features require a paid subscription. Visit /dashboard/billing to upgrade.", code: "UPGRADE_REQUIRED" }, 403);
  }
  const currentPolicy = body.policy ?? (await getPolicy(c.env.DB, org.id));
  const result = await analyzeDiff(c.env, body.diff, currentPolicy, body.repo ?? "");
  await saveAiInsight(c.env.DB, org.id, "analyze", body.diff, result);
  return c.json(result);
});

app.post(`${API}/ai/author`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  if (await rateLimited(c, "ai-author", 30, 60)) {
    return c.json({ error: "Rate limited. Try again in a minute." }, 429);
  }
  const body = (await c.req.json<{ intent?: string }>().catch(() => ({}))) as { intent?: string };
  if (typeof body.intent !== "string") return c.json({ error: "intent required" }, 400);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  // Gate: AI features require an active or trial paid subscription.
  if (!isOrgActive(org)) {
    return c.json({ error: "AI features require a paid subscription. Visit /dashboard/billing to upgrade.", code: "UPGRADE_REQUIRED" }, 403);
  }
  const result = await authorRule(c.env, body.intent);
  await saveAiInsight(c.env.DB, org.id, "author", body.intent, result);
  return c.json(result);
});

// ── Phase C: export violations (CSV download, no storage required) ──
app.get(`${API}/export/violations.csv`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  const rows = await listViolations(c.env.DB, org.id, 5000);
  const csv = toCsv(rows);
  // Stream the CSV directly — no object storage needed.
  return new Response(csv, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": `attachment; filename="policyctl-violations-org-${org.id}.csv"`,
    },
  });
});

// ── Orgs & members ───────────────────────────────────────────────────
app.get(`${API}/orgs`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const orgs = await listOrgs(c.env.DB, user.id);
  return c.json({ orgs: orgs.map(toWebOrg) });
});

app.post(`${API}/orgs`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json<{ name?: string }>().catch(() => ({}))) as { name?: string };
  if (!body.name) return c.json({ error: "name required" }, 400);
  const org = await createOrg(c.env.DB, user.id, body.name);
  return c.json({ org: toWebOrg(org) }, 201);
});

app.post(`${API}/orgs/:id/members`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const orgId = Number(c.req.param("id"));
  const body = (await c.req.json<{ email?: string; role?: Role }>().catch(() => ({}))) as { email?: string; role?: Role };
  if (!body.email || !body.role) return c.json({ error: "email and role required" }, 400);
  const res = await addMember(c.env.DB, orgId, user.id, body.email, body.role);
  if (!res.ok) return c.json({ error: res.error }, 403);

  // Recalculate billable seats and update the org's seat count.
  const seats = await getSeatCount(c.env.DB, orgId);
  await c.env.DB
    .prepare("UPDATE orgs SET seat_count = ? WHERE id = ?")
    .bind(seats, orgId)
    .run();
  await syncStripeSeats(c.env, c.env.DB, orgId);
  return c.json({ ok: true, seats });
});

app.get(`${API}/orgs/:id/members`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const orgId = Number(c.req.param("id"));
  // Verify membership.
  const member = await resolveOrg(c.env.DB, user.id, orgId);
  if (!member || member.id !== orgId) return c.json({ error: "forbidden" }, 403);
  const rows = await listMembers(c.env.DB, orgId);
  return c.json({ members: rows.map(toWebOrgMember) });
});

app.patch(`${API}/orgs/:id/members/:userId`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const orgId = Number(c.req.param("id"));
  const targetId = Number(c.req.param("userId"));
  const body = (await c.req.json<{ role?: Role }>().catch(() => ({}))) as { role?: Role };
  if (!body.role) return c.json({ error: "role required" }, 400);
  const res = await updateMemberRole(c.env.DB, orgId, user.id, targetId, body.role);
  if (!res.ok) return c.json({ error: res.error }, 403);
  // Role changes can move members across the billable line (viewer <-> member).
  const seats = await getSeatCount(c.env.DB, orgId);
  await c.env.DB
    .prepare("UPDATE orgs SET seat_count = ? WHERE id = ?")
    .bind(seats, orgId)
    .run();
  await syncStripeSeats(c.env, c.env.DB, orgId);
  return c.json({ ok: true, seats });
});

app.delete(`${API}/orgs/:id/members/:userId`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const orgId = Number(c.req.param("id"));
  const targetId = Number(c.req.param("userId"));
  const res = await removeMember(c.env.DB, orgId, user.id, targetId);
  if (!res.ok) return c.json({ error: res.error }, 403);

  // Recalculate billable seats.
  const seats = await getSeatCount(c.env.DB, orgId);
  await c.env.DB
    .prepare("UPDATE orgs SET seat_count = ? WHERE id = ?")
    .bind(seats, orgId)
    .run();
  await syncStripeSeats(c.env, c.env.DB, orgId);
  return c.json({ ok: true, seats });
});

// ── Billing: subscription status ───────────────────────────────────────────
app.get(`${API}/billing/status`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  const subInfo = await getOrgSubscription(c.env.DB, org.id);
  if (!subInfo || !subInfo.org) return c.json({ error: "no org" }, 400);

  const { org: orgRow, subscription, seat_count } = subInfo;
  const is_trial = orgRow.subscription_status === "trialing";
  const is_paid = orgRow.subscription_tier === "paid" && isOrgActive(orgRow);

  let days_remaining: number | null = null;
  if (orgRow.trial_ends_at) {
    days_remaining = Math.max(0, Math.ceil((orgRow.trial_ends_at - Date.now()) / 86400000));
  }

  const plan = (orgRow.plan as "free" | "growth") ||
    (subscription?.plan as "free" | "growth") || "free";

  const status: BillingStatus = {
    subscription: subscription
      ? {
          id: String(subscription.id),
          stripe_sub_id: subscription.stripe_sub_id,
          status: subscription.status as any,
          tier: subscription.tier as any,
          plan: subscription.plan as "growth",
          seat_count: subscription.seat_count,
          price_id: subscription.price_id,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          trial_start: subscription.trial_start,
          trial_end: subscription.trial_end,
          cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
          canceled_at: subscription.canceled_at,
          created_at: subscription.created_at,
          updated_at: subscription.updated_at,
        }
      : null,
    is_paid,
    is_trial,
    days_remaining_in_trial: days_remaining,
    seat_count: seat_count,
    plan,
    has_api_key: Boolean(orgRow.api_key_hash),
  };

  return c.json(status);
});

// ── Billing: create Stripe Checkout Session ────────────────────────────────
app.post(`${API}/billing/checkout`, async (c) => {
  if (await rateLimited(c, "billing-checkout", 10, 60)) {
    return c.json({ error: "Too many requests. Try again later." }, 429);
  }

  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin"]))) {
    return c.json({ error: "forbidden" }, 403);
  }

  // Guard: if this org already has an active or trial subscription, redirect
  // to the billing portal instead of creating a duplicate subscription.
  if (isOrgActive(org)) {
    return c.json({
      error: "You already have an active subscription. Manage it from the billing page.",
      code: "SUBSCRIPTION_EXISTS",
    }, 409);
  }

  const stripeClient = getStripe(c.env);
  if (!stripeClient) {
    return c.json({ error: "Billing not configured. Contact support." }, 503);
  }

  // Create a Stripe customer if this org doesn't have one yet.
  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripeClient.customers.create({
      email: user.email,
      name: `${org.name} (${user.email})`,
      metadata: {
        policyctl_org_id: String(org.id),
        policyctl_user_id: String(user.id),
      },
    });
    customerId = customer.id;
    await c.env.DB
      .prepare("UPDATE orgs SET stripe_customer_id = ? WHERE id = ?")
      .bind(customerId, org.id)
      .run();
    org.stripe_customer_id = customerId;
  }

  // Count current billable seats (non-viewer members).
  const seatCount = await getSeatCount(c.env.DB, org.id);

  // Determine plan + interval from the JSON request body.
  // (Previously read from query params on a POST request, which were never populated.)
  const body = (await c.req.json<{ plan?: string; interval?: string }>().catch(() => ({}) )) as {
    plan?: string;
    interval?: string;
  };
  const plan = "growth" as "growth";
  const interval = body.interval === "annual" ? "annual" : "monthly";
  const priceId =
    interval === "annual"
      ? c.env.STRIPE_PRICE_ID_GROWTH_ANNUAL
      : c.env.STRIPE_PRICE_ID_GROWTH_MONTHLY;
  if (!priceId) {
    return c.json({ error: "No price configured for this plan. Contact support." }, 503);
  }

  // Select payment method types based on locale: Chinese users get Alipay + WeChat Pay,
  // everyone else gets the standard card flow. Stripe Checkout supports 40+ methods.
  const locale = c.req.header("accept-language")?.split(",")[0]?.trim() ?? "";
  const isChinese = locale.startsWith("zh");
  const paymentMethodTypes = isChinese
    ? ["card", "alipay", "wechat_pay"]
    : ["card"];

  const origin = frontendOrigin(c);
  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: paymentMethodTypes as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
    line_items: [
      {
        price: priceId,
        quantity: Math.max(seatCount, 1), // at least 1 seat
      },
    ],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        policyctl_org_id: String(org.id),
        policyctl_plan: plan,
      },
    },
    success_url: `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/billing`,
    automatic_tax: { enabled: true },
    metadata: {
      policyctl_org_id: String(org.id),
      policyctl_user_id: String(user.id),
      interval,
      plan,
    },
  });

  return c.json({ url: session.url });
});

// ── Billing: Stripe Customer Portal ────────────────────────────────────────
app.post(`${API}/billing/portal`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin"]))) {
    return c.json({ error: "forbidden" }, 403);
  }

  const stripeClient = getStripe(c.env);
  if (!stripeClient) {
    return c.json({ error: "Billing not configured. Contact support." }, 503);
  }

  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripeClient.customers.create({
      email: user.email,
      name: `${org.name} (${user.email})`,
      metadata: {
        policyctl_org_id: String(org.id),
        policyctl_user_id: String(user.id),
      },
    });
    customerId = customer.id;
    await c.env.DB
      .prepare("UPDATE orgs SET stripe_customer_id = ? WHERE id = ?")
      .bind(customerId, org.id)
      .run();
  }

  const origin = frontendOrigin(c);
  const portal = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard/billing`,
  });

  return c.json({ url: portal.url });
});

// ── Billing: generate control-plane API key ──────────────────────────────────
app.post(`${API}/billing/api-key`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin"]))) {
    return c.json({ error: "forbidden" }, 403);
  }

  const key = await createApiKey(c.env.DB, org.id);
  return c.json({ key });
});

// ── Orgs: delete (cascade) ──────────────────────────────────────────────────
app.delete(`${API}/orgs/:id`, async (c) => {
  if (await rateLimited(c, "org-delete", 5, 60)) {
    return c.json({ error: "Too many requests. Try again later." }, 429);
  }

  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const orgId = Number(c.req.param("id"));
  if (!orgId) return c.json({ error: "invalid org id" }, 400);

  // Only the org owner can delete (explicit role check — membership alone is not enough).
  const org = await requestOrg(c.env.DB, c, user);
  if (!org || org.id !== orgId) return c.json({ error: "no org" }, 403);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner"]))) {
    return c.json({ error: "forbidden" }, 403);
  }

  // Delete the Stripe customer if one exists (cancels any subscription).
  const stripeClient = getStripe(c.env);
  if (org.stripe_customer_id && stripeClient) {
    try {
      await stripeClient.customers.del(org.stripe_customer_id, {
        invoice_now: true,
        prorate: true,
      });
    } catch (err: any) {
      console.error(`Failed to delete Stripe customer ${org.stripe_customer_id}: ${err.message}`);
    }
  }

  await deleteOrg(c.env.DB, orgId);
  return c.json({ ok: true });
});

// ── Billing: Stripe webhook ────────────────────────────────────────────────
// This route receives raw body for Stripe signature verification.
app.post(`${API}/webhook/stripe`, async (c) => {
  const stripeClient = getStripe(c.env);
  if (!stripeClient || !c.env.STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: "Billing not configured" }, 503);
  }

  const rawBody = await c.req.text();
  const sig = c.req.header("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = (stripeClient as any).webhooks.constructEvent(rawBody, sig, c.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return c.json({ error: "Invalid signature" }, 400);
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = Number(sub.metadata?.policyctl_org_id);
      if (!orgId) {
        console.error(`Webhook: subscription ${sub.id} has no policyctl_org_id metadata`);
        break;
      }

      let internalStatus: string;
      if (sub.canceled_at) {
        internalStatus = "canceled";
      } else if (sub.status === "incomplete") {
        internalStatus = "incomplete";
      } else if (sub.trial_end && sub.trial_end > Math.floor(Date.now() / 1000)) {
        internalStatus = "trialing";
      } else if (sub.status === "active") {
        internalStatus = "active";
      } else {
        internalStatus = "past_due";
      }

      const priceId = sub.items.data[0]?.price?.id ?? null;
      const customerId = sub.customer as string;
      const plan = priceIdToPlan(c.env, priceId);

      await updateOrgSubscription(c.env.DB, orgId, {
        stripe_customer_id: customerId,
        stripe_sub_id: sub.id,
        status: internalStatus,
        tier: "paid",
        plan,
        seat_count: sub.items.data[0]?.quantity ?? 1,
        trial_ends_at: sub.trial_end ? sub.trial_end * 1000 : null,
        current_period_end: sub.current_period_end ? sub.current_period_end * 1000 : null,
        price_id: priceId,
      });

      await upsertSubscription(c.env.DB, orgId, {
        stripe_sub_id: sub.id,
        status: internalStatus,
        tier: "paid",
        plan,
        seat_count: sub.items.data[0]?.quantity ?? 1,
        price_id: priceId,
        current_period_start: sub.current_period_start ? sub.current_period_start * 1000 : null,
        current_period_end: sub.current_period_end ? sub.current_period_end * 1000 : null,
        trial_start: sub.trial_start ? sub.trial_start * 1000 : null,
        trial_end: sub.trial_end ? sub.trial_end * 1000 : null,
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
        canceled_at: sub.canceled_at ? sub.canceled_at * 1000 : null,
      });

      console.log(`[webhook] ${event.type}: org ${orgId}, status ${internalStatus}`);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoice.subscription as string;
      const sub = await getSubscriptionByStripeId(c.env.DB, subId);
      if (sub) {
        const plan = sub.plan || priceIdToPlan(c.env, sub.price_id);
        await updateOrgSubscription(c.env.DB, sub.org_id, {
          status: "active",
          tier: "paid",
          plan,
          seat_count: sub.seat_count,
          trial_ends_at: null,
          current_period_end: sub.current_period_end,
          price_id: sub.price_id,
        });
        await updateSubscriptionStatus(c.env.DB, subId, "active");
      }
      console.log(`[webhook] invoice.payment_succeeded: sub ${subId}, org ${sub?.org_id}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoice.subscription as string;
      const sub = await getSubscriptionByStripeId(c.env.DB, subId);
      if (sub) {
        const plan = sub.plan || priceIdToPlan(c.env, sub.price_id);
        await updateOrgSubscription(c.env.DB, sub.org_id, {
          status: "past_due",
          tier: "paid",
          plan,
          seat_count: sub.seat_count,
          trial_ends_at: sub.trial_end ?? null,
          current_period_end: sub.current_period_end,
          price_id: sub.price_id,
        });
        await updateSubscriptionStatus(c.env.DB, subId, "past_due");
      }
      console.log(`[webhook] invoice.payment_failed: sub ${subId}, org ${sub?.org_id}`);
      break;
    }

    case "customer.subscription.trial_will_end": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = Number(sub.metadata?.policyctl_org_id);
      if (orgId) {
        await updateOrgSubscription(c.env.DB, orgId, {
          status: "trialing",
          tier: "paid",
          plan: priceIdToPlan(c.env, sub.items.data[0]?.price?.id ?? null),
          seat_count: sub.items.data[0]?.quantity ?? 1,
          trial_ends_at: sub.trial_end ? sub.trial_end * 1000 : null,
          current_period_end: sub.current_period_end ? sub.current_period_end * 1000 : null,
          price_id: sub.items.data[0]?.price?.id ?? null,
        });
      }
      console.log(`[webhook] trial_will_end: org ${orgId}, trial_end ${sub.trial_end}`);
      break;
    }

    default:
      console.log(`[webhook] unhandled event type: ${event.type}`);
  }

  return c.json({ received: true });
});

// ── Root redirect → SPA ──────────────────────────────────────────────
// The server-rendered dashboard (dashboard.ts) is deprecated. The SPA is
// the canonical experience, hosted separately. Redirect root to it.
app.get("/", async (c) => {
  const origin = frontendOrigin(c);
  return c.redirect(origin, 302);
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
  const org = await requestOrg(c.env.DB, c, user);
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
  const org = await requestOrg(c.env.DB, c, user);
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
  const org = await requestOrg(c.env.DB, c, user);
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
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  const cached = await c.env.POLICYCTL_CACHE.get(`report:daily:org:${org.id}`, "text");
  if (!cached) return c.json({ report: null, message: "No report yet. Next daily report at 9am UTC." });
  return c.json({ report: JSON.parse(cached) });
});

// ── Phase D: Re-generate daily compliance report on demand ────────────
// Regenerates the report from current data and stores it in KV.
// (Email delivery is not yet wired — the report is refreshed and visible in the dashboard.)
async function archiveDailyReport(
  env: Env,
  orgId: number,
  report: Record<string, unknown>,
): Promise<void> {
  // Best-effort: archives never break report generation (D1/KV stay primary).
  try {
    const { storageConfig, storagePut } = await import("./storage.js");
    const cfg = storageConfig(env);
    if (!cfg) return;
    const day = new Date().toISOString().slice(0, 10);
    await storagePut(
      cfg,
      `reports/daily/${orgId}/${day}.json`,
      new TextEncoder().encode(JSON.stringify(report)),
      "application/json",
    );
  } catch (err) {
    console.error(`Report archive failed for org ${orgId}: ${err instanceof Error ? err.message : err}`);
  }
}
app.post(`${API}/report/daily/resend`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin"]))) {
    return c.json({ error: "forbidden" }, 403);
  }

  const since = Date.now() - 24 * 3600 * 1000;
  const totalRow = (await c.env.DB.prepare(
    "SELECT COUNT(*) AS c FROM violations WHERE org_id = ? AND created_at >= ?",
  ).bind(org.id, since).first<{ c: number }>()) as { c: number } | null;
  const total = totalRow?.c ?? 0;

  const byActor = (await c.env.DB.prepare(
    "SELECT COALESCE(actor,'agent') AS actor, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY COALESCE(actor,'agent')",
  ).bind(org.id, since).all()) as unknown as { results: { actor: string; count: number }[] };

  const repeatOffenders = (await c.env.DB.prepare(
    `SELECT COALESCE(rule_id,'(unknown)') AS rule_id, COALESCE(repo,'(unknown)') AS repo, COUNT(*) AS count
     FROM violations WHERE org_id = ? AND created_at >= ?
     GROUP BY rule_id, repo HAVING count > 1 ORDER BY count DESC LIMIT 5`,
  ).bind(org.id, since).all()) as unknown as { results: { rule_id: string; repo: string; count: number }[] };

  const aiInsightsRow = await c.env.DB
    .prepare("SELECT COUNT(*) AS c FROM ai_insights WHERE org_id = ? AND created_at >= ?")
    .bind(org.id, since)
    .first<{ c: number }>();
  const aiInsightsCount = aiInsightsRow?.c ?? 0;

  const report = {
    generatedAt: Date.now(),
    period: "24h",
    total,
    byActor: byActor.results,
    repeatOffenders: repeatOffenders.results,
    aiInsights: aiInsightsCount,
  };
  await c.env.POLICYCTL_CACHE.put(`report:daily:org:${org.id}`, JSON.stringify(report), { expirationTtl: 86400 * 7 });
  await archiveDailyReport(c.env, org.id, report);

  return c.json({ ok: true, message: "Report refreshed. Email delivery is coming soon." });
});

// ── Waitlist (free-launch mode: premium is coming soon, no payments yet) ──
// Signups persist in D1 and are viewable via GET /api/waitlist (owner/admin).
// Owner email notifications were deliberately removed (inbox noise); a CRM
// follow-up comes later.
const EMAIL_RE_WAITLIST = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post(`${API}/waitlist`, async (c) => {
  if (await rateLimited(c, "waitlist", 5, 3600)) {
    return c.json({ error: "Too many requests. Try again later." }, 429);
  }
  const body = (await c.req.json<{ email?: string; name?: string; interest?: string; source?: string }>().catch(() => ({}))) as {
    email?: string;
    name?: string;
    interest?: string;
    source?: string;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE_WAITLIST.test(email)) return c.json({ error: "valid email required" }, 400);
  const name = (body.name ?? "").trim().slice(0, 120) || null;
  const interest = (body.interest ?? "").trim().slice(0, 40) || null;
  const source = (body.source ?? "").trim().slice(0, 40) || null;

  const r = (await c.env.DB.prepare(
    "INSERT INTO waitlist (email, name, interest, source, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING",
  )
    .bind(email, name, interest, source, Date.now())
    .run()) as unknown as { meta?: { changes?: number; last_row_id?: number } };
  if (!r.meta?.changes) return c.json({ ok: true, duplicate: true });

  const pos = (await c.env.DB.prepare("SELECT COUNT(*) AS c FROM waitlist WHERE id <= ?")
    .bind(Number(r.meta.last_row_id))
    .first<{ c: number }>()) as { c: number } | null;
  const position = pos?.c ?? 1;
  return c.json({ ok: true, position });
});

app.get(`${API}/report/daily/archives`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const org = await requestOrg(c.env.DB, c, user);
  if (!org) return c.json({ error: "no org" }, 400);
  if (!(await hasOrgRole(c.env.DB, org.id, user.id, ["owner", "admin"]))) {
    return c.json({ error: "forbidden" }, 403);
  }
  try {
    const { storageConfig, storageList } = await import("./storage.js");
    const cfg = storageConfig(c.env);
    if (!cfg) return c.json({ archives: [], configured: false });
    const keys = await storageList(cfg, `reports/daily/${org.id}/`);
    return c.json({ archives: keys.slice(-90), configured: true });
  } catch (err) {
    return c.json({ error: `archive list failed: ${err instanceof Error ? err.message : err}` }, 502);
  }
});

app.get(`${API}/waitlist`, async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  // Global list: any owner/admin of any org may view it.
  const privileged = (await c.env.DB.prepare(
    "SELECT 1 FROM org_members WHERE user_id = ? AND role IN ('owner', 'admin') LIMIT 1",
  )
    .bind(user.id)
    .first()) as unknown | null;
  if (!privileged) return c.json({ error: "forbidden" }, 403);
  const rows = (await c.env.DB.prepare(
    "SELECT id, email, name, interest, source, created_at FROM waitlist ORDER BY id DESC LIMIT 500",
  ).all()) as unknown as {
    results: { id: number; email: string; name: string | null; interest: string | null; source: string | null; created_at: number }[];
  };
  return c.json({
    total: rows.results.length,
    signups: rows.results.map((w) => ({
      id: w.id,
      email: w.email,
      name: w.name,
      interest: w.interest,
      source: w.source,
      created_at: new Date(w.created_at).toISOString(),
    })),
  });
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

    const aiInsightsRow = await d1
      .prepare("SELECT COUNT(*) AS c FROM ai_insights WHERE org_id = ? AND created_at >= ?")
      .bind(org.id, since)
      .first<{ c: number }>();
    const aiInsightsCount = aiInsightsRow?.c ?? 0;

    // Store the report in KV for the dashboard to read
    const report = {
      generatedAt: Date.now(),
      period: "24h",
      total,
      byActor: byActor.results,
      repeatOffenders: repeatOffenders.results,
      aiInsights: aiInsightsCount,
    };
    await env.POLICYCTL_CACHE.put(`report:daily:org:${org.id}`, JSON.stringify(report), { expirationTtl: 86400 * 7 });
    await archiveDailyReport(env, org.id, report);

    console.log(`[cron] Daily report for org ${org.id} (${org.name}): ${total} violations, ${repeatOffenders.results.length} repeat offenders, ${aiInsightsCount} AI insights`);
  }
}

export { PolicySession };
export default { fetch: app.fetch, scheduled };
