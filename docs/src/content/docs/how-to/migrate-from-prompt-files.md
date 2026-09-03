---
title: Migrate from CLAUDE.md
description: How to audit advisory prompt instructions in CLAUDE.md and convert them into deterministic, enforceable policyctl rules.
---

Most engineering teams begin controlling AI coding agents by creating markdown prompt files (such as `CLAUDE.md`, `.cursorrules`, or `AGENTS.md`).

However, as task context expands, LLMs frequently disregard advisory markdown files under context pressure. Migrating to `policyctl` replaces advisory requests with deterministic runtime barriers.

---

## 1. Audit Your Existing Prompt Files

Review your existing `CLAUDE.md` or `.cursorrules` file. You will typically find instructions like:

```markdown
# Instructions for Claude

- DO NOT edit package.json directly. Run npm install instead.
- NEVER put API keys or secrets in test files.
- All database migrations must be generated using `make migrate`.
- Always write a unit test for any change made in `src/`.
```

Every one of these statements can be mapped directly to a `.policyctl.yml` rule.

---

## 2. Translation Matrix

| Advisory English Instruction in `CLAUDE.md` | Deterministic `policyctl` Implementation |
|---|---|
| *"Do not edit package.json directly"* | `when: { path: "package.json" }`<br>`enforce: block` |
| *"Never commit API keys or passwords"* | `when: { diff_regex: "(?i)(aws_secret\|sk-)" }`<br>`enforce: fail` |
| *"Migrations must be generated via make migrate"* | `when: { all: [{ path: "db/**" }], any: [{ diff_not_contains: "! Generated" }] }`<br>`enforce: block` |
| *"Always write a test for changes in src/"* | `when: { all: [{ diff_paths_glob: "src/**" }], any: [{ diff_paths_not_glob: "**/*.test.*" }] }`<br>`enforce: warn` |

---

## 3. The New Workflow

Once you translate your rules into `.policyctl.yml`:
1. Run `policyctl gen --all` to wire hooks for Claude and Cursor.
2. Keep your `CLAUDE.md` short and high-level (focused on architecture notes, design philosophy, and domain context).
3. Let `policyctl` handle the procedural, non-negotiable constraints. If an agent tries to violate a rule, it is stopped by the hook before any damage occurs.
