import { loadPolicyFile, evaluatePolicy, type EvaluationOutcome } from "@policyctl/core";
import type { CiContext } from "@policyctl/core";
import { getCiContext } from "../git.js";
import { findPolicyPath } from "../policy.js";
import { printOutcome } from "../report.js";
import { requirePaidPlan, sendReport } from "../hosted.js";
import { basename } from "node:path";
import { AuthError, ServerError, NetworkError, CliError } from "../lib/errors.js";

export interface CheckOptions {
  from?: string;
  to?: string;
  policy?: string;
  json?: boolean;
  cwd?: string;
  report?: boolean;
  repo?: string;
  /** If set, a failed report upload exits with code 2 (default: report failure is a warning). */
  reportStrict?: boolean;
}

/** Pure evaluation against an already-resolved policy path + diff context. */
export function evaluateCheck(policyPath: string, ctx: CiContext): EvaluationOutcome {
  const policy = loadPolicyFile(policyPath);
  return evaluatePolicy(policy, ctx, "ci");
}

/**
 * Run `check` and return the EvaluationOutcome.
 * Throws a CliError for config/policy errors so the caller can format uniformly.
 */
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
    if (e instanceof Error) {
      console.error(`policyctl: ${e.message}`);
    } else {
      console.error(`policyctl: ${String(e)}`);
    }
    process.exit(3);
    return;
  }

  printOutcome(out, opts.json);

  // Upload violations to the hosted feed if requested.
  if (opts.report && out.results.length > 0) {
    try {
      await requirePaidPlan();
      await sendReport({
        repo: opts.repo ?? basename(cwd),
        agent: "ci",
        results: out.results,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (opts.json) {
        // Emit structured JSON error alongside the outcome.
        console.error(
          JSON.stringify({ error: "REPORT_FAILED", message: msg, code: e instanceof CliError ? e.code : "UNKNOWN" }, null, 2),
        );
      } else {
        console.error(`policyctl: report upload failed — ${msg}`);
        console.error(`policyctl: policy check exit code preserved; re-run or check connectivity.`);
      }
      if (opts.reportStrict) {
        const code = (e instanceof AuthError) ? 4 : (e instanceof NetworkError ? 2 : 2);
        process.exit(code);
      }
    }
  }

  process.exit(out.exitCode);
}
