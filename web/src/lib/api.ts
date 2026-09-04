// API client for the policyctl control-plane Worker.
// In production the SPA (Pages) calls the Worker API directly.
import type {
  Session,
  User,
  Analytics,
  Violation,
  PolicyVersion,
  AiAnalyzeResult,
  AiAuthorResult,
  DailyReport,
  Org,
  OrgMember,
  Role,
  BillingStatus,
  CheckoutSession,
} from "@policyctl/types";

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ||
  "https://policyctl-server.shivamkumar10958.workers.dev";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Set by AuthProvider — fetches the current Auth0 access token, or null. */
let tokenGetter: (() => Promise<string | null>) | null = null;
export function setTokenGetter(fn: (() => Promise<string | null>) | null) {
  tokenGetter = fn;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenGetter ? await tokenGetter() : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...init,
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, `Invalid response from server (${res.status})`);
    }
  }
  if (!res.ok) {
    const errMsg = (data && typeof data === "object" && "error" in data)
      ? (data as { error: string }).error
      : `Request failed (${res.status})`;
    throw new ApiError(res.status, errMsg);
  }
  return data as T;
}

export { request };

export const api = {
  me: () => request<Session | null>("/api/me"),
  analytics: () => request<Analytics>("/api/analytics"),
  violations: () => request<Violation[]>("/api/violations"),
  violation: (id: string) => request<Violation & { diff?: string }>(`/api/violations/${id}`),
  dismissViolation: (id: string, reason: string) =>
    request<{ ok: boolean }>("/api/violations/" + id + "/dismiss", {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  policyVersions: () => request<PolicyVersion[]>("/api/policy/versions"),
  publishPolicy: (yaml: string, note?: string) =>
    request<{ ok: boolean; version: number; id: string }>("/api/policy", {
      method: "POST",
      body: JSON.stringify({ yaml, note }),
    }),
  rollbackVersion: (id: string) =>
    request<{ ok: boolean }>("/api/policy/versions/" + id + "/rollback", {
      method: "POST",
    }),
  dailyReport: () => request<{ report: DailyReport | null; message?: string }>("/api/report/daily"),
  resendReport: () => request<{ ok: boolean; message?: string }>("/api/report/daily/resend", { method: "POST" }),
  orgs: () => request<{ orgs: Org[] }>("/api/orgs"),
  createOrg: (name: string) => request<{ org: Org }>("/api/orgs", { method: "POST", body: JSON.stringify({ name }) }),
  members: (orgId: string) => request<OrgMember[]>(`/api/orgs/${orgId}/members`),
  inviteMember: (orgId: string, email: string, role: Role) =>
    request<{ ok: boolean }>("/api/orgs/" + orgId + "/members", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  updateMember: (orgId: string, userId: string, role: Role) =>
    request<{ ok: boolean }>("/api/orgs/" + orgId + "/members/" + userId, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (orgId: string, userId: string) =>
    request<{ ok: boolean }>("/api/orgs/" + orgId + "/members/" + userId, {
      method: "DELETE",
    }),
  aiAnalyze: (diff: string, opts?: { policy?: string; repo?: string }) =>
    request<AiAnalyzeResult>("/api/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ diff, ...opts }),
    }),
  aiAuthor: (intent: string) =>
    request<AiAuthorResult>("/api/ai/author", {
      method: "POST",
      body: JSON.stringify({ intent }),
    }),
  billingStatus: () => request<BillingStatus>("/api/billing/status"),
  billingCheckout: (plan: "growth" | "pro" = "growth", interval?: "annual" | "monthly") =>
    request<CheckoutSession>("/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan, interval }),
    }),
  billingPortal: () =>
    request<CheckoutSession>("/api/billing/portal", {
      method: "POST",
    }),
  generateApiKey: () =>
    request<{ key: string }>("/api/billing/api-key", {
      method: "POST",
    }),
  deleteOrg: (id: string | number) =>
    request<{ ok: boolean }>(`/api/orgs/${id}`, {
      method: "DELETE",
    }),
  joinWaitlist: (email: string, opts?: { name?: string; interest?: string; source?: string }) =>
    request<{ ok: boolean; position?: number; duplicate?: boolean }>("/api/waitlist", {
      method: "POST",
      body: JSON.stringify({ email, ...opts }),
    }),
  waitlist: () =>
    request<{
      total: number;
      signups: { id: number; email: string; name: string | null; interest: string | null; source: string | null; created_at: string }[];
    }>("/api/waitlist"),
};

/** Download violations as CSV (non-JSON response — streams directly from Worker). */
export async function downloadViolationsCsv(): Promise<Blob> {
  const token = tokenGetter ? await tokenGetter() : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/export/violations.csv`, { headers });
  if (!res.ok) throw new ApiError(res.status, "Failed to download violations CSV");
  return res.blob();
}

// Re-export shared types for convenience.
export type {
  Session,
  User,
  Analytics,
  Violation,
  PolicyVersion,
  AiAnalyzeResult,
  AiAuthorResult,
  DailyReport,
  Org,
  OrgMember,
  BillingStatus,
  CheckoutSession,
};
