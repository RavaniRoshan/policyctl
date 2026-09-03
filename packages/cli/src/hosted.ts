import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { AuthError, NetworkError } from "./lib/errors.js";
import { http, type AuthTokenProvider } from "./lib/http.js";

export interface HostConfig {
  server: string;
  /** Auth0 JWT access token. Replaces legacy magic-link token. */
  accessToken?: string;
  /** Auth0 refresh token for silent re-auth. */
  refreshToken?: string;
  /** Unix timestamp (seconds) when accessToken expires. */
  accessTokenExpiresAt?: number;
  /** Auth0 tenant domain (e.g. "dev-foo.us.auth0.com"). */
  auth0Domain?: string;
  /** Auth0 client_id for device flow. */
  auth0ClientId?: string;
  /** Auth0 API audience. */
  auth0Audience?: string;
  /** User email (for display purposes). */
  email?: string;
  /** Current org id. */
  orgId?: string;
  /** Legacy magic-link token (kept for backward compat during migration; removed in next major). */
  token?: string;
}

export interface ReportBody {
  repo?: string;
  agent?: string;
  results: unknown[];
}

export const CONFIG_DIR = join(homedir(), ".policyctl");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");

/**
 * Token provider that automatically refreshes the Auth0 access token when it
 * expires. Used by the `http()` wrapper to retry failed requests with a fresh token.
 */
class CliTokenProvider implements AuthTokenProvider {
  private refreshing: Promise<string | null> | null = null;

  async getValidToken(): Promise<string | null> {
    const cfg = loadConfig();

    // If we have a valid access token that hasn't expired, use it.
    if (cfg.accessToken && cfg.accessTokenExpiresAt && now() < cfg.accessTokenExpiresAt - 30) {
      return cfg.accessToken;
    }

    // Need to refresh — prevent thundering herd.
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.doRefresh();
    const result = await this.refreshing;
    this.refreshing = null;
    return result;
  }

  private async doRefresh(): Promise<string | null> {
    const cfg = loadConfig();
    if (!cfg.refreshToken || !cfg.auth0Domain || !cfg.auth0ClientId) {
      throw new AuthError("authentication expired — run `policyctl login` to re-authenticate");
    }

    const res = await fetch(`https://${cfg.auth0Domain}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: cfg.auth0ClientId,
        refresh_token: cfg.refreshToken,
        scope: "offline_access openid profile email",
      }),
    });

    if (!res.ok) {
      throw new AuthError("authentication expired — run `policyctl login` to re-authenticate");
    }

    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    };

    const updated: HostConfig = {
      ...cfg,
      accessToken: data.access_token,
      accessTokenExpiresAt: now() + (data.expires_in > 0 ? data.expires_in : 3600) - 30,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
    };
    saveConfig(updated);
    return data.access_token;
  }
}

export const tokenProvider = new CliTokenProvider();

function now(): number {
  return Math.floor(Date.now() / 1000);
}

export function loadConfig(): HostConfig {
  if (existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as HostConfig;
    } catch {
      /* ignore parse errors, fall through to defaults */
    }
  }
  return { server: process.env.POLICYCTL_SERVER ?? "https://policyctl.dev" };
}

export function saveConfig(cfg: HostConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  // Write atomically: write to temp, then rename. Then chmod to ensure secure permissions.
  const tmp = CONFIG_PATH + ".tmp";
  writeFileSync(tmp, JSON.stringify(cfg, null, 2), { mode: 0o600 });
  try {
    chmodSync(tmp, 0o600);
  } catch {
    /* chmod may fail on some filesystems; the write mode should suffice */
  }
  renameSync(tmp, CONFIG_PATH);
}

export function serverUrl(override?: string): string {
  return override ?? loadConfig().server;
}

/** Get the current bearer token (access_token), refreshing if possible. Returns null if not logged in. */
export async function getBearerToken(): Promise<string | null> {
  return tokenProvider.getValidToken();
}

/**
 * Fetch Auth0 device-flow config from the server (public endpoint).
 * Falls back to config values if the endpoint is unavailable.
 */
export async function fetchAuth0Config(override?: string): Promise<{
  domain: string;
  clientId: string;
  audience: string;
}> {
  const server = serverUrl(override);
  try {
    const res = await http("/api/auth0/config", { server });
    const data = (await res.json()) as { domain: string; client_id: string; audience: string };
    return { domain: data.domain, clientId: data.client_id, audience: data.audience };
  } catch {
    // Fall back to config-stored values.
    const cfg = loadConfig();
    if (cfg.auth0Domain && cfg.auth0ClientId && cfg.auth0Audience) {
      return { domain: cfg.auth0Domain, clientId: cfg.auth0ClientId, audience: cfg.auth0Audience };
    }
    throw new NetworkError(
      `Could not fetch Auth0 configuration from ${server}. Ensure you're using the correct --server URL.`,
    );
  }
}

/** Check whether the authenticated org is on a paid (active/trialing) plan.
 * Throws with a helpful message if not — call before any cloud command that
 * requires a subscription (push, report, pull).
 */
export async function requirePaidPlan(override?: string): Promise<void> {
  const cfg = loadConfig();
  if (!cfg.accessToken) {
    throw new AuthError("not logged in — run `policyctl login`");
  }
  const server = serverUrl(override);
  const res = await http("/api/billing/status", { server, token: cfg.accessToken });
  const status = (await res.json()) as { is_paid: boolean; is_trial: boolean };
  if (!status.is_paid && !status.is_trial) {
    throw new AuthError(
      "control plane subscription required. Visit /dashboard/billing to start a 14-day free trial.",
    );
  }
}

/** POST a violation outcome to the hosted feed. Throws on failure. */
export async function sendReport(body: ReportBody, override?: string): Promise<void> {
  await requirePaidPlan(override);
  const cfg = loadConfig();
  const server = serverUrl(override);
  await http("/api/report", {
    server,
    token: cfg.accessToken,
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Fetch the policy YAML from the server. */
export async function fetchPolicy(override?: string): Promise<string> {
  await requirePaidPlan(override);
  const cfg = loadConfig();
  const server = serverUrl(override);
  const res = await http("/api/policy", { server, token: cfg.accessToken });
  const data = (await res.json()) as { yaml: string };
  return data.yaml;
}

/** Push the policy YAML to the server. */
export async function pushPolicy(yaml: string, note: string | undefined, override?: string): Promise<{ version: number; id: number }> {
  await requirePaidPlan(override);
  const cfg = loadConfig();
  const server = serverUrl(override);
  const res = await http("/api/policy", {
    server,
    token: cfg.accessToken,
    method: "POST",
    body: JSON.stringify({ yaml, note }),
  });
  const data = (await res.json()) as { ok: boolean; version: number; id: number };
  return { version: data.version, id: data.id };
}

/** Fetch violations from the server with optional pagination. */
export async function fetchViolations(opts: {
  limit?: number;
  offset?: number;
  override?: string;
}): Promise<unknown[]> {
  await requirePaidPlan(opts.override);
  const cfg = loadConfig();
  const server = serverUrl(opts.override);
  const params = new URLSearchParams();
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.offset) params.set("offset", String(opts.offset));
  const url = `/api/violations${params.toString() ? `?${params}` : ""}`;
  const res = await http(url, { server, token: cfg.accessToken });
  const data = (await res.json()) as unknown[];
  return data;
}

/** Fetch billing status from the server. */
export async function fetchBillingStatus(override?: string): Promise<{
  subscription: unknown | null;
  is_paid: boolean;
  is_trial: boolean;
  days_remaining_in_trial: number | null;
  seat_count: number;
  plan: string;
  has_api_key: boolean;
}> {
  await requirePaidPlan(override);
  const cfg = loadConfig();
  const server = serverUrl(override);
  const res = await http("/api/billing/status", { server, token: cfg.accessToken });
  return (await res.json()) as any;
}

/** Fetch the current user identity from the server. */
export async function fetchCurrentUser(override?: string): Promise<{ id: string; email: string } | null> {
  const cfg = loadConfig();
  const server = serverUrl(override);
  const token = cfg.accessToken ?? cfg.token;
  if (!token) return null;
  const res = await http("/api/me", { server, token });
  const data = (await res.json()) as { user: { id: string; email: string } | null };
  return data.user;
}
