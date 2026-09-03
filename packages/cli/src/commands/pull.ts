import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadConfig, requirePaidPlan, serverUrl } from "../hosted.js";
import { spinner, c } from "../ui.js";
import { loadPolicyFromString } from "@policyctl/core";
import { ValidationError } from "../lib/errors.js";

export interface PullOptions {
  policy?: string;
  cwd?: string;
  server?: string;
  force?: boolean;
  /** Show the policy content and validate it without writing to disk. */
  dryRun?: boolean;
}

export async function pullCommand(opts: PullOptions): Promise<void> {
  await requirePaidPlan(opts.server);
  const cfg = loadConfig();
  const server = serverUrl(opts.server);
  const spin = spinner("Pulling policy");
  const res = await fetch(`${server}/api/policy`, {
    headers: { authorization: `Bearer ${cfg.accessToken ?? cfg.token}` },
  });
  if (!res.ok) {
    spin.stop("failed");
    console.error(`policyctl: pull failed (${res.status})`);
    process.exit(1);
    return;
  }
  const j = (await res.json()) as { yaml: string };
  const target = opts.policy ?? join(opts.cwd ?? process.cwd(), ".policyctl.yml");

  // Validate the downloaded YAML before writing it to disk.
  try {
    loadPolicyFromString(j.yaml);
  } catch (e) {
    throw new ValidationError(`Downloaded policy is invalid: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (opts.dryRun) {
    spin.stop("ok");
    console.log(c.muted(j.yaml));
    console.error(
      `policyctl: dry run — policy is valid (${j.yaml.length} bytes). Not writing to ${c.muted(target)}.`,
    );
    return;
  }

  if (existsSync(target) && !opts.force) {
    spin.stop("blocked");
    console.error(`policyctl: ${target} already exists (use --force to overwrite).`);
    process.exit(3);
    return;
  }
  writeFileSync(target, j.yaml);
  spin.stop(`to ${c.muted(target)}`);
}
