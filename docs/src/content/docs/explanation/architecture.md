---
title: Architecture & Engine
description: Deep dive into the policyctl evaluation engine, microsecond runtimes, and the zero LLM drift design principle.
---

`policyctl` is architected as a **deterministic, local-first runtime**. Unlike AI evaluators that rely on secondary language model calls to judge agent outputs, `policyctl` uses compiled, programmatic pattern matching.

---

## 1. The Zero LLM Drift Principle

```
Secondary LLM Judge (FLAWED)
Agent Output ──▶ Call OpenAI/Anthropic API ──▶ 1500ms latency, probabilistic verdict, costs $$$

policyctl Deterministic Runtime (CORRECT)
Agent Tool Call ──▶ In-Process Native Engine ──▶ <12ms runtime, identical output every time, $0
```

### Why Secondary LLMs Fail as Policy Gates:
1. **Probabilistic Non-Determinism**: The same code diff evaluated five times by an LLM will return different confidence scores and edge-case verdicts.
2. **High Latency**: Network roundtrips to an LLM provider add 1.2 to 3 seconds of blocking latency to every single tool call.
3. **Context Truncation**: Large diffs exceed prompt limits or incur massive token bills.

`policyctl` evaluates matchers using compiled globs (`picomatch`), optimized regular expressions, and substring searches. Given the exact same diff, it produces the exact same verdict 100% of the time.

---

## 2. Monorepo Architecture

The repository is structured into isolated packages:

```
policyctl/
├── packages/
│   ├── core/             # Pure deterministic engine (evaluators, matchers)
│   ├── cli/              # Static binary, command parsing, agent hook adapters
│   ├── design-system/    # Shared tokens, blueprint primitives, CurvyRect
│   ├── server/           # Edge Hono Worker, D1 SQL database, Cloudflare KV
│   └── types/            # Shared TypeScript contracts between Worker and SPA
├── web/                  # React Vite SPA (Marketing, Auth, Dashboard, Billing)
├── docs/                 # Dedicated Astro Starlight documentation platform
└── examples/             # Real-world reference policies
```

---

## 3. Storage Hierarchy

- **Evaluation Execution**: 100% local, runs entirely in memory on developer machines and in CI runners.
- **KV Cache (`POLICYCTL_CACHE`)**: Edge-cached policy YAML (30-second TTL) and cached daily reports.
- **SQL Database (Cloudflare D1)**: Relational storage for organizations, policy versions, member seat tracking, and immutable violation audit records.
- **Streaming Sessions**: Cloudflare Durable Objects (`PolicySession`) coordinate live tool calls and real-time dashboard updates over WebSockets.
