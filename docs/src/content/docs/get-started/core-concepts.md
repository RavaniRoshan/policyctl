---
title: Core Concepts
description: The five ideas behind every policyctl setup — policy file, rules, matchers, enforcement levels, and scopes.
---

Everything in `policyctl` builds on five concepts. Understand these and every other page reads itself.

## 1. Policy file (`.policyctl.yml`)

A single YAML file at your repository root is the **source of truth**. Agents read it via hooks, CI reads it via `check`, and teams distribute it via `push` / `pull`. Validate any file with:

```bash
policyctl doctor
```

Full field reference: [.policyctl.yml Schema Spec](/docs/reference/policy-schema/).

## 2. Rules

A rule has an `id`, a `when` condition, and an outcome:

```yaml
rules:
  - id: no-direct-migrations
    description: "Migrations must be generated, never handwritten."
    scope: both
    enforce: block
    message: "Direct edits to {{path}} are denied. Run `make migrate` instead."
    when:
      path: "db/migrations/**"
```

Rules are sorted by `priority` (`high` → `medium` → `low`) then by `id`, so evaluation order is deterministic.

## 3. Matchers

`when` clauses use compiled matchers — globs (`picomatch`), regexes, and substring checks:

- **Hook scope:** `path`, `command`, `tool`, `content_regex`
- **CI scope:** `diff_paths_glob`, `diff_regex`, `diff_not_contains`, and more

Catalog: [Matchers Reference](/docs/reference/matchers/).

## 4. Enforcement levels

| Level | Hook behavior | CI behavior |
|---|---|---|
| `block` / `fail` | Deny the tool call (exit 2) | Fail the gate (exit 2) |
| `warn` | Allow, print warning | Warn, pass (exit 1) |
| `ignore` | Skip the rule entirely | Skip the rule entirely |

Details: [Enforcement Levels](/docs/reference/enforcement-levels/).

## 5. Scopes

- `scope: hook` — evaluated live on every agent tool call via `policyctl eval --hook`.
- `scope: ci` — evaluated on git diffs via `policyctl check`.
- `scope: both` — evaluated in both places. Use for rules that must hold everywhere (secrets, protected files).

Lifecycle walkthrough: [Hook Execution Lifecycle](/docs/concepts/evaluation-lifecycle/).

## Next steps

- [Quickstart](/docs/tutorials/getting-started/) — put these concepts into practice
- [Protect Critical Files](/docs/how-to/protect-critical-files/) — your first `both`-scoped rule
