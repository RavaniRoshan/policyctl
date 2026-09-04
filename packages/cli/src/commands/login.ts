import { spinner, c, panel, hint } from "../ui.js";
import { execFileSync } from "node:child_process";
import { loadConfig, saveConfig, serverUrl, type HostConfig, fetchAuth0Config } from "../hosted.js";
import { AuthError } from "../lib/errors.js";

export interface LoginOptions {
  server?: string;
}

/** Result of the Auth0 device authorization start request. */
interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number; // seconds
  interval: number; // seconds — minimum time between polling requests
}

/** Auth0 token response from polling. */
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number; // seconds
  scope: string;
  token_type: string;
}

/** Decode a JWT payload without verification (just for reading exp). */
function decodeJwtPayload(token: string): { exp?: number; email?: string; sub?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = Buffer.from(parts[1], "base64").toString("utf8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

const POLL_STATES = {
  success: 0,
  authorization_pending: 1,
  authorization_expired: 2,
  slow_down: 3,
} as const;

export async function loginCommand(opts: LoginOptions): Promise<void> {
  const server = serverUrl(opts.server);

  // Step 1: Fetch Auth0 config from the server (or use stored config).
  let auth0Config: { domain: string; clientId: string; audience: string };
  try {
    auth0Config = await fetchAuth0Config(opts.server);
  } catch (e) {
    console.error(`policyctl: ${e instanceof Error ? e.message : e}`);
    process.exit(4);
  }

  const { domain, clientId, audience } = auth0Config;

  // Step 2: Start the device authorization flow.
  const spin = spinner("Requesting device code");
  const res = await fetch(`https://${domain}/oauth/device`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      scope: "openid profile email offline_access",
      audience,
    }),
  });
  spin.stop("done");

  if (!res.ok) {
    console.error(`policyctl: device authorization failed (${res.status})`);
    process.exit(4);
  }

  const device: DeviceCodeResponse = (await res.json()) as DeviceCodeResponse;

  // Step 3: Display instructions to the user.
  console.log(
    panel("policyctl login", [
      `  Open: ${c.primary(device.verification_uri)}`,
      `  Code: ${c.success(device.user_code)}`,
      "",
      c.muted("Waiting for authorization (browser login required)..."),
    ]),
  );

  // Try to open the verification URI in the browser.
  tryAutoOpen(device.verification_uri_complete ?? device.verification_uri);

  // Step 4: Poll for token.
  const token = await pollForToken(domain, clientId, device);

  // Step 5: Store the token.
  const cfg = loadConfig();
  cfg.server = server;
  cfg.accessToken = token.access_token;
  cfg.refreshToken = token.refresh_token;
  cfg.accessTokenExpiresAt = Math.floor(Date.now() / 1000) + (token.expires_in > 0 ? token.expires_in : 3600) - 30;
  cfg.auth0Domain = domain;
  cfg.auth0ClientId = clientId;
  cfg.auth0Audience = audience;

  // Decode id_token for email.
  const idPayload = decodeJwtPayload(token.id_token);
  if (idPayload) {
    cfg.email = idPayload.email ?? cfg.email;
  }

  saveConfig(cfg);

  const email = idPayload?.email ?? cfg.email ?? "unknown";
  console.log(
    panel("logged in", [
      `  ${c.success("✓")} ${c.primary(email)}`,
      "",
      hint(["Run `policyctl whoami` to verify your identity", "Run `policyctl pull` to get your policy"]),
    ]),
  );
}

function tryAutoOpen(url: string): void {
  // Best-effort: try to open the browser on common platforms.
  // This is non-critical — the user can always open the URL manually.
  if (!process.stdout.isTTY) return;

  const platforms: Record<string, string> = {
    darwin: "open",
    linux: "xdg-open",
    win32: "rundll32",
  };
  const cmd = platforms[process.platform];
  if (!cmd) return;

  try {
    if (process.platform === "win32") {
      execFileSync(cmd, ["url.dll,FileProtocolHandler", url], { stdio: "ignore" });
    } else {
      execFileSync(cmd, [url], { stdio: "ignore" });
    }
  } catch {
    /* silently ignore — user can open manually */
  }
}

async function pollForToken(
  domain: string,
  clientId: string,
  device: DeviceCodeResponse,
): Promise<TokenResponse> {
  const tokenUrl = `https://${domain}/oauth/token`;
  const deadline = Date.now() + device.expires_in * 1000;

  let interval = device.interval;
  let attempt = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: device.device_code,
        client_id: clientId,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as TokenResponse;
      return data;
    }

    if (Date.now() > deadline) {
      throw new AuthError("device authorization expired — run `policyctl login` again");
    }

    const err = (await res.json().catch(() => ({}))) as { error?: string };
    if (err.error === "authorization_pending") {
      // Still waiting for user — continue polling.
      attempt++;
      continue;
    }

    if (err.error === "slow_down") {
      // Auth0 wants us to slow down — increase interval.
      interval += 5;
      attempt++;
      continue;
    }

    if (err.error === "expired_token" || err.error === "authorization_expired") {
      throw new AuthError("device authorization expired — run `policyctl login` again");
    }

    // Unknown error.
    throw new AuthError(`login failed: ${err.error ?? `HTTP ${res.status}`}`);
  }
}
