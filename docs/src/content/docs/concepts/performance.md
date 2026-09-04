---
title: Performance & Latency Budget
description: Where time goes in a policyctl evaluation, why hooks stay under 12ms, and how to keep large policies fast.
---

`policyctl` sits in the hot path of **every agent tool call**, so the performance budget is strict: hook evaluation completes in **under 12ms** with zero network I/O.

## Where time goes

```
stdin JSON parse → policy load (in-memory) → matcher evaluation → verdict
     <1ms              <1ms                    1–10ms               <1ms
```

- **No LLM calls.** Matchers are compiled globs (`picomatch`), optimized regexes, and substring searches — the same input always yields the same verdict at the same cost. See [Architecture & Engine](/docs/concepts/architecture/).
- **No network.** Hook evaluation never touches the network. Cloud sync (`push`, `report`) happens out-of-band in CI or on explicit commands.
- **Fail-open is cheap.** A missing or invalid policy file exits `0` after a single filesystem stat, so misconfigured repos never slow agents down.

## CI evaluation

`policyctl check` evaluates the unified diff once against all `scope: ci` / `scope: both` rules. Cost scales with **diff size × rule count**, not repo size — unchanged files cost nothing.

## Cloud reads

The dashboard reads edge-cached policy YAML (KV, 30-second TTL) and D1 for audit history, so policy pulls and violation feeds stay sub-100ms at the edge without touching evaluation.

## Keeping large policies fast

1. Prefer `scope: hook` for interactive rules and `scope: ci` for diff-wide rules — don't pay hook latency for checks only CI can answer.
2. Use specific `path` globs (`db/migrations/**`) over broad `content_regex` scans.
3. Use `enforce: ignore` (or delete) stale rules instead of leaving dead weight in the file.
4. Run `policyctl trace --mode hook` to see per-rule timing when a hook feels slow.
