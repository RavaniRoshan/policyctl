export interface Env {
  DB: D1Database;
  /** KV cache for parsed policies + session lookups (sub-ms reads). */
  POLICYCTL_CACHE: KVNamespace;
  /** Optional override for the canonical server URL (used in CLI hints). */
  SERVER_URL?: string;
}

export interface User {
  id: number;
  email: string;
  token: string;
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
