import { loadPolicyFile, evaluatePolicy } from "@policyctl/core";
import type { CiContext, EvaluationOutcome } from "@policyctl/core";
import { getCiContext } from "../git.js";
import { findPolicyPath } from "../policy.js";
import { printOutcome } from "../report.js";
import { sendReport } from "../hosted.js";
import { basename } from "node:path";

export interface CheckOptions {
  from?: string;
  to?: string;
  policy?: string;
  json?: boolean;
  cwd?: string;
  report?: boolean;
  repo?: string;
}

/** Pure evaluation against an already-resolved policy path + diff context. */
export function evaluateCheck(policyPath: string, ctx: CiContext): EvaluationOutcome {
  const policy = loadPolicyFile(policyPath);
  return evaluatePolicy(policy, ctx, "ci");
}

export async function checkCommand(opts: CheckOptions): Promise<void> {
  const cwd = opts.cwd ?? process.cwd();
  const policyPath = opts.policy ?? findPolicyPath(cwd);
  if (!policyPath) {
    console.error("policyctl: no policy file found (.policyctl.yml). Run `policyctl init`.");
    process.exit(3);
  }
  let out: EvaluationOutcome;
  try {
    out = evaluateCheck(policyPath, getCiContext(opts.from, opts.to, [policyPath]));
  } catch (e) {
    console.error(`policyctl: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(3);
    return;
  }
  printOutcome(out, opts.json);
  if (opts.report && out.results.length > 0) {
    try {
      await sendReport({
        repo: opts.repo ?? basename(cwd),
        agent: "ci",
        results: out.results,
      });
    } catch (e) {
      console.error(`policyctl: report skipped — ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  process.exit(out.exitCode);
}
