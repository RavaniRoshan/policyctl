import * as jose from "jose";
import type { Env } from "./types.js";

/**
 * Auth0 JWT verification for the Worker API.
 *
 * The frontend SPA authenticates via Auth0 (Authorization Code + PKCE),
 * obtains an RS256-signed access token, and sends it as a Bearer token.
 * This module verifies that token against Auth0's JWKS endpoint and returns
 * the caller's identity (Auth0 `sub`, email, name, picture).
 *
 * Designed for Cloudflare Workers: JWKS are cached in KV (via jose's
 * `jwksCache` symbol) so they survive cold starts without refetching.
 */

const JWKS_CACHE_KEY = "auth0:jwks";
const JWKS_CACHE_TTL = 600; // 10 minutes (matches jose default cacheMaxAge)

// Module-level in-memory cache for non-Workers runtimes (tests, local dev).
let _jwksCache: { jwks: jose.JSONWebKeySet; uat: number } | null = null;

/** Identity extracted from a verified Auth0 access token. */
export interface Auth0Identity {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Verify an Auth0 access token (Bearer JWT) and return the caller's identity.
 * Returns null if the token is invalid or Auth0 is not configured.
 */
export async function verifyAuth0Token(env: Env, token: string): Promise<Auth0Identity | null> {
  const domain = env.AUTH0_DOMAIN;
  if (!domain) {
    console.warn("AUTH0_DOMAIN not configured — JWT verification unavailable");
    return null;
  }

  const audience = env.AUTH0_AUDIENCE ?? "91txJu7H0xUBDi6b8gE3073Nwhi2hG1I";
  const jwksUrl = new URL(`https://${domain}/.well-known/jwks.json`);

  // Build the jwksCache object that jose will read/write in place.
  // In Workers, this comes from KV; in tests, from module-level state.
  let cache: { jwks: jose.JSONWebKeySet; uat: number };
  let wasFromKv = false;

  if (env.POLICYCTL_CACHE) {
    try {
      const raw = await env.POLICYCTL_CACHE.get(JWKS_CACHE_KEY, "json");
      if (raw && typeof raw === "object") {
        cache = { jwks: (raw as { jwks: jose.JSONWebKeySet }).jwks, uat: (raw as { uat: number }).uat ?? 0 };
        wasFromKv = true;
      } else {
        cache = { jwks: { keys: [] }, uat: 0 };
      }
    } catch {
      cache = { jwks: { keys: [] }, uat: 0 };
    }
  } else if (_jwksCache) {
    cache = { jwks: _jwksCache.jwks, uat: _jwksCache.uat };
  } else {
    cache = { jwks: { keys: [] }, uat: 0 };
  }

  const resolver = jose.createRemoteJWKSet(jwksUrl, {
    [jose.jwksCache]: cache,
  });

  try {
    const { payload } = await jose.jwtVerify(token, resolver, {
      issuer: `https://${domain}/`,
      audience,
      algorithms: ["RS256"],
    });

    // Persist the (possibly updated) JWKS cache back to KV.
    // jose mutates `cache` in place — if `uat` changed it means a fetch occurred.
    if (wasFromKv && env.POLICYCTL_CACHE) {
      try {
        await env.POLICYCTL_CACHE.put(JWKS_CACHE_KEY, JSON.stringify(cache), {
          expirationTtl: JWKS_CACHE_TTL,
        });
      } catch {
        /* cache write is best-effort */
      }
    } else {
      _jwksCache = cache;
    }

    const sub = typeof payload.sub === "string" ? payload.sub : null;
    if (!sub) return null;

    return {
      sub,
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
    };
  } catch (e) {
    console.error("Auth0 JWT verification failed:", e);
    return null;
  }
}
