import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { loadPolicyFile, type Policy } from "@policyctl/core";

const HOOK_CMD = "policyctl eval --hook";

// ---------- Claude Code ----------

export function claudeSettingsObject(): Record<string, unknown> {
  return {
    hooks: {
      PreToolUse: [
        { matcher: "", hooks: [{ type: "command", command: HOOK_CMD }] },
      ],
    },
  };
}

export function writeClaude(cwd: string, dry: boolean): string {
  const dir = join(cwd, ".claude");
  const file = join(dir, "settings.json");
  let existing: Record<string, unknown> = {};
  if (existsSync(file)) {
    try {
      existing = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    } catch {
      existing = {};
    }
  }
  const gen = claudeSettingsObject();
  existing.hooks = { ...(existing.hooks as object), ...(gen.hooks as object) };
  const content = JSON.stringify(existing, null, 2) + "\n";
  if (dry) return content;
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, content);
  return file;
}

// ---------- Cursor ----------
// Cursor's hook file is `.cursor/hooks.json`. Native real-time blocking is via
// `beforeShellExecution` (returns `{permission:"deny"|"allow"|"ask"}`) and `afterFileEdit`.
// We also keep the `.cursor/rules/policy.mdc` so the agent is *aware* of the policy in
// its context window — the rules are advisory, the hooks are enforcement.

export function renderCursorRules(policy: Policy): string {
  const lines = [
    "---",
    "description: Project agent policy enforced by policyctl",
    "alwaysApply: true",
    "---",
    "",
    "# Agent Policy (policyctl)",
    "",
    "These rules are enforced automatically by `policyctl`. Do not bypass them.",
    "",
    "## Rules",
  ];
  for (const r of policy.rules) {
    lines.push(`- **${r.id}** (\`${r.scope}\`, ${r.enforce}): ${r.description ?? ""}`);
  }
  return lines.join("\n") + "\n";
}

export function writeCursor(cwd: string, policyPath: string, dry: boolean): string[] {
  const policy = loadPolicyFile(policyPath);
  const rulesDir = join(cwd, ".cursor", "rules");
  const rulesFile = join(rulesDir, "policy.mdc");
  const hooksDir = join(cwd, ".cursor");
  const hooksFile = join(hooksDir, "hooks.json");

  const rulesContent = renderCursorRules(policy);
  // Cursor hook script: receives a tool-call JSON on stdin; the cli decides allow/deny
  // by exit code (0 = allow, 2 = deny, non-zero = error). We map deny to a Cursor
  // `permission:"deny"` JSON envelope.
  const hooksContent = JSON.stringify(
    {
      version: 1,
      hooks: {
        beforeShellExecution: [
          { command: "policyctl eval --hook", matcher: ".*" },
        ],
        afterFileEdit: [
          { command: "policyctl eval --hook", matcher: ".*" },
        ],
      },
    },
    null,
    2,
  ) + "\n";

  if (dry) return [rulesContent, hooksContent];
  mkdirSync(rulesDir, { recursive: true });
  writeFileSync(rulesFile, rulesContent);

  let existing: Record<string, unknown> = {};
  if (existsSync(hooksFile)) {
    try {
      existing = JSON.parse(readFileSync(hooksFile, "utf8")) as Record<string, unknown>;
    } catch {
      existing = {};
    }
  }
  const newHooks = JSON.parse(hooksContent) as { hooks: Record<string, unknown> };
  existing.version = 1;
  existing.hooks = { ...(existing.hooks as object), ...newHooks.hooks };
  writeFileSync(hooksFile, JSON.stringify(existing, null, 2) + "\n");
  return [rulesFile, hooksFile];
}

// ---------- Codex ----------
// Codex reads ~/.codex/hooks/hooks.json (per OpenAI Codex hooks docs). Each entry has a
// matcher (regex on tool_name) and a `command` that runs before/after the tool. Exit 2 from
// a PreToolUse command blocks the tool call. `apply_patch` is the file-edit tool for
// Codex; we match both `shell` and `apply_patch` so the same hook catches both.

export function codexHooksObject(): Record<string, unknown> {
  const cmd = "policyctl eval --hook";
  return {
    version: 1,
    hooks: {
      PreToolUse: [{ matcher: "shell|apply_patch|Write|Edit|MultiEdit", hooks: [{ type: "command", command: cmd }] }],
    },
  };
}

export function writeCodex(cwd: string, dry: boolean): string {
  const dir = join(cwd, ".codex", "hooks");
  const file = join(dir, "hooks.json");
  let existing: Record<string, unknown> = {};
  if (existsSync(file)) {
    try {
      existing = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    } catch {
      existing = {};
    }
  }
  const gen = codexHooksObject();
  existing.hooks = { ...(existing.hooks as object), ...(gen.hooks as object) };
  existing.version = 1;
  const content = JSON.stringify(existing, null, 2) + "\n";
  if (dry) return content;
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, content);
  return file;
}

// ---------- Cross-provider local gate: git pre-commit ----------

const PRE_COMMIT = "#!/bin/sh\n# Generated by policyctl\npolicyctl check || exit 1\n";

/** Installs a pre-commit hook that runs `policyctl check`. Returns the path, or null if not a git repo. */
export function installPreCommit(cwd: string, dry: boolean): string | null {
  const gitDir = join(cwd, ".git");
  if (!existsSync(gitDir)) return null;
  const file = join(gitDir, "hooks", "pre-commit");
  if (dry) return PRE_COMMIT;
  mkdirSync(join(gitDir, "hooks"), { recursive: true });
  if (existsSync(file)) {
    const cur = readFileSync(file, "utf8");
    if (cur.includes("policyctl check")) return file; // already installed
    writeFileSync(file, cur + "\n" + PRE_COMMIT);
  } else {
    writeFileSync(file, PRE_COMMIT);
  }
  chmodSync(file, 0o755);
  return file;
}
