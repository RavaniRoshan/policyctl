# Maker comments for the PH post — policyctl

Post these over the day, spaced 1–3 hours apart, each from your maker account. Fast, substantive maker replies are one of the strongest engagement signals on PH. Reply to every other comment within ~30 minutes.

---

## 1 — Launch story (post first / now)

```
Quick launch story: this started as a weekend hack after Claude Code rewrote a migration file my CLAUDE.md explicitly said (three messages earlier!) not to touch. Prompts are advice; advice degrades. So I built a runtime instead — one YAML file compiled to pattern tables, enforced at the agent's tool-call layer.

Free, MIT, local-first: npx @policyctl/cli init

Ask me anything about the matcher design — genuinely my favorite part of this project.
```

## 2 — Technical deep-dive (mid-morning)

```
For the curious — how the 8 matchers work:

file — path/glob rules ("nothing in db/migrations/** gets written")
command — tool-call kind, not just string match
diff — regex over the actual patch (catches secrets before they land)
AST — structural rules over real code ("no .forEach on the main thread")
regex / glob — escape hatches
semantic — similarity matching for fuzzier rules
tool — per-agent tool names

All compiled to pattern tables at init and evaluated in <12ms per call — no LLM in the decision path, which is the whole point: deterministic means testable, and testable means you can trust it in CI.
```

## 3 — Demo video (afternoon)

```
2-minute demo of the whole flow — init guardrails, hand-written migration BLOCKED (exit 2), secret in diff BLOCKED, remediated run ALLOWED:

https://www.youtube.com/watch?v=wYXd209Q0G0

The exit code matters: block = exit 2, so the agent sees the failure and self-corrects instead of silently proceeding.
```

## 4 — Roadmap (early evening)

```
What's next:

– GitHub org policies — one repo, enforced across every repo in an org
– More agent adapters (Windsurf, Aider, GitHub Copilot CLI)
– Rule packs — installable policy presets (Rails, Next.js, Django migrations)
– Static analysis hooks for the CI gate

The core promise won't change: the runtime stays free, MIT, local-first. Cloud adds team sync, audit, and AI — never paywalls safety.
```

## 5 — Final hours (late evening)

```
Last hours of launch day — thank you all for the feedback, the comments, and the upvotes. Reading every reply today; here for any question about policy-as-code, hooking agents, or the AST matcher design.

If policyctl saved you from one bad agent commit today, it was worth building. 🙏
```

---

## Comment-reply principles

- Reply to every commenter by name, referencing their specific point.
- For critical comments — engage, don't defend. "Fair — here's why we did X, but Y is a real gap we're thinking about" converts skeptics into comment-thread depth (which ranks you up).
- Technical questions: answer with a YAML snippet or a screenshot. These get upvoted too.
- Spread the 5 comments above; do NOT post all at once (looks astroturf-y).
- Tag team members in replies if they authored part of the system — maker badges on multiple people multiply engagement weight.
