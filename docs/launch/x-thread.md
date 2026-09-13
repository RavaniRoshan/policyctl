# X (Twitter) launch thread — policyctl

**Timing:** Post immediately, then pin to profile. Re-share at hour 6 and hour 12 with different openers ("6 hours in — top 25 on PH, thank you" momentum posts convert well).

**Attach to tweet 1:** the demo GIF (`docs/src/assets/demo.gif` — the BLOCK migration + BLOCK secret + ALLOW remediated flow). Video/GIF massively outperforms text-only.

---

## Thread (7 tweets)

**1/7** (with demo GIF attached)

```
Every AI coding agent has its own policy config. CLAUDE.md for Claude. .cursorrules for Cursor. Nothing for Codex.

They're all advice. Advice degrades as the context window fills up.

So I built one deterministic runtime for all of them. 🧵
```

**2/7**

```
policyctl is one .policyctl.yml file that hooks INTO the agent's tool calls — before a file is written, before a command runs — and blocks prohibited operations.

Not advice. A runtime gate. <12ms per call, 100% local.
```

**3/7**

```
What it catches in practice:

– agent rewrites protected db/migrations/** → BLOCKED
– .env secret sneaks into a diff → BLOCKED
– hand-written migration in an autonomous run → BLOCKED, exit 2

The remediated run is ALLOWED. You keep the flow, kill the damage.
```

**4/7**

```
8 matchers: file path, command kind, diff pattern, AST, tool name, regex, glob, and semantic.

The AST one is my favorite — "no .forEach on the main thread" catches it in real code, not string matches.
```

**5/7**

```
Same YAML file works in:

– Claude Code
– OpenAI Codex
– Cursor
– your CI (fails the PR on a block)

One policy, every agent, every environment. No lock-in.
```

**6/7**

```
Free forever, MIT-licensed, local-first, zero telemetry:

npx @policyctl/cli init

Cloud tier ($5/seat) adds team policy versioning, an audit feed, AI rule authoring — for when compliance says "prove it."
```

**7/7**

```
We just launched on Product Hunt. If an agent ever trashed a file you told it not to touch — an upvote helps an indie open-source launch a lot:

https://www.producthunt.com/posts/policyctl

GitHub: https://github.com/RavaniRoshan/policyctl
```

---

## Reply strategy

- Reply to 2–3 big AI-tool threads/hot takes per hour with a genuinely useful comment; link policyctl only when it directly answers someone's pain ("agent rewrote my config" — perfect opening). No drive-by links.
- When someone asks a real question in your replies, answer with a screenshot or a YAML snippet — these get quote-tweeted.
- At hour ~12: "We're top N on Product Hunt with X hours to go" + link. Momentum posts convert.
- Thank everyone who engages. First 60 minutes of thread life matter most.

## After the launch day

Unpin and re-post the best single tweet as a standalone (usually 3/7 or 5/7) with the demo GIF a few days later — evergreen content.
