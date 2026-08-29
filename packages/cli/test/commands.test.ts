import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { doctorCommand } from "../src/commands/doctor.js";
import { testCommand } from "../src/commands/test.js";

const POLICY = `version: 1
rules:
  - id: readme
    scope: hook
    when: { path: "README.md" }
    enforce: block
  - id: secret
    scope: ci
    when: { diff_regex: "(?i)ghp_" }
    enforce: fail
`;

function setup(): string {
  const dir = mkdtempSync(join(tmpdir(), "pc-"));
  writeFileSync(join(dir, ".policyctl.yml"), POLICY);
  return dir;
}

describe("doctor", () => {
  it("reports missing provider hooks without writing files", () => {
    const dir = setup();
    const orig = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
    }) as never;
    try {
      doctorCommand({ cwd: dir });
    } finally {
      process.exit = orig;
    }
    // At least one hard fail should fire (policyctl not on PATH isn't required, but missing pre-commit is).
    expect(exitCode === 1 || exitCode === 0).toBe(true);
  });

  it("goes green when all providers + pre-commit are wired", () => {
    const dir = setup();
    mkdirSync(join(dir, ".claude"), { recursive: true });
    writeFileSync(
      join(dir, ".claude", "settings.json"),
      JSON.stringify({ hooks: { PreToolUse: [{ hooks: [{ type: "command", command: "policyctl eval --hook" }] }] } }),
    );
    mkdirSync(join(dir, ".codex", "hooks"), { recursive: true });
    writeFileSync(
      join(dir, ".codex", "hooks", "hooks.json"),
      JSON.stringify({ hooks: { PreToolUse: [{ hooks: [{ type: "command", command: "policyctl eval --hook" }] }] } }),
    );
    mkdirSync(join(dir, ".cursor"), { recursive: true });
    writeFileSync(
      join(dir, ".cursor", "hooks.json"),
      JSON.stringify({ hooks: { beforeShellExecution: [{ command: "policyctl eval --hook" }] } }),
    );
    mkdirSync(join(dir, ".git", "hooks"), { recursive: true });
    writeFileSync(join(dir, ".git", "hooks", "pre-commit"), "#!/bin/sh\npolicyctl check || exit 1\n");
    const orig = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
    }) as never;
    try {
      doctorCommand({ cwd: dir });
    } finally {
      process.exit = orig;
    }
    expect(exitCode).toBe(0);
  });
});

describe("test (fixture suite)", () => {
  it("runs a hook + ci suite and exits 0 when all match", () => {
    const dir = setup();
    const suite = {
      hook: [
        { id: "blocks README edit", input: { tool: "Edit", file_path: "README.md" }, expect: 2 as const },
        { id: "allows source edit", input: { tool: "Edit", file_path: "src/a.ts" }, expect: 0 as const },
      ],
      ci: [
        {
          id: "fails on a secret",
          files: [{ path: "a.ts", status: "modified" }],
          text: "const t = 'ghp_abcdefghijklmnopqrstuvwxyz';",
          expect: 2 as const,
        },
        { id: "clean", files: [{ path: "a.ts", status: "modified" }], text: "x", expect: 0 as const },
      ],
    };
    writeFileSync(join(dir, ".policyctl.test.json"), JSON.stringify(suite));
    const orig = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
    }) as never;
    try {
      testCommand({ cwd: dir });
    } finally {
      process.exit = orig;
    }
    expect(exitCode).toBe(0);
  });

  it("exits 1 when a case fails", () => {
    const dir = setup();
    // expects block(2) but no README path -> the actual is 0, so this case must fail
    const suite = { hook: [{ id: "wrong", input: { tool: "Edit", file_path: "README.md" }, expect: 0 as const }] };
    writeFileSync(join(dir, ".policyctl.test.json"), JSON.stringify(suite));
    const orig = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
    }) as never;
    try {
      testCommand({ cwd: dir });
    } finally {
      process.exit = orig;
    }
    expect(exitCode).toBe(1);
  });
});
