import { loadConfig, saveConfig } from "../hosted.js";
import { c, panel } from "../ui.js";
import { AuthError } from "../lib/errors.js";

export interface LogoutOptions {
  server?: string;
}

export async function logoutCommand(opts: LogoutOptions): Promise<void> {
  const cfg = loadConfig();

  if (!cfg.accessToken && !cfg.token) {
    console.log(c.muted("policyctl: you are not logged in."));
    return;
  }

  // Clear all credentials.
  const cleared: typeof cfg = {
    ...cfg,
    accessToken: undefined,
    refreshToken: undefined,
    accessTokenExpiresAt: undefined,
    token: undefined,
    email: undefined,
    orgId: undefined,
  };

  saveConfig(cleared);

  const server = cfg.server ?? opts.server ?? "policyctl.dev";
  console.log(
    panel("logged out", [
      `  ${c.success("✓")} Credentials cleared`,
      "",
      c.muted(`Server: ${server}`),
    ]),
  );
}
