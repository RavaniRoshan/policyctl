export interface Env {
  DB: D1Database;
  /** KV cache for parsed policies + session lookups (sub-ms reads). */
  POLICYCTL_CACHE: KVNamespace;
  /** Workers AI — edge LLM inference for semantic policy intelligence. */
  AI: Ai;
  /** Durable Objects — live enforcement sessions + streaming dashboard. */
  POLICY_SESSION: DurableObjectNamespace;
  /** Optional override for the canonical server URL (used in CLI hints). */
  SERVER_URL?: string;
  // ── Turnstile ──
  /** Turnstile secret key (set via: wrangler secret put TURNSTILE_SECRET_SITE). */
  TURNSTILE_SECRET_SITE?: string;
  /** Turnstile site key (public). */
  TURNSTILE_SITE_KEY?: string;
  // ── OAuth ──
  OAUTH_GOOGLE_CLIENT_ID?: string;
  OAUTH_GOOGLE_CLIENT_SECRET?: string;
  OAUTH_REDIRECT_URI?: string;
  // ── R2 (S3-compatible credentials for direct S3 API access) ──
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_ENDPOINT?: string;
  R2_BUCKET?: string;
}

export interface User {
  id: number;
  email: string;
  token: string;
  display_name: string | null;
  provider: string;
  password_hash: string | null;
}

export interface Org {
  id: number;
  name: string;
  current_version: number | null;
}

export interface OrgMember {
  org_id: number;
  user_id: number;
  role: "owner" | "admin" | "member" | "viewer";
}

export interface PolicyVersion {
  id: number;
  org_id: number;
  version: number;
  yaml: string;
  author_id: number | null;
  note: string | null;
  created_at: number;
}

export interface Violation {
  id: number;
  org_id: number;
  repo: string | null;
  rule_id: string | null;
  enforce: string | null;
  message: string | null;
  agent: string | null;
  created_at: number;
}

export type ReportResult = {
  ruleId?: string;
  enforce?: string;
  message?: string;
};

export const ROLES = ["owner", "admin", "member", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export interface Session {
  user: User;
}

export type { Env as WorkerEnv };
