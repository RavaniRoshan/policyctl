import type { Context } from "hono";

/** Generate a URL-safe 64-char hex token. crypto is global in Workers + Node 24. */
export function newToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Extract a bearer token from the Authorization header or ?token= query param. */
export function bearerToken(c: Context): string {
  const header = c.req.header("authorization") ?? "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return (c.req.query("token") ?? "").trim();
}

/** Resolve an org id from ?org=<id> (must be a membership) or the user's primary org. */
export function orgQuery(c: Context): number | null {
  const raw = c.req.query("org");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}
