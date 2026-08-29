import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { findPolicyPath } from "../policy.js";
import { mark, c, wordmark } from "../ui.js";

interface Check {
  label: string;
  ok: boolean;
  detail?: string;
  /** If true, failure is a warning rather than a problem. */
  soft?: boolean;
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

function claudeChecks(cwd: string): Check[] {
  const f = join(cwd, ".claude", "settings.json");
  if (!existsSync(f)) return [{ label: "Claude Code", ok: false, detail: ".claude/settings.json missing" }];
  const parsed = readJson<{ hooks?: { PreToolUse?: { hooks?: { command?: string }[] }[] } }>(f);
  if (!parsed) return [{ label: "Claude Code", ok: false, detail: ".claude/settings.json is not valid JSON" }];
  const pre = parsed.hooks?.PreToolUse?.find((g) =>
    (g.hooks ?? []).some((h) => h.command?.includes("policyctl")),
  );
  return pre
    ? [{ label: "Claude Code", ok: true }]
    : [{ label: "Claude Code", ok: false, detail: "PreToolUse hook for policyctl not found" }];
}

function codexChecks(cwd: string): Check[] {
  const f = join(cwd, ".codex", "hooks", "hooks.json");
  if (!existsSync(f)) return [{ label: "Codex", ok: false, detail: ".codex/hooks/hooks.json missing" }];
  const parsed = readJson<{ hooks?: { PreToolUse?: { hooks?: { command?: string }[] }[] } }>(f);
  if (!parsed) return [{ label: "Codex", ok: false, detail: ".codex/hooks/hooks.json is not valid JSON" }];
  const ok = (parsed.hooks?.PreToolUse ?? []).some((g) =>
    (g.hooks ?? []).some((h) => h.command?.includes("policyctl")),
  );
  return ok
    ? [{ label: "Codex", ok: true }]
    : [{ label: "Codex", ok: false, detail: "PreToolUse entry for policyctl not found" }];
}

function cursorChecks(cwd: string): Check[] {
  const f = join(cwd, ".cursor", "hooks.json");
  if (!existsSync(f)) return [{ label: "Cursor", ok: false, detail: ".cursor/hooks.json missing" }];
  const parsed = readJson<{ hooks?: { beforeShellExecution?: { command?: string }[]; afterFileEdit?: { command?: string }[] } }>(f);
  if (!parsed) return [{ label: "Cursor", ok: false, detail: ".cursor/hooks.json is not valid JSON" }];
  const hasPolicyctl =
    (parsed.hooks?.beforeShellExecution ?? []).some((g) => g.command?.includes("policyctl")) ||
    (parsed.hooks?.afterFileEdit ?? []).some((g) => g.command?.includes("policyctl"));
  return hasPolicyctl
    ? [{ label: "Cursor", ok: true }]
    : [{ label: "Cursor", ok: false, detail: "no policyctl hook entry found" }];
}

function preCommitChecks(cwd: string): Check[] {
  const f = join(cwd, ".git", "hooks", "pre-commit");
  if (!existsSync(f)) return [{ label: "Pre-commit gate", ok: false, detail: ".git/hooks/pre-commit missing" }];
  const body = readFileSync(f, "utf8");
  const ok = body.includes("policyctl check");
  return ok
    ? [{ label: "Pre-commit gate", ok: true }]
    : [{ label: "Pre-commit gate", ok: false, detail: "policyctl check not present in hook" }];
}

function pathCheck(): Check {
  try {
    const out = execFileSync("sh", ["-c", "command -v policyctl"], { encoding: "utf8" }).trim();
    return out
      ? { label: "policyctl on PATH", ok: true, detail: out }
      : { label: "policyctl on PATH", ok: false, detail: "not found", soft: true };
  } catch {
    return { label: "policyctl on PATH", ok: false, detail: "not found", soft: true };
  }
}

function policyCheck(cwd: string): Check {
  const p = findPolicyPath(cwd);
  return p
    ? { label: "Policy file", ok: true, detail: p }
    : { label: "Policy file", ok: false, detail: ".policyctl.yml missing" };
}

export interface DoctorOptions {
  cwd?: string;
}

export function doctorCommand(opts: DoctorOptions): void {
  const cwd = opts.cwd ?? process.cwd();
  const checks: Check[] = [
    policyCheck(cwd),
    pathCheck(),
    ...preCommitChecks(cwd),
    ...claudeChecks(cwd),
    ...codexChecks(cwd),
    ...cursorChecks(cwd),
  ];
  // Always present every provider line; missing files render as "missing", not absent.
  const lines = checks.map((c2) => {
    const symbol = c2.ok ? mark("ok") : c2.soft ? mark("warn") : mark("fail");
    const detail = c2.detail ? c.muted(` — ${c2.detail}`) : "";
    return `  ${symbol} ${c2.ok ? c.success(c2.label) : c.danger(c2.label)}${detail}`;
  });

  const hardFails = checks.filter((c2) => !c2.ok && !c2.soft).length;
  const softFails = checks.filter((c2) => !c2.ok && c2.soft).length;
  const summary =
    hardFails === 0
      ? softFails === 0
        ? c.success("all systems go")
        : c.warn(`${softFails} soft warning${softFails === 1 ? "" : "s"}`)
      : c.danger(`${hardFails} problem${hardFails === 1 ? "" : "s"}`);

  console.log(`${wordmark()} ${c.muted("· doctor")}`);
  console.log(lines.join("\n"));
  console.log(`\n  ${summary}`);
  if (hardFails > 0) {
    console.log(
      c.muted("\n  Re-run with `policyctl gen <provider>` to fix wiring.\n"),
    );
  }
  process.exit(hardFails > 0 ? 1 : 0);
}
