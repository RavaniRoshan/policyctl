import { loadConfig, saveConfig, serverUrl } from "../hosted.js";
import { spinner, c } from "../ui.js";

export interface LoginOptions {
  email: string;
  server?: string;
}

export async function loginCommand(opts: LoginOptions): Promise<void> {
  const server = serverUrl(opts.server);
  const spin = spinner(`Authenticating with ${server}`);
  const res = await fetch(`${server}/api/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: opts.email }),
  });
  if (!res.ok) {
    spin.stop("failed");
    console.error(`policyctl: login failed (${res.status})`);
    process.exit(1);
  }
  const j = (await res.json()) as { token: string; email: string };
  const cfg = loadConfig();
  cfg.server = server;
  cfg.token = j.token;
  cfg.email = j.email;
  saveConfig(cfg);
  spin.stop(`as ${c.primary(j.email)}`);
}
