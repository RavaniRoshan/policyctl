# LinkedIn launch post + personal DM templates

---

## LinkedIn post (evening posting works well)

```
I got burned by my own AI coding agent one too many times.

The pattern was always the same: a few hours into a session, the agent would "helpfully" rewrite a config file I'd protected, or sneak an API key into a diff — even though my instructions clearly said not to.

The problem isn't the model. It's that instructions are advice, and advice degrades as context fills up.

So I built the thing I wished existed: a policy runtime. One YAML file, enforced at the agent's tool-call layer — before the file is written, before the command runs. Deterministic. No LLM in the decision path. Under 12ms per call.

One .policyctl.yml now enforces the same rules in Claude Code, OpenAI Codex, Cursor, and CI — so the whole team inherits the same guardrails from git.

policyctl launched on Product Hunt today. The CLI is free, MIT-licensed, and local-first — no telemetry, no lock-in:

npx @policyctl/cli init

If you've ever watched an agent ignore your rules, I built this for you. And if you're building with AI agents today, I'd genuinely value your feedback on what rules you'd want:

https://www.producthunt.com/posts/policyctl

#AI #DeveloperTools #OpenSource #Claude #Cursor
```

---

## Personal DM templates

DMs convert 20–40% to upvotes vs ~5% for public posts. Send in waves of ~20/hour — steady, human pace.

### A — Warm personal contact (friend/colleague who knows you)

```
Hey [name] — I'm launching my open-source policy engine on Product Hunt today. It's one YAML file that stops AI coding agents from rewriting protected files or leaking secrets — the thing I've been building for months.

Would mean a lot if you took a look and dropped a comment with honest feedback (comments matter more than upvotes). And if you have a Product Hunt account from before today, an upvote counts extra.

https://www.producthunt.com/posts/policyctl

Either way — hope you're well!
```

### B — Developer in your network (knows you, hasn't used the product)

```
Hi [name] — quick one, no pressure. I know you work with [Claude Code / Cursor / Copilot] — I built policyctl, a free MIT tool that gates agent tool calls against one YAML policy file (blocks protected-file rewrites, secret leaks, etc. — under 12ms, fully local).

It's on Product Hunt today and I'd value a dev's eye on it — honest comment on the post if anything seems off, or an upvote if it doesn't.

https://www.producthunt.com/posts/policyctl

If it's not your thing, zero offense taken!
```

### C — AI/dev-tools community member

```
Hey [name] — saw your post on [topic] and it's exactly the problem I've been working on. policyctl (MIT, free) is one .policyctl.yml that blocks AI agents from touching protected paths / leaking secrets in diffs — enforced at tool-call time, not prompt-advice time.

We just launched on PH; if you have a sec today, honest feedback on the post would help an indie launch a lot:

https://www.producthunt.com/posts/policyctl
```

### Key principles for all DMs

1. **Never** ask someone to create a fresh PH account to upvote — new-account votes are discounted and can flag the launch. If they don't have an account, a comment or trying the CLI helps more.
2. Ask for *honest feedback and comments* first, upvote second — comments carry more ranking weight AND don't feel like vote-begging.
3. Personalize the first line for every single DM. A template-shaped DM gets ignored.
4. Wave 1: warmest 20 contacts. Wave 2: next 20 at +1h. Continue hourly. 80 total spread over 4+ hours beats 200 in one blast — both for the algorithm and for your relationships.
5. Everyone who upvotes/comments: thank them personally. They're your launch day two.
