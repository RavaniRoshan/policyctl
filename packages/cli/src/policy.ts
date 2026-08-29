import { existsSync } from "node:fs";
import { join } from "node:path";

export const POLICY_NAMES = [
  ".policyctl.yml",
  ".policyctl.yaml",
  "policyctl.yml",
  "policyctl.yaml",
];

export function findPolicyPath(cwd: string = process.cwd()): string | null {
  for (const name of POLICY_NAMES) {
    const p = join(cwd, name);
    if (existsSync(p)) return p;
  }
  return null;
}
