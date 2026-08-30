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
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
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
  enforce: string;
  message: string;
  agent: string;
  created_at: string;
}

export interface PolicyVersion {
  id: string;
  version: number;
  yaml: string;
  author_id: string;
  note: string;
  created_at: string;
}

export const api = {
  me: () => request<Session | null>("/api/me"),
  signup: (body: { email: string; password: string; displayName?: string; turnstile?: string }) =>
    request<Session>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string; turnstile?: string }) =>
    request<Session>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  oauthUrl: (provider: "google" | "apple") =>
    request<{ url: string }>(`/api/auth/oauth/${provider}`),
  analytics: () => request<Analytics>("/api/analytics"),
  violations: () => request<Violation[]>("/api/violations"),
  policyVersions: () => request<PolicyVersion[]>("/api/policy/versions"),
  aiAnalyze: (text: string) => request<{ analysis: string }>("/api/ai/analyze", { method: "POST", body: JSON.stringify({ text }) }),
  aiAuthor: (text: string) => request<{ yaml: string }>("/api/ai/author", { method: "POST", body: JSON.stringify({ text }) }),
};
