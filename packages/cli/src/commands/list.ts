import { loadPolicyFile } from "@policyctl/core";
import { findPolicyPath } from "../policy.js";
import { ruleTable, wordmark, c } from "../ui.js";

export interface ListOptions {
  policy?: string;
  cwd?: string;
}

export function listCommand(opts: ListOptions): void {
  const cwd = opts.cwd ?? process.cwd();
  const policyPath = opts.policy ?? findPolicyPath(cwd);
  if (!policyPath) {
    console.error("policyctl: no policy file found (.policyctl.yml). Run `policyctl init`.");
    process.exit(3);
  }
  const policy = loadPolicyFile(policyPath);
  console.log(`${wordmark()} ${c.muted(`· ${policy.rules.length} rule(s) from ${policyPath}`)}`);
  console.log(ruleTable(policy.rules));
}
