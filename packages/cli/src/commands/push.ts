import { readFileSync } from "node:fs";
import { findPolicyPath } from "../policy.js";
import { requirePaidPlan, loadConfig, pushPolicy, serverUrl } from "../hosted.js";
import { spinner } from "../ui.js";
import { loadPolicyFile } from "@policyctl/core";
import { ValidationError } from "../lib/errors.js";

export interface PushOptions {
  policy?: string;
  cwd?: string;
  server?: string;
  dryRun?: boolean;
  note?: string;
}

export async function pushCommand(opts: PushOptions): Promise<void> {
  const cwd = opts.cwd ?? process.cwd();
  const policyPath = opts.policy ?? findPolicyPath(cwd);
  if (!policyPath) {
    console.error("policyctl: no policy file found (.policyctl.yml). Run `policyctl init`.");
    process.exit(3);
  }
  const yaml = readFileSync(policyPath, "utf8");

  // Validate the YAML locally before any network calls.
  // Catches structural errors, missing ids, bad enforce values — fast feedback.
  try {
    loadPolicyFile(policyPath);
  } catch (e) {
    throw new ValidationError(e instanceof Error ? e.message : String(e));
  }

  if (opts.dryRun) {
    console.error(`policyctl: dry run — policy at ${policyPath} is valid (${yaml.length} bytes). No changes published.`);
    return;
  }

  // Auth check happens after local validation so users get fast feedback on bad YAML.
  await requirePaidPlan(opts.server);

  const spin = spinner("Publishing policy");
  try {
    const result = await pushPolicy(yaml, opts.note, opts.server);
    spin.stop(`v${result.version} published`);
  } catch (e) {
    spin.stop("failed");
    throw e;
  }
}
