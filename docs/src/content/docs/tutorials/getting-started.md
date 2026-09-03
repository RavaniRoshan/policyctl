---
title: Getting Started in 5 Minutes
description: Learn how to install policyctl, initialize your first policy file, and enforce your first rule in under 5 minutes.
---

Welcome to **policyctl**! In this tutorial, you will take a project from zero protection to real-time agent enforcement and CI gating in five minutes.

## Prerequisites

- Node.js version 18 or higher (or `npx`)
- Git initialized in your project repository (`git init`)
- An AI coding agent (such as Claude Code, Cursor, or OpenAI Codex) installed locally

---

## Step 1: Install the CLI

`policyctl` is distributed as a lightweight, provider-agnostic CLI. You can run it via `npx` or install it globally:

```bash
# Global install (recommended for hook execution speed)
npm install -g @policyctl/cli

# Verify version
policyctl --version
```

---

## Step 2: Initialize Your Project

Run the `init` command in your repository root. This scaffolds `.policyctl.yml` and auto-configures hook files for any detected AI tools:

```bash
policyctl init --all
```

You will see output similar to:

```text
✓ Detected agents: claude, codex, cursor
✓ Wrote .policyctl.yml
✓ Generated .claude/settings.json hook
✓ Generated .cursor/hooks.json
✓ Generated .cursor/rules/policy.mdc
✓ Installed .git/hooks/pre-commit
```

The generated `.policyctl.yml` is the single source of truth for all rules.

---

## Step 3: Inspect the Generated Policy

Open `.policyctl.yml` in your code editor. By default, it includes rules for protected files, secret scanning, and companion tests:

```yaml
version: 1

vars:
  protected_files: "README.md|package.json|tsconfig.json"

exceptions:
  - rule: no-protected-edits
    path: "package.json"
    note: "Allow automated version bumps"
    enforce: ignore

rules:
  - id: no-protected-edits
    description: "Agents must not modify protected core configuration files"
    scope: hook
    enforce: block
    message: "File {{path}} is locked against agent modification."
    when:
      any:
        - { path: "README.md" }
        - { path: "package.json" }
        - { path: "tsconfig.json" }

  - id: no-secrets-in-diff
    description: "Prevent committing high-entropy secret patterns"
    scope: ci
    enforce: fail
    message: "Hardcoded secret pattern detected in commit diff."
    when:
      diff_regex: "(?i)(aws_secret_access_key|ghp_|sk-[a-z0-9]{20,})"
```

---

## Step 4: Test a Rule with Dry-Run Verification

Verify how the policy engine evaluates an incoming file change before committing:

```bash
# Evaluate against unstaged git changes
policyctl check

# Check specific rules or inspect rule listing
policyctl list
```

You will see an ASCII summary of all active rules:

```text
ID                      SCOPE   ENFORCE  DESCRIPTION
no-protected-edits      hook    block    Agents must not modify protected core files
no-secrets-in-diff      ci      fail     Prevent committing high-entropy secret patterns
```

---

## Step 5: Test Real-Time Agent Interception

To simulate how an AI agent like Claude Code or Cursor is intercepted when it attempts to edit a protected file:

```bash
# Pass a simulated tool-call event via stdin
echo '{"tool_name": "Edit", "tool_input": {"file_path": "README.md"}}' | policyctl eval --hook
```

The output confirms the immediate enforcement:

```text
🛑 BLOCKED: no-protected-edits (README.md)
Message: File README.md is locked against agent modification.
```

Because `policyctl` exited with status code `2`, the AI agent's tool execution is denied on the spot.

---

## Next Steps

Now that you have your first policy running locally:
- [Set up Claude Code Hook Integration](/docs/tutorials/claude-code-setup/)
- [Configure Cursor Editor Hooks](/docs/tutorials/cursor-setup/)
- [Add the policyctl Gate to GitHub Actions](/docs/tutorials/ci-pipeline-setup/)
