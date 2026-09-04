---
title: OpenAI Codex Setup
description: Step-by-step tutorial for configuring policyctl hooks inside OpenAI Codex to intercept shell and file-edit tool calls.
---

Codex supports lifecycle hooks via `.codex/hooks/hooks.json`. `policyctl` registers a **`PreToolUse`** entry that inspects `shell` and `apply_patch` calls (plus `Write`/`Edit`/`MultiEdit`) before Codex executes them.

## Overview

```
Codex plans tool call: apply_patch("db/migrations/003.sql")
        │
        ▼
PreToolUse Hook fires -> policyctl eval --hook
        │
    ┌───┴───┐
    ▼       ▼
Allow     Block (exit 2)
(exit 0)   │
    │       ▼
    │      Codex receives denial verdict with remediation
    ▼
Tool executes
```

---

## Step 1: Generate the Codex Hook

If you ran `policyctl init --all`, `.codex/hooks/hooks.json` already exists. Otherwise, generate it for Codex specifically:

```bash
policyctl gen codex
```

This creates (or merges into) `.codex/hooks/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "shell|apply_patch|Write|Edit|MultiEdit",
        "hooks": [{ "type": "command", "command": "policyctl eval --hook" }]
      }
    ]
  }
}
```

The matcher covers both Codex-native tools (`shell`, `apply_patch`) and common edit tools so one entry catches every file or command operation. Preview without writing via `policyctl gen codex --print`.

---

## Step 2: How Codex Sends Tool Calls to policyctl

Whenever Codex intends to run a tool, it pipes a JSON payload to `policyctl eval --hook` over stdin. `policyctl` extracts the tool name, file path (matched against `path` matchers), and shell command (matched against `command` matchers) — the same engine and the same `.policyctl.yml` as every other provider.

---

## Step 3: Define a Codex-Specific Rule in `.policyctl.yml`

Add a rule that blocks risky shell commands regardless of which agent runs them:

```yaml
rules:
  - id: no-force-push
    description: "Force pushes rewrite shared history."
    scope: both
    enforce: block
    message: "Force pushes are denied by policy. Open a PR instead."
    when:
      command: "push.*--force"
```

`scope: both` means the GitHub Actions gate enforces it too, even if a session runs without hooks.

---

## Step 4: Verify in Codex

1. Ask Codex to run a force push (in a scratch repo): *"Push this branch with --force"*.
2. Observe: the hook intercepts the `shell` call in under 12ms, Codex displays the blocking verdict, and adjusts its plan.

---

## Step 5: Fail-Safe & Fail-Open Guarantee

`policyctl eval --hook` is engineered to **fail open**: if `.policyctl.yml` is missing or contains invalid YAML, it warns on stderr and exits `0`, so a contributor without policyctl installed is never locked out of their assistant. Run `policyctl doctor` to confirm the Codex entry reports healthy.
