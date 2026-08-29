import type {
  Env,
  Org,
  PolicyVersion,
  ReportResult,
  Role,
  User,
  Violation,
} from "./types.js";
import { hashPassword, newToken } from "./auth.js";

const now = () => Date.now();

// ── Users ──────────────────────────────────────────────────────────────

export async function getUserByToken(db: D1Database, token: string): Promise<User | null> {
  if (!token) return null;
  const row = (await db
    .prepare(
      `SELECT id, email, token, display_name, provider, password_hash
       FROM users WHERE token = ?`,
    )
    .bind(token)
    .first()) as User | null;
  return row ?? null;
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const row = (await db
    .prepare(
      `SELECT id, email, token, display_name, provider, password_hash
       FROM users WHERE email = ?`,
    )
    .bind(email)
    .first()) as User | null;
  return row ?? null;
}

export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  const row = (await db
    .prepare(
      `SELECT id, email, token, display_name, provider, password_hash
       FROM users WHERE id = ?`,
    )
    .bind(id)
    .first()) as User | null;
  return row ?? null;
}

/** Insert a user with a hashed password. Returns the full user row. */
export async function createUser(
  db: D1Database,
  email: string,
  password: string,
  displayName: string | null,
  provider: string = "email",
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const token = newToken();
  const ts = now();
  const r = await db
    .prepare(
      `INSERT INTO users (email, token, password_hash, display_name, provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
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
  return { id: userId, email, token, display_name: displayName, provider, password_hash: passwordHash };
}

/** Legacy upsert for OAuth / quick-login flows (no password). */
export async function upsertUser(db: D1Database, email: string): Promise<User> {
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
      `INSERT INTO users (email, token, password_hash, display_name, provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(email, token, null, null, "oauth", ts)
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

  return { id: userId, email, token, display_name: null, provider: "oauth", password_hash: null };
}

// ── Orgs & membership ──────────────────────────────────────────────────

export async function getPrimaryOrg(db: D1Database, userId: number): Promise<Org | null> {
  const row = (await db
    .prepare(
      `SELECT o.id, o.name, o.current_version FROM orgs o
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
      `SELECT o.id, o.name, o.current_version FROM orgs o
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
    .prepare("SELECT id, name, current_version FROM orgs WHERE id = ?")
    .bind(requested)
    .first()) as Org | null;
  return org;
}

export async function createOrg(db: D1Database, userId: number, name: string): Promise<Org> {
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
  return { id: orgId, name, current_version: null };
}

export async function addMember(
  db: D1Database,
  orgId: number,
  requesterId: number,
  email: string,
  role: Role,
): Promise<{ ok: boolean; error?: string }> {
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
        `INSERT INTO users (email, token, password_hash, display_name, provider, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(email, token, null, null, "invited", now())
      .run();
    user = { id: Number(r.meta.last_row_id), email, token, display_name: null, provider: "invited", password_hash: null };
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
  const ts = now();
  // The `actor` column is added by migration 0002_actor.sql.
  const stmt = db.prepare(
    "INSERT INTO violations (org_id, repo, rule_id, enforce, message, agent, created_at, actor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const r of results) {
    await stmt.bind(orgId, repo, r.ruleId ?? "", r.enforce ?? "", r.message ?? "", agent, ts, actor).run();
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
      "SELECT created_at FROM violations WHERE org_id = ? AND created_at >= ?",
    )
    .bind(orgId, since)
    .all()) as unknown as { results: { created_at: number }[] };
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now() - i * 86400000);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows.results) {
    const key = new Date(r.created_at).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([day, count]) => ({ day, count }));
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
  const all = (sql: string) => db.prepare(sql).bind(orgId, since).all() as Promise<{ results: any[] }>;

  const totalRow = (await db.prepare("SELECT COUNT(*) AS c FROM violations WHERE org_id = ? AND created_at >= ?").bind(orgId, since).first()) as { c: number };
  const total = totalRow?.c ?? 0;

  const byActor = (await all("SELECT COALESCE(actor, 'agent') AS actor, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY COALESCE(actor, 'agent') ORDER BY count DESC")).results as { actor: string; count: number }[];
  const byRepo = (await all("SELECT COALESCE(repo, '(unknown)') AS repo, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY repo ORDER BY count DESC LIMIT 15")).results as { repo: string; count: number }[];
  const byRule = (await all("SELECT COALESCE(rule_id, '(unknown)') AS rule_id, COUNT(*) AS count FROM violations WHERE org_id = ? AND created_at >= ? GROUP BY rule_id ORDER BY count DESC LIMIT 15")).results as { rule_id: string; count: number }[];

  const trendRows = (await db.prepare("SELECT created_at FROM violations WHERE org_id = ? AND created_at >= ?").bind(orgId, since).all()) as unknown as { results: { created_at: number }[] };
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now() - i * 86400000);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of trendRows.results) {
    const key = new Date(r.created_at).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const trend = [...buckets.entries()].map(([day, count]) => ({ day, count }));

  const repeatOffenders = (await (db
    .prepare(
      `SELECT COALESCE(rule_id, '(unknown)') AS rule_id, COALESCE(repo, '(unknown)') AS repo, COUNT(*) AS count
       FROM violations WHERE org_id = ? AND created_at >= ?
       GROUP BY rule_id, repo HAVING count > 1 ORDER BY count DESC LIMIT 20`,
    )
    .bind(orgId, since)
    .all() as Promise<{ results: { rule_id: string; repo: string; count: number }[] }>)).results;

  return { total, byActor, byRepo, byRule, trend, repeatOffenders };
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

export type { Env };
