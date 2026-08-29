import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadConfig, serverUrl } from "../hosted.js";
import { spinner, c } from "../ui.js";

export interface PullOptions {
  policy?: string;
  cwd?: string;
  server?: string;
  force?: boolean;
}

export async function pullCommand(opts: PullOptions): Promise<void> {
  const cfg = loadConfig();
  if (!cfg.token) {
    console.error("policyctl: not logged in. Run `policyctl login`.");
    process.exit(3);
  }
  const server = serverUrl(opts.server);
  const spin = spinner("Pulling policy");
  const res = await fetch(`${server}/api/policy`, {
    headers: { authorization: `Bearer ${cfg.token}` },
  });
  if (!res.ok) {
    spin.stop("failed");
    console.error(`policyctl: pull failed (${res.status})`);
    process.exit(1);
  }
  const j = (await res.json()) as { yaml: string };
  const target = opts.policy ?? join(opts.cwd ?? process.cwd(), ".policyctl.yml");
  if (existsSync(target) && !opts.force) {
    spin.stop("blocked");
    console.error(`policyctl: ${target} already exists (use --force to overwrite).`);
    process.exit(3);
  }
  writeFileSync(target, j.yaml);
  spin.stop(`to ${c.muted(target)}`);
}
