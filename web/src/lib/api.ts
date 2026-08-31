// API client for the policyctl control-plane Worker.
// In production the SPA (Pages) calls the Worker API directly.
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ||
  "https://policyctl-server.shivamkumar10958.workers.dev";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
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

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  provider: string;
}

export interface Session {
  user: User;
}

export interface Analytics {
  compliance_score: number;
  active_sessions: number;
  violations_24h: number;
  ai_insights: number;
}

export interface Violation {
  id: string;
  repo: string;
  rule_id: string;
  enforce: string | null;
  message: string;
  agent: string;
  created_at: string;
}

export interface PolicyVersion {
  id: string;
  version: number;
  yaml: string;
  author_id: string;
  author_email: string | null;
  note: string;
  created_at: string;
}

export interface AiAnalyzeResult {
  summary: string;
  violations: string[];
  suggestedRules: string[];
}

export interface AiAuthorResult {
  rule: string;
  explanation: string;
}

export const api = {
  me: () => request<Session | null>("/api/me"),
  signup: (body: { email: string; password: string; displayName?: string; turnstile?: string }) =>
    request<Session>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string; turnstile?: string }) =>
    request<Session>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  analytics: () => request<Analytics>("/api/analytics"),
  violations: () => request<Violation[]>("/api/violations"),
  policyVersions: () => request<PolicyVersion[]>("/api/policy/versions"),
  aiAnalyze: (text: string) => request<AiAnalyzeResult>("/api/ai/analyze", { method: "POST", body: JSON.stringify({ diff: text }) }),
  aiAuthor: (text: string) => request<AiAuthorResult>("/api/ai/author", { method: "POST", body: JSON.stringify({ intent: text }) }),
};
