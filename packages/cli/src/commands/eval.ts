import { loadPolicyFile, evaluatePolicy } from "@policyctl/core";
import type { EvaluationOutcome, HookContext } from "@policyctl/core";
import { findPolicyPath } from "../policy.js";
import { printOutcome } from "../report.js";
import { readStdin } from "../stdin.js";

export interface EvalOptions {
  json?: boolean;
  policy?: string;
  cwd?: string;
}

/** Pure evaluation of a single tool call against the hook-scope rules. */
export function evaluateHook(policyPath: string, ctx: HookContext): EvaluationOutcome {
  const policy = loadPolicyFile(policyPath);
  return evaluatePolicy(policy, ctx, "hook");
}

/** Maps a provider hook event (e.g. Claude Code PreToolUse JSON) to our HookContext. */
export function eventToHookContext(event: Record<string, unknown>): HookContext {
  const input = (event.tool_input ?? {}) as Record<string, unknown>;
  return {
    tool: String(event.tool_name ?? event.tool ?? "unknown"),
    command: input.command !== undefined ? String(input.command) : undefined,
    file_path: input.file_path !== undefined ? String(input.file_path) : undefined,
  };
}

export async function evalCommand(opts: EvalOptions): Promise<void> {
  const cwd = opts.cwd ?? process.cwd();
  const raw = await readStdin();
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    console.error("policyctl: invalid JSON on stdin.");
    process.exit(3);
    return;
  }
  const policyPath = opts.policy ?? findPolicyPath(cwd);
  // Fail open: misconfiguration must not silently brick the agent.
  if (!policyPath) {
    console.error("policyctl: no policy file found; allowing tool call (exit 0).");
    process.exit(0);
    return;
  }
  let out: EvaluationOutcome;
  try {
    out = evaluateHook(policyPath, eventToHookContext(event));
  } catch (e) {
    console.error(`policyctl: ${e instanceof Error ? e.message : String(e)}; allowing (exit 0).`);
    process.exit(0);
    return;
  }
  printOutcome(out, opts.json);
  process.exit(out.exitCode);
}
