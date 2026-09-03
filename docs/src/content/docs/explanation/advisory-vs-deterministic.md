---
title: Why Advisory Prompts Fail
description: Understanding the context pressure problem in LLM coding agents and why execution-time hooks are essential.
---

When teams introduce AI coding agents like Claude Code, Cursor, or Codex, the standard initial approach is to write instructions in a prompt file:
- `CLAUDE.md`
- `.cursorrules`
- `AGENTS.md`

While prompt files are valuable for architectural guidance, they are fundamentally **advisory**. They cannot provide a deterministic security or compliance boundary.

---

## The Context Pressure Problem

As an AI agent works through a multi-step task, its context window rapidly fills with:
1. System prompts and tool definitions.
2. User request messages.
3. Intermediate file contents and grep search results.
4. Compiler errors, test outputs, and bash logs.

When context reaches tens of thousands of tokens, the "attention weight" assigned to early instructions—such as *"do not edit package.json"*—attenuates significantly. This phenomenon is known as **instruction drift under context pressure**.

```
[System Instructions (CLAUDE.md)]   ──▶ High attention early in conversation
               │
[User Request] │
               │
[Tool Output: 500 lines of logs]    ──▶ Context grows
               │
[Tool Output: 1,200 lines of code]  ──▶ LLM attention disperses
               ▼
Agent attempts: Edit("package.json") ──▶ PROMPT INSTRUCTION FORGOTTEN
```

---

## Advisory Prompts vs. Execution-Time Hooks

| Attribute | Advisory Prompt Files (`CLAUDE.md`) | Deterministic Hooks (`policyctl`) |
|---|---|---|
| **Mechanism** | Natural language suggestions in context window | Native process exit codes (`PreToolUse`, `beforeShellExecution`) |
| **Enforcement** | Voluntary compliance by the LLM | Inviolable OS process barrier |
| **Reliability** | Degrades under context pressure and hallucination | 100% deterministic; mathematical regex and glob matching |
| **Bypassability** | Trivial for a confused agent to ignore | Agent receives OS-level exit code 2 and cannot proceed |
| **Cross-Agent Sharing** | Fragmented vendor formats (`.cursorrules` vs `CLAUDE.md`) | Single unified `.policyctl.yml` shared across all tools |

---

## The Hybrid Recommendation

`policyctl` does not replace prompt files; it gives them teeth:
- Use **prompt files** (`CLAUDE.md`, `.cursor/rules/policy.mdc`) to describe project architecture, naming conventions, and technical preferences.
- Use **`policyctl`** to enforce non-negotiable boundaries: file locks, secret leak prevention, migration integrity, and CI gates.
