import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "../evaluate.js";
import { loadPolicyFromString } from "../load.js";
import type { HookContext } from "../types.js";

// Battle-tests the headline performance claim: hook evaluation must average
// well under the <12ms budget (mean over many runs, immune to CI jitter).
describe("hook evaluation latency budget", () => {
  it("evaluates a 20-rule policy with mean < 12ms", () => {
    const rules = Array.from(
      { length: 20 },
      (_, i) => `
  - id: rule-${i}
    scope: hook
    enforce: block
    when:
      path: "db/migrations/**"`,
    ).join("\n");
    const policy = loadPolicyFromString(`version: 1\nrules:\n${rules}\n`);
    const ctx = { tool: "Write", file_path: "src/app.ts" } as HookContext;

    // Warm up the JIT so the measurement reflects steady-state hooks.
    for (let i = 0; i < 10; i++) evaluatePolicy(policy, ctx, "hook");

    const N = 100;
    const start = performance.now();
    for (let i = 0; i < N; i++) evaluatePolicy(policy, ctx, "hook");
    const mean = (performance.now() - start) / N;
    expect(mean).toBeLessThan(12);
  });

  it("is deterministic: identical input always yields identical verdicts", () => {
    const policy = loadPolicyFromString(
      "version: 1\nrules:\n  - id: r\n    scope: hook\n    enforce: block\n    when:\n      path: 'secrets/**'\n",
    );
    const ctx = { tool: "Write", file_path: "secrets/a.env" } as HookContext;
    const first = JSON.stringify(evaluatePolicy(policy, ctx, "hook"));
    for (let i = 0; i < 25; i++) {
      expect(JSON.stringify(evaluatePolicy(policy, ctx, "hook"))).toBe(first);
    }
  });
});
