/**
 * HTTP layer for the CLI.
 *
 * Wraps `fetch` with:
 *  - exponential backoff + jitter retry on transient failures (network errors, 5xx)
 *  - structured error types from `lib/errors.ts`
 *  - automatic token refresh when the access token is expired
 *
 * All cloud commands should use `http()` instead of raw `fetch()`.
 */

import { NetworkError, ServerError, AuthError } from "./errors.js";

const USER_AGENT = "@policyctl/cli";

export interface FetchOptions extends RequestInit {
  /** Override the server URL prefix. If omitted, uses the configured server. */
  server?: string;
  /** Bearer token. If provided and the server returns 401, the caller is
   * responsible for handling retry with a refreshed token. */
  token?: string;
  /** Maximum number of retry attempts (default 3). */
  retries?: number;
  /** Base delay in ms for exponential backoff (default 200). */
  baseDelayMs?: number;
  /** AbortController signal (passed through to fetch). */
  signal?: AbortSignal;
}

export interface FetchResult {
  status: number;
  headers: Headers;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

/**
 * Retry a fetch call with exponential backoff + jitter.
 * Retries on: network errors (TypeError), 502, 503, 504, 408.
 * Does NOT retry on 401/403/4xx (except 429 rate-limit).
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface AuthTokenProvider {
  /** Returns a fresh bearer token, refreshing if needed. */
  getValidToken(): Promise<string | null>;
}

/**
 * Fetch wrapper with retry logic. Throws structured errors.
 *
 * @param url     Full URL or a path relative to `server`.
 * @param opts    Fetch options. If `server` is provided and `url` is relative,
 *                the request hits `${server}${url}`.
 * @param tokenProvider  Optional token provider for auto-refresh on 401.
 */
export async function http(
  url: string,
  opts: FetchOptions = {},
  tokenProvider?: AuthTokenProvider,
): Promise<FetchResult> {
  const {
    server,
    token,
    retries = 3,
    baseDelayMs = 200,
    signal,
    method = "GET",
    headers: extraHeaders,
    ...rest
  } = opts;

  // Resolve relative URLs against the server prefix.
  const fullUrl = url.startsWith("http") ? url : `${server ?? ""}${url}`;

  // Merge auth header.
  const headers: Record<string, string> = {
    "user-agent": USER_AGENT,
    ...(extraHeaders as Record<string, string>),
  };
  const bearer = token ?? (tokenProvider ? await tokenProvider.getValidToken() : undefined);
  if (bearer) {
    headers["authorization"] = `Bearer ${bearer}`;
  }

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(fullUrl, {
        method,
        headers,
        signal,
        ...rest,
      });

      // Handle auth failure with auto-refresh.
      if (res.status === 401 && tokenProvider && attempt < retries) {
        const refreshed = await tokenProvider.getValidToken();
        if (refreshed && refreshed !== bearer) {
          headers["authorization"] = `Bearer ${refreshed}`;
          attempt++;
          continue;
        }
      }

      // Retryable status codes.
      if (attempt < retries && (res.status === 408 || res.status === 429 || res.status >= 500)) {
        const backoff = baseDelayMs * 2 ** attempt + Math.random() * 100;
        await delay(backoff);
        attempt++;
        continue;
      }

      // Non-retryable. Map to structured errors.
      if (res.status === 401) throw new AuthError("authentication required or expired");
      if (res.status === 403) throw new AuthError("access denied");
      if (res.status >= 400) {
        const text = await res.text().catch(() => "");
        throw new ServerError(
          `server returned ${res.status}${text ? `: ${text}` : ""}`,
          res.status,
        );
      }

      return {
        status: res.status,
        headers: res.headers,
        json: () => res.json(),
        text: () => res.text(),
      };
    } catch (err) {
      // Retry on network errors (fetch throws TypeError for network failures).
      if (err instanceof AuthError || err instanceof ServerError) throw err;
      if (attempt < retries) {
        const backoff = baseDelayMs * 2 ** attempt + Math.random() * 100;
        await delay(backoff);
        attempt++;
        continue;
      }
      throw new NetworkError(err instanceof Error ? err.message : String(err));
    }
  }
}
