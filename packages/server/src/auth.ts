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

// ── Password hashing (PBKDF2-SHA256, per-Worker Web Crypto) ──────────────

const PASSWORD_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PASSWORD_ITERATIONS, hash: "SHA-256" },
    key,
    HASH_BYTES * 8,
  );
  const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${saltHex}$${hashHex}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored || !stored.startsWith("pbkdf2_sha256$")) return false;
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const [, iterStr, saltHex, hashHex] = parts;
  const iterations = Number(iterStr);
  const salt = Uint8Array.from(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const expected = Uint8Array.from(hashHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const hash = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      key,
      expected.length * 8,
    );
    // Constant-time comparison.
    const arr = new Uint8Array(hash);
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= arr[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}

// ── Turnstile verification ────────────────────────────────────────────────

const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/api/v1/siteverify";

export async function verifyTurnstile(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;
  try {
    const res = await fetch(TURNSTILE_VERIFY, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ── Session cookies ───────────────────────────────────────────────────────

const COOKIE_NAME = "pc_session";
const COOKIE_TTL = 60 * 60 * 24 * 30; // 30 days

export function setSessionCookie(c: Context, token: string): void {
  c.header(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_TTL}`,
  );
}

export function clearSessionCookie(c: Context): void {
  c.header(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  );
}

export function getSessionToken(c: Context): string | null {
  const cookie = c.req.header("cookie") ?? "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
