---
title: Claude Code Hook Setup
description: Step-by-step tutorial for configuring policyctl hooks inside Claude Code to intercept agent tool calls deterministically.
---

Claude Code provides a native lifecycle event called **`PreToolUse`**. This allows `policyctl` to inspect every file edit, bash execution, or multi-file replacement before Claude executes it.

## Overview

```
Claude Code Prompt
       │
       ▼
Agent plans tool call: Edit("db/migrations/003.sql")
       │
       ▼
PreToolUse Hook fires -> policyctl eval --hook
       │
   ┌───┴───┐
   ▼       ▼
Allow     Block (exit 2)
(exit 0)   │
   │       ▼
   │      Claude receives denial verdict:
   │      "Migration db/migrations/003.sql handwritten; use make migrate."
   ▼
Tool executes
```

---

## Step 1: Generate the Claude Hook

If you ran `policyctl init --all`, your `.claude/settings.json` file is already created. Otherwise, you can generate it specifically for Claude:

```bash
policyctl gen claude
```

This creates or merges into `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "policyctl eval --hook"
          }
        ]
      }
    ]
  }
}
```

---

## Step 2: How Claude Sends Tool Calls to policyctl

Whenever Claude Code intends to run a tool, it pipes a JSON payload to `policyctl eval --hook` over standard input (`stdin`):

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "db/migrations/20260903_users.sql",
    "replacement": "CREATE TABLE users ..."
  }
}
```

`policyctl` extracts:
- `tool_name` (e.g., `Edit`, `Write`, `Bash`, `MultiEdit`)
- `file_path` (matched against `path` matchers)
- `command` (for `Bash` tool calls, matched against `command` matchers)

---

## Step 3: Define a Claude-Specific Rule in `.policyctl.yml`

Add a rule to prevent Claude from directly modifying database migrations:

```yaml
rules:
  - id: migrations-via-generator
    description: "Database migrations must be produced by `make migrate`, never handwritten."
    scope: hook
    enforce: block
    message: "Direct edits to {{path}} are denied. Run `make migrate name={{path}}` instead."
    when:
      path: "db/migrations/**"
```

---

## Step 4: Verify in Claude Code

1. Start Claude Code in your terminal:
   ```bash
   claude
   ```
2. Ask Claude to create or edit a file inside `db/migrations/`:
   > *"Claude, create a new SQL migration file in db/migrations/001_auth.sql"*
3. Observe Claude's response:
   - Claude initiates the `Write` tool call.
   - The hook intercepts the call in under 12ms.
   - Claude displays the blocking verdict returned by `policyctl`:
     ```text
     🛑 Tool call blocked by policyctl: Direct edits to db/migrations/001_auth.sql are denied. Run `make migrate name=...` instead.
     ```
   - Claude adjusts its strategy and informs you of the project policy.

---

## Step 5: Fail-Safe & Fail-Open Guarantee

What happens if someone pulls your repo without `policyctl` installed, or if `.policyctl.yml` has a temporary syntax typo?

`policyctl eval --hook` is engineered to **fail open**:
- If `.policyctl.yml` is missing or contains invalid YAML, it outputs a warning to stderr and exits with status code `0`.
- This ensures developers are never locked out of their coding assistant due to local setup inconsistencies.
