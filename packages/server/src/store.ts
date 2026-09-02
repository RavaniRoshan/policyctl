import type {
  Env,
  Org,
  PolicyVersion,
  ReportResult,
  Role,
  User,
  Violation,
  Subscription,
} from "./types.js";
import type {
  Analytics as WebAnalytics,
  Violation as WebViolation,
  PolicyVersion as WebPolicyVersion,
  Org as WebOrg,
} from "@policyctl/types";
import { hashPassword, newToken } from "./auth.js";

const now = () => Date.now();

// ── Users ──────────────────────────────────────────────────────────────

export async function getUserByToken(db: D1Database, token: string): Promise<User | null> {
  if (!token) return null;
  const row = (await db
    .prepare(
      `SELECT id, email, token, auth0_sub, display_name, provider, password_hash
       FROM users WHERE token = ?`,
    )
    .bind(token)
    .first()) as User | null;
  return row ?? null;
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const row = (await db
    .prepare(
      `SELECT id, email, token, auth0_sub, display_name, provider, password_hash
       FROM users WHERE email = ?`,
    )
    .bind(email)
    .first()) as User | null;
  return row ?? null;
}

export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  const row = (await db
    .prepare(
      `SELECT id, email, token, auth0_sub, display_name, provider, password_hash
       FROM users WHERE id = ?`,
    )
    .bind(id)
    .first()) as User | null;
  return row ?? null;
}

/** Look up a user by their Auth0 sub claim. */
export async function getUserByAuth0Sub(db: D1Database, auth0Sub: string): Promise<User | null> {
  const row = (await db
    .prepare(
      `SELECT id, email, token, auth0_sub, display_name, provider, password_hash
       FROM users WHERE auth0_sub = ?`,
    )
    .bind(auth0Sub)
    .first()) as User | null;
  return row ?? null;
}

/**
 * Look up an existing Auth0 user by email. Used when an Auth0 account
 * was previously created via the CLI magic-link flow and then upgraded
 * to Auth0 SSO — we link the auth0_sub to the existing D1 row.
 */
export async function getUserByEmailForLinking(db: D1Database, email: string): Promise<User | null> {
  const row = (await db
    .prepare(
      `SELECT id, email, token, auth0_sub, display_name, provider, password_hash
       FROM users WHERE email = ?`,
    )
    .bind(email)
    .first()) as User | null;
  return row ?? null;
}

/**
 * Get or create a user from an Auth0 identity. If a user with the same
 * auth0_sub already exists, return it. If a user with the same email exists
 * but lacks an auth0_sub, link the auth0_sub to that user (account linking).
 * Otherwise, create a new user + auto-provisioned org.
 */
export async function getOrCreateUserByAuth0Sub(
  db: D1Database,
  auth0Sub: string,
  email: string,
  displayName: string | null,
): Promise<User> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  // 1. Direct lookup by auth0_sub.
  const existing = await getUserByAuth0Sub(db, auth0Sub);
  if (existing) return existing;

  // 2. Try to link to an existing email-based user (account linking).
  const byEmail = await getUserByEmailForLinking(db, email);
  if (byEmail && byEmail.auth0_sub == null) {
    await db
      .prepare("UPDATE users SET auth0_sub = ?, display_name = COALESCE(?, display_name), provider = 'auth0' WHERE id = ?")
      .bind(auth0Sub, displayName, byEmail.id)
      .run();
    return { ...byEmail, auth0_sub: auth0Sub, display_name: displayName ?? byEmail.display_name, provider: "auth0" };
  }

  // 3. Brand-new user: create + auto-provision org.
  const token = newToken();
  const ts = now();
  const r = await db
    .prepare(
      `INSERT INTO users (email, token, auth0_sub, password_hash, display_name, provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(email, token, auth0Sub, null, displayName, "auth0", ts)
    .run();
  const userId = Number(r.meta.last_row_id);

  // Auto-provision a personal org.
  const local = email.split("@")[0] || "user";
  const orgName = `${displayName ?? local}'s org`;
  const o = await db
    .prepare("INSERT INTO orgs (name, current_version, created_at) VALUES (?, ?, ?)")
    .bind(orgName, null, ts)
    .run();
  const orgId = Number(o.meta.last_row_id);

  await db
    .prepare("INSERT INTO org_members (org_id, user_id, role, created_at) VALUES (?, ?, ?, ?)")
    .bind(orgId, userId, "owner", ts)
    .run();

  return {
    id: userId,
    email,
    token,
    auth0_sub: auth0Sub,
    display_name: displayName,
    provider: "auth0",
    password_hash: null,
  };
}

/** Insert a user with a hashed password. Returns the full user row. */
export async function createUser(
  db: D1Database,
  email: string,
  password: string,
  displayName: string | null,
  provider: string = "email",
): Promise<User> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  const passwordHash = await hashPassword(password);
  const token = newToken();
  const ts = now();
  const r = await db
    .prepare(
      `INSERT INTO users (email, token, auth0_sub, password_hash, display_name, provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(email, token, passwordHash, displayName, provider, ts)
    .run();
  const userId = Number(r.meta.last_row_id);
  await db
    .prepare(
      `INSERT INTO orgs (name, current_version, created_at) VALUES (?, ?, ?)`,
    )
    .bind(`${displayName ?? email.split("@")[0] ?? "user"}'s org`, null, ts)
    .run();
  const orgRow = (await db
    .prepare("SELECT id FROM orgs WHERE name = ?")
    .bind(`${displayName ?? email.split("@")[0] ?? "user"}'s org`)
    .first()) as { id: number } | null;
  if (!orgRow) throw new Error("Failed to resolve org id");
  const orgId: number = orgRow.id;
  await db
    .prepare("INSERT INTO org_members (org_id, user_id, role, created_at) VALUES (?, ?, ?, ?)")
    .bind(orgId, userId, "owner", ts)
    .run();
  return { id: userId, email, token, auth0_sub: null, display_name: displayName, provider, password_hash: passwordHash };
}

/** Legacy upsert for OAuth / quick-login flows (no password). */
export async function upsertUser(db: D1Database, email: string): Promise<User> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  const existing = (await db
    .prepare(
      `SELECT id, email, token, display_name, provider
       FROM users WHERE email = ?`,
    )
    .bind(email)
    .first()) as User | null;
  if (existing) return existing;

  const token = newToken();
  const local = email.split("@")[0] || "personal";
  const ts = now();

  const u = await db
    .prepare(
      `INSERT INTO users (email, token, auth0_sub, password_hash, display_name, provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(email, token, null, null, null, "oauth", ts)
    .run();
  const userId = Number(u.meta.last_row_id);

  const o = await db
    .prepare("INSERT INTO orgs (name, current_version, created_at) VALUES (?, ?, ?)")
    .bind(`${local}'s org`, null, ts)
    .run();
  const orgId = Number(o.meta.last_row_id);

  await db
    .prepare("INSERT INTO org_members (org_id, user_id, role, created_at) VALUES (?, ?, ?, ?)")
    .bind(orgId, userId, "owner", ts)
    .run();

  return { id: userId, email, token, auth0_sub: null, display_name: null, provider: "oauth", password_hash: null };
}

// ── Orgs & membership ──────────────────────────────────────────────────

export async function getPrimaryOrg(db: D1Database, userId: number): Promise<Org | null> {  const row = (await db
    .prepare(
      `SELECT o.id, o.name, o.current_version, o.stripe_customer_id, o.stripe_sub_id,
              o.subscription_status, o.subscription_tier, o.seat_count, o.trial_ends_at,
              o.current_period_end, o.price_id, o.plan
       FROM orgs o
       JOIN org_members m ON m.org_id = o.id
       WHERE m.user_id = ? AND m.role = 'owner'
       ORDER BY o.id ASC LIMIT 1`,
    )
    .bind(userId)
    .first()) as Org | null;
  return row ?? null;
}

export async function listOrgs(db: D1Database, userId: number): Promise<Org[]> {
  const rows = (await db
    .prepare(
      `SELECT o.id, o.name, o.current_version, o.stripe_customer_id, o.stripe_sub_id,
              o.subscription_status, o.subscription_tier, o.seat_count, o.trial_ends_at,
              o.current_period_end, o.price_id, o.plan
       FROM orgs o
       JOIN org_members m ON m.org_id = o.id
       WHERE m.user_id = ? ORDER BY o.id ASC`,
    )
    .bind(userId)
    .all()) as unknown as { results: Org[] };
  return rows.results;
}

/** Resolve the org to operate on: an explicit ?org= (must be a membership) or the primary org. */
export async function resolveOrg(
  db: D1Database,
  userId: number,
  requested: number | null,
): Promise<Org | null> {
  if (requested == null) return getPrimaryOrg(db, userId);
  const member = (await db
    .prepare("SELECT 1 FROM org_members WHERE org_id = ? AND user_id = ?")
    .bind(requested, userId)
    .first()) as { 1: number } | null;
  if (!member) return null;
  const org = (await db
    .prepare(
      `SELECT id, name, current_version, stripe_customer_id, stripe_sub_id,
              subscription_status, subscription_tier, seat_count, trial_ends_at,
              current_period_end, price_id, plan
       FROM orgs WHERE id = ?`,
    )
    .bind(requested)
    .first()) as Org | null;
  return org;
}

export async function createOrg(db: D1Database, userId: number, name: string): Promise<Org> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  const ts = now();
  const r = await db
    .prepare("INSERT INTO orgs (name, current_version, created_at) VALUES (?, ?, ?)")
    .bind(name, null, ts)
    .run();
  const orgId = Number(r.meta.last_row_id);
  await db
    .prepare("INSERT INTO org_members (org_id, user_id, role, created_at) VALUES (?, ?, ?, ?)")
    .bind(orgId, userId, "owner", ts)
    .run();
  return { id: orgId, name, current_version: null, stripe_customer_id: null, stripe_sub_id: null, subscription_status: "free", subscription_tier: "free", seat_count: 1, trial_ends_at: null, current_period_end: null, price_id: null, plan: "free", api_key_hash: null };
}

export async function addMember(
  db: D1Database,
  orgId: number,
  requesterId: number,
  email: string,
  role: Role,
): Promise<{ ok: boolean; error?: string }> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  const requester = (await db
    .prepare("SELECT role FROM org_members WHERE org_id = ? AND user_id = ?")
    .bind(orgId, requesterId)
    .first()) as { role: Role } | null;
  if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
    return { ok: false, error: "forbidden" };
  }
  if (!["owner", "admin", "member", "viewer"].includes(role)) {
    return { ok: false, error: "invalid role" };
  }

  let user = (await db
    .prepare(
      `SELECT id, email, token, display_name, provider, password_hash
       FROM users WHERE email = ?`,
    )
    .bind(email)
    .first()) as User | null;
  if (!user) {
    const token = newToken();
    const r = await db
      .prepare(
        `INSERT INTO users (email, token, auth0_sub, password_hash, display_name, provider, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(email, token, null, null, null, "invited", now())
      .run();
    user = { id: Number(r.meta.last_row_id), email, token, auth0_sub: null, display_name: null, provider: "invited", password_hash: null };
  }

  await db
    .prepare(
      `INSERT INTO org_members (org_id, user_id, role, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(org_id, user_id) DO UPDATE SET role = excluded.role`,
    )
    .bind(orgId, user.id, role, now())
    .run();
  return { ok: true };
}

// ── Policy versions ────────────────────────────────────────────────────

export async function pushPolicy(
  db: D1Database,
  orgId: number,
  yaml: string,
  authorId: number | null,
  note?: string,
): Promise<PolicyVersion> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  const ts = now();
  const cur = (await db
    .prepare("SELECT COALESCE(MAX(version), 0) AS v FROM policy_versions WHERE org_id = ?")
    .bind(orgId)
    .first()) as { v: number } | null;
  const next = (cur?.v ?? 0) + 1;

  const r = await db
    .prepare(
      "INSERT INTO policy_versions (org_id, version, yaml, author_id, note, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(orgId, next, yaml, authorId, note ?? null, ts)
    .run();
  const versionId = Number(r.meta.last_row_id);

  await db
    .prepare("UPDATE orgs SET current_version = ? WHERE id = ?")
    .bind(versionId, orgId)
    .run();

  return { id: versionId, org_id: orgId, version: next, yaml, author_id: authorId, note: note ?? null, created_at: ts };
}

export async function getPolicy(db: D1Database, orgId: number): Promise<string> {
  const org = (await db
    .prepare("SELECT current_version FROM orgs WHERE id = ?")
    .bind(orgId)
    .first()) as { current_version: number | null } | null;
  if (!org || org.current_version == null) return "";
  const row = (await db
    .prepare("SELECT yaml FROM policy_versions WHERE id = ?")
    .bind(org.current_version)
    .first()) as { yaml: string } | null;
  return row?.yaml ?? "";
}

export async function listVersions(
  db: D1Database,
  orgId: number,
): Promise<(PolicyVersion & { author_email: string | null })[]> {
  const rows = (await db
    .prepare(
      `SELECT p.id, p.org_id, p.version, p.yaml, p.author_id, p.note, p.created_at,
              u.email AS author_email
       FROM policy_versions p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.org_id = ?
       ORDER BY p.version DESC LIMIT 50`,
    )
    .bind(orgId)
    .all()) as unknown as { results: (PolicyVersion & { author_email: string | null })[] };
  return rows.results;
}

export async function rollback(
  db: D1Database,
  orgId: number,
  versionId: number,
): Promise<{ ok: boolean; error?: string }> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  const v = (await db
    .prepare("SELECT id FROM policy_versions WHERE id = ? AND org_id = ?")
    .bind(versionId, orgId)
    .first()) as { id: number } | null;
  if (!v) return { ok: false, error: "version not found" };
  await db
    .prepare("UPDATE orgs SET current_version = ? WHERE id = ?")
    .bind(versionId, orgId)
    .run();
  return { ok: true };
}

// ── Violations ─────────────────────────────────────────────────────────

export async function reportViolations(
  db: D1Database,
  orgId: number,
  repo: string,
  agent: string,
  results: ReportResult[],
  actor: "agent" | "human" = "agent",
): Promise<number> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  const ts = now();
  // The `actor` column is added by migration 0002_actor.sql.
  const stmt = db.prepare(
    "INSERT INTO violations (org_id, repo, rule_id, enforce, message, agent, created_at, actor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const bound = results.map((r) =>
    stmt.bind(orgId, repo, r.ruleId ?? "", r.enforce ?? "", r.message ?? "", agent, ts, actor),
  );
  if (bound.length) {
    await db.batch(bound);
  }
  return results.length;
}

export async function listViolations(
  db: D1Database,
  orgId: number,
  limit = 200,
): Promise<Violation[]> {
  const rows = (await db
    .prepare(
      `SELECT id, org_id, repo, rule_id, enforce, message, agent, created_at
       FROM violations WHERE org_id = ? ORDER BY id DESC LIMIT ?`,
    )
    .bind(orgId, limit)
    .all()) as unknown as { results: Violation[] };
  return rows.results;
}

export async function aggByRepo(db: D1Database, orgId: number): Promise<{ repo: string; count: number }[]> {
  const rows = (await db
    .prepare(
      "SELECT COALESCE(repo, '(unknown)') AS repo, COUNT(*) AS count FROM violations WHERE org_id = ? GROUP BY repo ORDER BY count DESC LIMIT 12",
    )
    .bind(orgId)
    .all()) as unknown as { results: { repo: string; count: number }[] };
  return rows.results;
}

export async function aggByRule(db: D1Database, orgId: number): Promise<{ rule_id: string; count: number }[]> {
  const rows = (await db
    .prepare(
      "SELECT COALESCE(rule_id, '(unknown)') AS rule_id, COUNT(*) AS count FROM violations WHERE org_id = ? GROUP BY rule_id ORDER BY count DESC LIMIT 12",
    )
    .bind(orgId)
    .all()) as unknown as { results: { rule_id: string; count: number }[] };
  return rows.results;
}

export async function trend(
  db: D1Database,
  orgId: number,
  days = 14,
): Promise<{ day: string; count: number }[]> {
  const since = now() - days * 86400000;
  const rows = (await db
    .prepare(
      "SELECT date(created_at / 1000, 'unixepoch') AS day, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY day ORDER BY day",
    )
    .bind(orgId, since)
    .all()) as unknown as { results: { day: string; count: number }[] };
  return rows.results;
}

export interface Analytics {
  total: number;
  byActor: { actor: string; count: number }[];
  byRepo: { repo: string; count: number }[];
  byRule: { rule_id: string; count: number }[];
  trend: { day: string; count: number }[];
  repeatOffenders: { rule_id: string; repo: string; count: number }[];
}

export async function analytics(db: D1Database, orgId: number, days = 30): Promise<Analytics> {
  const since = now() - days * 86400000;

  const totalRow = (await db.prepare("SELECT COUNT(*) AS c FROM violations WHERE org_id = ? AND created_at >= ?").bind(orgId, since).first()) as { c: number } | null;
  const total = totalRow?.c ?? 0;

  const byActor = (await db.prepare("SELECT COALESCE(actor, 'agent') AS actor, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY COALESCE(actor, 'agent') ORDER BY count DESC").bind(orgId, since).all<{ actor: string; count: number }>()).results;
  const byRepo = (await db.prepare("SELECT COALESCE(repo, '(unknown)') AS repo, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY repo ORDER BY count DESC LIMIT 15").bind(orgId, since).all<{ repo: string; count: number }>()).results;
  const byRule = (await db.prepare("SELECT COALESCE(rule_id, '(unknown)') AS rule_id, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY rule_id ORDER BY count DESC LIMIT 15").bind(orgId, since).all<{ rule_id: string; count: number }>()).results;
  const trend = await trendQuery(db, orgId, days);

  const repeatOffenders = (await db
    .prepare(
      `SELECT COALESCE(rule_id, '(unknown)') AS rule_id, COALESCE(repo, '(unknown)') AS repo, COUNT(*) AS count
       FROM violations WHERE org_id = ? AND created_at >= ?
       GROUP BY rule_id, repo HAVING count > 1 ORDER BY count DESC LIMIT 20`,
    )
    .bind(orgId, since)
    .all<{ rule_id: string; repo: string; count: number }>()).results;

  return { total, byActor, byRepo, byRule, trend, repeatOffenders };
}

// Alias to avoid name collision with the `trend` field inside Analytics.
async function trendQuery(db: D1Database, orgId: number, days: number) {
  return trend(db, orgId, days);
}

// ── AI insights persistence ──────────────────────────────────────────────────

/** Persist an AI analysis or authoring result for the org. */
export async function saveAiInsight(
  db: D1Database,
  orgId: number,
  kind: "analyze" | "author",
  inputText: string,
  output: unknown,
): Promise<void> {
  const ts = now();
  await db
    .prepare(
      "INSERT INTO ai_insights (org_id, kind, input_text, output_json, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(orgId, kind, inputText, JSON.stringify(output), ts)
    .run();
}

/** Count AI insights for an org within the last 24h. */
export async function countAiInsights(db: D1Database, orgId: number): Promise<number> {
  const since = now() - 86400000;
  const row = await db
    .prepare("SELECT COUNT(*) AS c FROM ai_insights WHERE org_id = ? AND created_at >= ?")
    .bind(orgId, since)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

// Map backend Analytics to the web app's expected shape.
export function toWebAnalytics(a: Analytics, violations24h: number, activeSessions: number, aiInsights: number): WebAnalytics {
  // compliance_score: 100 minus a penalty proportional to recent violations.
  const penalty = Math.min(100, violations24h * 2 + a.repeatOffenders.length * 5);
  return {
    compliance_score: 100 - penalty,
    active_sessions: activeSessions,
    violations_24h: violations24h,
    ai_insights: aiInsights,
  };
}

// Map a backend Org row to the web app's Org type.
export function toWebOrg(o: Org): WebOrg {
  return {
    id: String(o.id),
    name: o.name,
    current_version: o.current_version?.toString() ?? null,
    subscription_status: o.subscription_status ?? null,
    subscription_tier: o.subscription_tier ?? null,
    seat_count: o.seat_count ?? null,
    trial_ends_at: o.trial_ends_at ?? null,
    current_period_end: o.current_period_end ?? null,
    price_id: o.price_id ?? null,
    plan: (o.plan as "free" | "growth" | "pro" | null) ?? null,
  };
}

// Map a backend Violation row to the web app's Violation type.
export function toWebViolation(v: Violation): WebViolation {
  return {
    id: String(v.id),
    repo: v.repo ?? "",
    rule_id: v.rule_id ?? "",
    enforce: v.enforce ?? "",
    message: v.message ?? "",
    agent: v.agent ?? "",
    created_at: new Date(v.created_at).toISOString(),
  };
}

// Map a backend PolicyVersion row (with author_email) to the web app's PolicyVersion type.
export function toWebPolicyVersion(v: PolicyVersion & { author_email?: string | null }): WebPolicyVersion {
  return {
    id: String(v.id),
    version: v.version,
    yaml: v.yaml,
    author_id: v.author_id != null ? String(v.author_id) : "",
    author_email: v.author_email ?? null,
    note: v.note ?? "",
    created_at: new Date(v.created_at).toISOString(),
  };
}

export function toCsv(violations: Violation[]): string {
  const header = ["id", "repo", "rule_id", "enforce", "message", "agent", "actor", "created_at"];
  const rows = violations.map((v) =>
    [v.id, v.repo ?? "", v.rule_id ?? "", v.enforce ?? "", (v.message ?? "").replace(/[\r\n]+/g, " "), v.agent ?? "", (v as any).actor ?? "agent", new Date(v.created_at).toISOString()]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

// ── Subscription & Billing ────────────────────────────────────────────────────

export const SUBSCRIPTION_STATUSES = ["free", "trialing", "active", "past_due", "canceled", "incomplete"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export const BILLING_TIERS = ["free", "paid"] as const;
export type BillingTier = (typeof BILLING_TIERS)[number];
export const BILLING_PLANS = ["free", "growth", "pro"] as const;
export type BillingPlan = (typeof BILLING_PLANS)[number];

/** Select all billing columns for an org. */
const BILLING_COLUMNS = "s.stripe_customer_id, s.stripe_sub_id, s.subscription_status, s.subscription_tier, s.seat_count, s.trial_ends_at, s.current_period_end, s.price_id, s.plan";

/** Fetch a single subscription row by Stripe subscription ID. */
export async function getSubscriptionByStripeId(db: D1Database, stripeSubId: string): Promise<Subscription | null> {
  const row = (await db
    .prepare(
      `SELECT id, org_id, stripe_sub_id, status, tier, plan, seat_count, price_id,
              current_period_start, current_period_end, trial_start, trial_end,
              cancel_at_period_end, canceled_at, created_at, updated_at
       FROM subscriptions WHERE stripe_sub_id = ?`,
    )
    .bind(stripeSubId)
    .first()) as Subscription | null;
  return row ?? null;
}

/** Upsert a subscription record from a Stripe webhook payload. */
export async function upsertSubscription(
  db: D1Database,
  orgId: number,
  data: {
    stripe_sub_id: string;
    status: string;
    tier: string;
    plan: string;
    seat_count: number;
    price_id: string | null;
    current_period_start: number | null;
    current_period_end: number | null;
    trial_start: number | null;
    trial_end: number | null;
    cancel_at_period_end: boolean;
    canceled_at: number | null;
  },
): Promise<void> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  const ts = now();
  await db
    .prepare(
      `INSERT INTO subscriptions
         (org_id, stripe_sub_id, status, tier, plan, seat_count, price_id,
          current_period_start, current_period_end, trial_start, trial_end,
          cancel_at_period_end, canceled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(stripe_sub_id) DO UPDATE SET
         status = excluded.status,
         tier = excluded.tier,
         plan = excluded.plan,
         seat_count = excluded.seat_count,
         price_id = excluded.price_id,
         current_period_start = excluded.current_period_start,
         current_period_end = excluded.current_period_end,
         trial_start = excluded.trial_start,
         trial_end = excluded.trial_end,
         cancel_at_period_end = excluded.cancel_at_period_end,
         canceled_at = excluded.canceled_at,
         updated_at = excluded.updated_at`,
    )
    .bind(
      orgId,
      data.stripe_sub_id,
      data.status,
      data.tier,
      data.plan,
      data.seat_count,
      data.price_id,
      data.current_period_start,
      data.current_period_end,
      data.trial_start,
      data.trial_end,
      data.cancel_at_period_end ? 1 : 0,
      data.canceled_at,
      ts,
      ts,
    )
    .run();
}

/** Update an org's subscription tracking columns from a Stripe event. */
export async function updateOrgSubscription(
  db: D1Database,
  orgId: number,
  data: {
    stripe_customer_id?: string;
    stripe_sub_id?: string;
    status: string;
    tier: string;
    plan?: string;
    seat_count: number;
    trial_ends_at: number | null;
    current_period_end: number | null;
    price_id: string | null;
  },
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(data)) {
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  vals.push(orgId);
  await db
    .prepare(`UPDATE orgs SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...vals)
    .run();
}

/** Count billable seats (non-viewer members) for an org. */
export async function getSeatCount(db: D1Database, orgId: number): Promise<number> {
  const row = (await db
    .prepare(
      `SELECT COUNT(*) AS c FROM org_members WHERE org_id = ? AND role != 'viewer'`,
    )
    .bind(orgId)
    .first<{ c: number }>()) as { c: number } | null;
  return row?.c ?? 0;
}

/** Fetch subscription info for an org, including the latest subscription record. */
export async function getOrgSubscription(db: D1Database, orgId: number): Promise<{
  org: Org | null;
  subscription: Subscription | null;
  seat_count: number;
} | null> {
  const [org, subscription, seats] = await Promise.all([
    (await db
      .prepare(
        `SELECT id, name, current_version, stripe_customer_id, stripe_sub_id,
                subscription_status, subscription_tier, seat_count, trial_ends_at,
                current_period_end, price_id, plan, api_key_hash
         FROM orgs WHERE id = ?`,
      )
      .bind(orgId)
      .first()) as Org | null,
    (await db
      .prepare(
        `SELECT id, org_id, stripe_sub_id, status, tier, plan, seat_count, price_id,
                current_period_start, current_period_end, trial_start, trial_end,
                cancel_at_period_end, canceled_at, created_at, updated_at
         FROM subscriptions WHERE org_id = ? ORDER BY id DESC LIMIT 1`,
      )
      .bind(orgId)
      .first()) as Subscription | null,
    getSeatCount(db, orgId),
  ]);
  if (!org) return null;
  return { org, subscription, seat_count: seats };
}

// ── API keys (control-plane identity for the CLI) ─────────────────────────

/**
 * Generate a new control-plane API key for an org.
 * Stores only the SHA-256 hash; returns the plaintext key once.
 * The key is `pc_live_` + 32 bytes of URL-safe base64.
 */
export async function createApiKey(db: D1Database, orgId: number): Promise<string> {
  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  const b64 = btoa(String.fromCharCode(...raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const key = `pc_live_${b64}`;
  const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  const hash = Array.from(new Uint8Array(hashBuf), (b) => b.toString(16).padStart(2, "0")).join("");
  await db
    .prepare("UPDATE orgs SET api_key_hash = ? WHERE id = ?")
    .bind(hash, orgId)
    .run();
  return key;
}

/**
 * Verify a control-plane API key against the stored hash for an org.
 * Returns the org id if valid, null otherwise.
 */
export async function verifyApiKey(db: D1Database, key: string): Promise<number | null> {
  if (!key.startsWith("pc_live_")) return null;
  const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  const hash = Array.from(new Uint8Array(hashBuf), (b) => b.toString(16).padStart(2, "0")).join("");
  const row = (await db
    .prepare("SELECT id FROM orgs WHERE api_key_hash = ?")
    .bind(hash)
    .first<{ id: number }>()) as { id: number } | null;
  return row?.id ?? null;
}

// ── Org deletion (cascading) ───────────────────────────────────────────────

/**
 * Permanently delete an org and all associated data.
 * Relies on PRAGMA foreign_keys = ON (set in migrations) for cascade.
 * Callers should also clean up Stripe customer data separately.
 */
export async function deleteOrg(db: D1Database, orgId: number): Promise<void> {
  await db.prepare("PRAGMA foreign_keys = ON").run();
  await db.prepare("DELETE FROM orgs WHERE id = ?").bind(orgId).run();
}

export type { Env };
