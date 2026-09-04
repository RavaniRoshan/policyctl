import { readFileSync } from "node:fs";
import {
  evaluateSet,
  isGroup,
  loadPolicyFile,
  resolveWhen,
  type CiContext,
  type EvalContext,
  type EvalMode,
  type HookContext,
  type Matchers,
  type Policy,
  type Rule,
  type When,
} from "@policyctl/core";
import { findPolicyPath } from "../policy.js";
import { readStdin } from "../stdin.js";
import { mark, c, wordmark, bold } from "../ui.js";

export interface TraceOptions {
  mode: "hook" | "ci";
  diff?: string;
  policy?: string;
  cwd?: string;
}

function resolveInputs(opts: TraceOptions): EvalContext {
  if (opts.mode === "hook") {
    // Defer stdin read to async caller.
    throw new Error("use traceAsync for hook mode");
  }
  if (!opts.diff) throw new Error("--diff <file> is required for ci mode");
  const text = readFileSync(opts.diff, "utf8");
  const files = parseDiffNames(text);
  return { files, text } as CiContext;
}

function parseDiffNames(text: string): { path: string; status: string }[] {
  const out: { path: string; status: string }[] = [];
  for (const hunk of text.split(/^diff --git /m)) {
    if (!hunk) continue;
    const m = hunk.match(/^a\/(.*?) b\//);
    if (m) {
      const status = hunk.match(/^new file/) ? "added" : hunk.match(/^deleted file/) ? "deleted" : "modified";
      out.push({ path: m[1], status });
    }
  }
  return out;
}

function ruleTrace(policy: Policy, rule: Rule, ctx: EvalContext, mode: EvalMode): { id: string; fired: boolean; lines: string[] } {
  const lines: string[] = [];
  const when = resolveWhen(rule.when, policy.vars ?? {});
  const grp = isGroup(when);
  const allSets: Matchers[] = grp ? (when.all ?? []) : [when as Matchers];
  const anySets: Matchers[] = grp ? (when.any ?? []) : [];
  const allMatch = allSets.every((s) => evaluateSet(s, ctx, mode));
  const anyMatch = anySets.length === 0 ? true : anySets.some((s) => evaluateSet(s, ctx, mode));
  const fired = allMatch && anyMatch;
  const ordered = [...allSets.map((s) => ["all", s] as const), ...anySets.map((s) => ["any", s] as const)];

  for (const [label, s] of ordered) {
    const passed = evaluateSet(s, ctx, mode);
    const icon = passed ? mark("ok") : mark("fail");
    const entries = Object.entries(s).map(([k, v]) => `${k}=${v}`).join(", ");
    lines.push(`  ${icon} [${label}] ${entries}  ${c.muted(passed ? "matched" : "no match")}`);
  }
  return { id: rule.id, fired, lines };
}

function renderResults(results: ReturnType<typeof ruleTrace>[]): string {
  return results
    .map((r) => {
      const header = r.fired
        ? c.danger(`${mark("fail")} ${r.id}  ${c.muted("FIRES")}`)
        : c.muted(`· ${r.id}  ${c.muted("(no match)")}`);
      return [header, ...r.lines].join("\n");
    })
    .join("\n\n");
}

export function traceCommand(opts: TraceOptions): void {
  const cwd = opts.cwd ?? process.cwd();
  const policyPath = opts.policy ?? findPolicyPath(cwd);
  if (!policyPath) {
    console.error("policyctl: no policy file found (.policyctl.yml).");
    process.exit(3);
  }
  const policy = loadPolicyFile(policyPath);
  const ctx = resolveInputs(opts);
  const traces = policy.rules
    .filter((r) => r.scope === opts.mode || r.scope === "both")
    .map((r) => ruleTrace(policy, r, ctx, opts.mode));
  console.log(`${wordmark()} ${c.muted(`· trace (${opts.mode})`)}`);
  console.log(renderResults(traces));
  const fired = traces.filter((t) => t.fired);
  console.log(
    `\n  ${fired.length === 0 ? c.success("no rules fire") : c.danger(`${fired.length} rule(s) would fire`)}`,
  );
}

export async function traceCommandAsync(opts: TraceOptions): Promise<void> {
  if (opts.mode === "hook") {
    const raw = await readStdin();
    const event = JSON.parse(raw) as Record<string, unknown>;
    const input = (event.tool_input ?? {}) as Record<string, unknown>;
    const ctx: HookContext = {
      tool: String(event.tool_name ?? event.tool ?? "unknown"),
      command: input.command !== undefined ? String(input.command) : undefined,
      file_path: input.file_path !== undefined ? String(input.file_path) : undefined,
    };
    const cwd = opts.cwd ?? process.cwd();
    const policyPath = opts.policy ?? findPolicyPath(cwd);
    if (!policyPath) {
      console.error("policyctl: no policy file found (.policyctl.yml).");
      process.exit(3);
    }
    const policy = loadPolicyFile(policyPath);
    const traces = policy.rules
      .filter((r) => r.scope === "hook" || r.scope === "both")
      .map((r) => ruleTrace(policy, r, ctx, "hook"));
    console.log(`${wordmark()} ${c.muted("· trace (hook)")}`);
    console.log(renderResults(traces));
    const fired = traces.filter((t) => t.fired);
    console.log(
      `\n  ${fired.length === 0 ? c.success("no rules fire") : c.danger(`${fired.length} rule(s) would fire`)}`,
    );
    return;
  }
  traceCommand(opts);
}
