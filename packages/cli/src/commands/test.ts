import { readFileSync } from "node:fs";
import { loadPolicyFile, evaluatePolicy } from "@policyctl/core";
import type { CiContext, HookContext, EvalContext, EvalMode, EvaluationOutcome } from "@policyctl/core";
import { findPolicyPath } from "../policy.js";
import { mark, c, wordmark, bold } from "../ui.js";

export interface TestOptions {
  policy?: string;
  suite?: string;
  cwd?: string;
}

interface HookCase {
  id: string;
  input: HookContext;
  expect: 0 | 1 | 2;
}
interface CiCase {
  id: string;
  files: { path: string; status: string }[];
  text: string;
  expect: 0 | 1 | 2;
}
interface Suite {
  hook?: HookCase[];
  ci?: CiCase[];
}

export function testCommand(opts: TestOptions): void {
  const cwd = opts.cwd ?? process.cwd();
  const policyPath = opts.policy ?? findPolicyPath(cwd);
  if (!policyPath) {
    console.error("policyctl: no policy file found (.policyctl.yml).");
    process.exit(3);
  }
  const policy = loadPolicyFile(policyPath);
  const suitePath = opts.suite ?? joinDefault(cwd);
  let suite: Suite;
  try {
    suite = JSON.parse(readFileSync(suitePath, "utf8")) as Suite;
  } catch (e) {
    console.error(`policyctl: failed to read suite ${suitePath}: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(3);
  }
  const cases: { id: string; mode: EvalMode; ctx: EvalContext; expect: 0 | 1 | 2 }[] = [];
  for (const tc of suite.hook ?? []) cases.push({ id: tc.id, mode: "hook", ctx: tc.input, expect: tc.expect });
  for (const tc of suite.ci ?? []) {
    const ctx: CiContext = { files: tc.files, text: tc.text };
    cases.push({ id: tc.id, mode: "ci", ctx, expect: tc.expect });
  }
  let pass = 0;
  let fail = 0;
  console.log(`${wordmark()} ${c.muted(`· test (${suitePath})`)}`);
  for (const tc of cases) {
    const out: EvaluationOutcome = evaluatePolicy(policy, tc.ctx, tc.mode);
    const ok = out.exitCode === tc.expect;
    if (ok) pass++;
    else fail++;
    const symbol = ok ? mark("ok") : mark("fail");
    const expected = colorEnforce(tc.expect);
    const actual = colorEnforce(out.exitCode);
    console.log(
      `  ${symbol} ${bold(tc.id)}  ${c.muted("expected=")}${expected}  ${c.muted("actual=")}${actual}`,
    );
  }
  console.log(
    `\n  ${fail === 0 ? c.success(`${pass} passed`) : c.danger(`${fail} failed · ${pass} passed`)}`,
  );
  process.exit(fail === 0 ? 0 : 1);
}

function colorEnforce(code: 0 | 1 | 2): string {
  if (code === 0) return c.success("0");
  if (code === 1) return c.warn("1");
  return c.danger("2");
}

function joinDefault(cwd: string): string {
  return `${cwd}/.policyctl.test.json`;
}
