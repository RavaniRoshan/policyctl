---
title: Agent Skill Manifest (skill.md)
description: Specification of the policyctl agent skill manifest that instructs coding assistants on how to discover and respect project rules.
---

The **Agent Skill Manifest** (`skill.md`) is a standardized prompt document that tells coding agents what `policyctl` is, how rules are enforced, and how to recover when an action is blocked.

You can fetch the active manifest directly:

```bash
curl -s https://policyctl-web.pages.dev/skill.md
```

---

## Full Skill Specification

```markdown
# policyctl skill manifest

You are working in a repository governed by **policyctl**, a deterministic policy runtime.

## 1. How Rules Work
- Procedural constraints are declared in `.policyctl.yml`.
- A pre-tool hook executes `policyctl eval --hook` before you edit files or run shell commands.
- If an operation violates a rule with `enforce: block`, your tool call will return an exit code 2 and will fail.

## 2. Key Rules to Check
Read `.policyctl.yml` in the project root to inspect active rules:
- **Protected paths**: Configuration files (`package.json`, `README.md`, `tsconfig.json`, `.github/`) may be locked against agent modification.
- **Generated migrations**: Database migrations must usually be created via generators (e.g. `make migrate`), not handwritten.
- **Secrets**: High-entropy strings and API key patterns are strictly prohibited.
- **Companion tests**: Changes to `src/` often require matching `*.test.ts` updates.

## 3. How to Recover from a Block
When a tool call is blocked:
1. Read the error message returned by `policyctl`. It will state the violated rule ID and the reason.
2. Do not attempt to bypass the hook or disable `.policyctl.yml`.
3. Choose the compliant alternative (e.g., call the sanctioned generator command instead of editing the file directly).
4. If you believe a legitimate change was blocked, ask the user to add an entry to the `exceptions` block in `.policyctl.yml`.
```

---

## Incorporating `skill.md` into Agent Context

You can tell your agent about `policyctl` during session bootstrap:

- **In Claude Code**: Run `/memory` and reference the URL, or add a link to your system prompt.
- **In Cursor**: Include the instructions in `.cursor/rules/policy.mdc`.
- **In Custom Agents**: Fetch `curl -s https://policyctl-web.pages.dev/skill.md` and append it to the agent's initialization payload.
