---
title: Cursor Editor Setup
description: Learn how to set up native policyctl hooks and advisory .cursor/rules in Cursor editor.
---

Cursor combines context-window system prompts with native extension hooks. `policyctl` integrates with Cursor on **both levels**:

1. **Advisory Prompt Injection** (`.cursor/rules/policy.mdc`): Keeps Cursor aware of active project rules so it doesn't waste tokens proposing blocked actions.
2. **Deterministic Execution Hooks** (`.cursor/hooks.json`): Intercepts `beforeShellExecution` and `afterFileEdit` to deny unauthorized operations.

---

## Step 1: Generate Cursor Integration Files

Run the generator for the `cursor` provider:

```bash
policyctl gen cursor
```

This creates two files in your repository:
- `.cursor/rules/policy.mdc`
- `.cursor/hooks.json`

---

## Step 2: Advisory MDC Rule (`.cursor/rules/policy.mdc`)

Cursor reads `.mdc` rules into its context window based on frontmatter flags. `policyctl gen cursor` synchronizes active rules from `.policyctl.yml`:

```markdown
---
description: Project agent policy enforced by policyctl
alwaysApply: true
---

# Agent Policy (policyctl)

These procedural rules are enforced automatically by `policyctl`. Do not bypass them:

## Rules
- **no-protected-edits** (`hook`, block): Agents must not edit README.md, package.json, or tsconfig.json.
- **migrations-via-generator** (`both`, block): Migrations must be generated via `make migrate`.
```

Because this rule is set to `alwaysApply: true`, Cursor's Composer and Agent modes consider the policy during planning.

---

## Step 3: Hard Hooks (`.cursor/hooks.json`)

If Cursor attempts to ignore the advisory prompt, the native hooks intervene:

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "policyctl eval --hook",
        "matcher": ".*"
      }
    ],
    "afterFileEdit": [
      {
        "command": "policyctl eval --hook",
        "matcher": ".*"
      }
    ]
  }
}
```

- **`beforeShellExecution`**: Runs before any command executed in Cursor's embedded terminal.
- **`afterFileEdit`**: Validates file buffers as they are written to disk.

---

## Step 4: Verify with `policyctl doctor`

To confirm that Cursor is properly wired to your binary and policy:

```bash
policyctl doctor
```

Look for the Cursor checks:

```text
✓ .policyctl.yml exists and is valid
✓ policyctl executable is discoverable on PATH
✓ .cursor/hooks.json is configured
✓ .cursor/rules/policy.mdc is present
```

If any check reports a warning, re-run `policyctl gen cursor --force` to repair the configuration.
