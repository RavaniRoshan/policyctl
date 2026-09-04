---
title: Introduction
description: What policyctl is, why deterministic enforcement beats advisory prompts, and how one policy file covers every agent.
---

`policyctl` is a **provider-agnostic policy runtime for coding agents**. You write one `.policyctl.yml` file, and the same deterministic rules are enforced across Claude Code, OpenAI Codex, Cursor, and your CI pipeline.

## The problem: advisory rules don't hold

Agent instructions in `CLAUDE.md`, `AGENTS.md`, or system prompts are **advisory** — the model may follow them, or it may not, especially under context pressure. There is no mechanism that *prevents* a `Write` to `db/migrations/` or a leaked `sk-live-*` secret. See [Why Advisory Prompts Fail](/docs/concepts/advisory-vs-deterministic/) for the full argument.

## The fix: intercept before execution

`policyctl` hooks into the agent's tool-call lifecycle and evaluates every call against compiled matchers **before it runs**:

```
Agent plans tool call (Edit, Bash, Write, apply_patch, …)
        │
        ▼
Hook fires → policyctl eval --hook  (<12ms, local, no network)
        │
   ┌────┴────┐
   ▼         ▼
 ALLOW      BLOCK (exit 2 + remediation message)
```

The agent either proceeds or receives a denial message telling it exactly what to do instead. Nothing probabilistic is involved: the same input always produces the same verdict.

## One file, every surface

| Surface | Enforcement point |
|---|---|
| Claude Code / Codex / Cursor | `PreToolUse` hook → `policyctl eval --hook` |
| Git pre-commit | `.git/hooks/pre-commit` → `policyctl check` on staged diff |
| GitHub Actions / GitLab CI | `policyctl check --from <base> --to HEAD` as a merge gate |
| Team dashboard (Cloud) | `policyctl push` / `pull` / `report` sync policy versions and violations |

Local evaluation is fully offline with zero telemetry. The Cloud control plane only receives what you explicitly stream (`push`, `report`). See [Security Model & Privacy](/docs/concepts/security-model/).

## Next steps

- [Installation](/docs/get-started/installation/) — get the CLI in under a minute
- [Quickstart](/docs/tutorials/getting-started/) — your first BLOCK in 5 minutes
- [Core Concepts](/docs/get-started/core-concepts/) — policy file, rules, matchers, enforcement
