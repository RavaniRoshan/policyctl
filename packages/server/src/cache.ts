import type { Env } from "./types.js";

/**
 * KV-backed cache for hot reads. Keys are namespaced; values are JSON.
 * TTLs are short (30-60s) so writes propagate fast while still taking
 * load off D1 for the read-heavy policy + auth paths.
 *
 * Every call is fail-safe: if KV throws, we return null (cache miss) and
 * the caller falls back to D1. The cache is an optimization, never a requirement.
 */
const POLICY_TTL = 30; // seconds
const SESSION_TTL = 60; // seconds

function policyKey(orgId: number): string {
  return `policy:v1:org:${orgId}`;
}
function sessionKey(token: string): string {
  return `session:v1:${token.slice(0, 16)}`;
}

export async function cacheGetPolicy(env: Env, orgId: number): Promise<string | null> {
  try {
    return await env.POLICYCTL_CACHE.get(policyKey(orgId), "text");
  } catch {
    return null;
  }
}

export async function cachePutPolicy(env: Env, orgId: number, yaml: string): Promise<void> {
  try {
    await env.POLICYCTL_CACHE.put(policyKey(orgId), yaml, { expirationTtl: POLICY_TTL });
  } catch {
    /* ignore — cache write is best-effort */
  }
}

export async function cacheInvalidatePolicy(env: Env, orgId: number): Promise<void> {
  try {
    await env.POLICYCTL_CACHE.delete(policyKey(orgId));
  } catch {
    /* ignore */
  }
}

export async function cacheGetUser(env: Env, token: string): Promise<number | null> {
  try {
    const v = await env.POLICYCTL_CACHE.get(sessionKey(token), "text");
    if (!v) return null;
    const j = JSON.parse(v) as { uid: number; exp: number };
    if (j.exp < Date.now()) return null;
    return j.uid;
  } catch {
    return null;
  }
}

export async function cachePutUser(env: Env, token: string, userId: number): Promise<void> {
  try {
    const v = JSON.stringify({ uid: userId, exp: Date.now() + SESSION_TTL * 1000 });
    await env.POLICYCTL_CACHE.put(sessionKey(token), v, { expirationTtl: SESSION_TTL });
  } catch {
    /* ignore */
  }
}
