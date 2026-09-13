# Reddit launch posts — policyctl

**Rules of engagement (read first):**

- Read each sub's rules page before posting. If self-promo isn't allowed, post the *problem story* and only mention the tool in a comment reply when asked.
- Post in ONE sub at a time, 1–2 hours apart. Identical posts in multiple subs within an hour = spam-filter bait and user hostility.
- Answer every comment in the first 90 minutes. Reddit rewards comment depth; silent OPs get buried.
- Each post below has a genuinely different angle — use them as written, don't merge.

---

## Post 1 — r/ClaudeAI (first, US morning)

**Title:**

```
I got tired of Claude Code ignoring CLAUDE.md, so I built a runtime gate instead
```

**Body:**

```
Context windows fill up. When they do, CLAUDE.md stops mattering — the agent rewrites protected config, sneaks a secret into a diff, or runs a migration you told it (three messages ago) not to touch. Advice degrades; runtimes don't.

So I built policyctl — one .policyctl.yml file compiled to pattern tables, hooked into Claude Code's tool calls at execution time:

    version: 1
    rules:
      - id: protect-migrations
        action: BLOCK
        match:
          file: { path: "db/migrations/**" }
          command: { kind: write }
      - id: no-secrets
        action: BLOCK
        match:
          diff: { pattern: "(?i)(api[_-]?key|secret)\\s*[=:]<" }

Blocks happen before the write hits disk. <12ms per call, no LLM in the decision path, 100% local. `npx @policyctl/cli init` and it wires the hooks into Claude Code for you.

MIT-licensed, free, zero telemetry. There's a paid cloud tier for team versioning/audit but the CLI including hooks is free forever.

What rules would you want on your repo? Genuinely curious what Claude does that annoys people most — the matcher list grew from my own list of scars.

Demo video: https://www.youtube.com/watch?v=wYXd209Q0G0
```

**Comment-answer prep:** "How is this different from Claude Code's built-in permission prompts?" — one file across Claude + Codex + Cursor + CI (no per-tool config), deterministic matchers incl. AST, and you check it into git so the whole team inherits it.

---

## Post 2 — r/ChatGPTCoding (2h later)

**Title:**

```
PSA + tool: if your Codex/Cursor agent "forgets" your rules, it's not the rules — it's the runtime. I built the fix.
```

**Body:**

```
Every few days someone posts here about their agent deleting a file, rewriting protected code, or leaking an env var. The honest answer: prompt-based rules (CLAUDE.md, .cursorrules, AGENTS.md) are advice. When the context window fills, advice degrades.

Fix: don't advise — gate.

policyctl intercepts the agent's tool calls (Claude Code, Codex CLI, Cursor) at execution time and blocks prohibited operations before they hit disk:

- file path matcher — "nothing in db/migrations/** gets written"
- diff matcher — "no api_key= in any diff, ever"
- AST matcher — structural rules on real code, not string matching
- command matcher — kind of tool call, not just the string

<12ms per call, deterministic (no model in the loop), local-first, MIT. The CI gate fails a PR when a block fires, so the enforcement survives even when someone bypasses hooks locally.

Free CLI: npx @policyctl/cli init

It's open source and I want it to be genuinely useful — so tell me what rule you wish existed and I'll tell you if the 8 matchers can express it (or add one if they can't).

https://github.com/RavaniRoshan/policyctl
```

---

## Post 3 — r/cursor (2h later)

**Title:**

```
One .policyctl.yml that gates Cursor, Claude Code, Codex, and your CI — no more .cursorrules alone
```

**Body:**

```
.cursorrules works until it doesn't — when the context fills or the model's having a bad day, it rewrites something protected anyway. And it only covers Cursor; your teammate's Claude Code has a whole different config.

I open-sourced policyctl for this: one YAML file, compiled to deterministic pattern tables, hooked into each agent's tool-call layer. Same rules in Cursor, Claude Code, Codex, and a GitHub Actions gate that fails the PR when something fires.

Example — this exact rule blocks secret leakage across all of them:

    - id: no-secrets
      action: BLOCK
      match:
        diff:
          pattern: "(?i)(api[_-]?key|secret)\\s*[=:<>]?\\s*\\S+"

- <12ms per call, no LLM in the decision path
- 8 matchers (file, command, diff, AST, regex, glob, tool, semantic)
- local-first, zero telemetry, MIT license
- npx @policyctl/cli init wires Cursor hooks automatically

Would love feedback from Cursor users specifically: does Notepad/rules-only approach ever fail for you, or is it just me?

https://github.com/RavaniRoshan/policyctl
```

---

## Timing map

| Post | Sub | When |
|---|---|---|
| 1 | r/ClaudeAI | Hour 1–2 (US morning) |
| 2 | r/ChatGPTCoding | Hour 3–4 |
| 3 | r/cursor | Hour 5–6 |

If one takes off (100+ upvotes), stop the remaining scheduled posts and put all energy into that comment thread. One hot thread > three lukewarm ones.

Do NOT post in r/programming — wrong venue, will get removed and reported.
