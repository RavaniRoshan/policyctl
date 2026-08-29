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

export const api = {
  me: () => request<Session | null>("/api/me"),
  signup: (body: { email: string; password: string; displayName?: string; turnstile?: string }) =>
    request<Session>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string; turnstile?: string }) =>
    request<Session>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  oauthUrl: (provider: "google" | "apple") =>
    request<{ url: string }>(`/api/auth/oauth/${provider}`),
};
