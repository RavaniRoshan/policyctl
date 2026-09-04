---
title: Enforcement Levels
description: Detailed reference on the behavior and exit codes of block, fail, warn, and ignore across hook-time and CI runners.
---

> **Machine-readable:** [Raw Markdown](/docs/reference/enforcement-levels.md) · [llms.txt](/docs/llms.txt)

Every rule in `.policyctl.yml` specifies an `enforce` level. This level dictates runtime execution behavior, exit codes, and agent interception.

---

## Behavior Matrix

| Enforcement Level | Behavior at Agent Hook | Behavior in CI Pipeline | Typical Use Case |
|---|---|---|---|
| **`block`** | **Denies tool call** (Exit `2`). Agent cannot execute operation. | **Fails build** (Exit `2`). Pull request blocked. | Non-negotiable security boundaries, locked manifests, destructive shell commands. |
| **`fail`** | **Warns agent** (Exit `0` or `1`). Agent may continue task. | **Fails build** (Exit `2`). Pull request blocked. | Rules you want visible to agents during active work, but strictly gated before merge. |
| **`warn`** | **Emits warning** (Exit `1`). Operation allowed. | **Emits warning** (Exit `1`). Build passes. | Soft guidance, companion test recommendations, style advisory. |
| **`ignore`** | *(Exceptions only)* Suppresses violation completely. | *(Exceptions only)* Suppresses violation completely. | Known white-listed bypasses (e.g. Dependabot PRs touching locked lockfiles). |

---

## Exit Codes Reference

| Exit Code | Classification | Meaning |
|---|---|---|
| **`0`** | **Allow** | All rules passed without violations, or exceptions suppressed them. |
| **`1`** | **Warn** | One or more rules with `enforce: warn` triggered. Informational only. |
| **`2`** | **Deny / Fail** | One or more rules with `enforce: block` or `enforce: fail` triggered. Operation aborted or CI build halted. |
| **`3`** | **Error** | Missing configuration file, unparseable YAML syntax, or invalid CLI parameters. |

---

## The Fail-Open Principle at Hook Time

When `policyctl eval --hook` executes:
- If a rule evaluates to `block`, it returns exit code `2` to prevent the tool call.
- If `.policyctl.yml` is missing, unreadable, or encounters an internal execution error, it logs to `stderr` and returns exit code `0`.
- This ensures that coding agents are never rendered unusable if a configuration file is temporarily broken during local refactoring.
