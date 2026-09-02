import { readFileSync } from "node:fs";
import { findPolicyPath } from "../policy.js";
import { loadConfig, requirePaidPlan, serverUrl } from "../hosted.js";
import { spinner } from "../ui.js";

export interface PushOptions {
  policy?: string;
  cwd?: string;
  server?: string;
}

export async function pushCommand(opts: PushOptions): Promise<void> {
  await requirePaidPlan(opts.server);
  const cfg = loadConfig();
  const policyPath = opts.policy ?? findPolicyPath(opts.cwd ?? process.cwd());
  if (!policyPath) {
    console.error("policyctl: no policy file found (.policyctl.yml).");
    process.exit(3);
  }
  const yaml = readFileSync(policyPath, "utf8");
  const server = serverUrl(opts.server);
  const spin = spinner("Publishing policy");
  const res = await fetch(`${server}/api/policy`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.token}`,
    },
    body: JSON.stringify({ yaml }),
  });
  if (!res.ok) {
    spin.stop("failed");
    console.error(`policyctl: push failed (${res.status})`);
    process.exit(1);
  }
  spin.stop(`to ${server}`);
}
