# Show HN post — policyctl

**Post timing:** ~8–10am ET on launch day (Sunday). After posting, stay in the thread for 3+ hours and answer every comment within 10 minutes. HN rewards fast, substantive maker replies more than points.

**Format:** Title goes in the title field; body goes as the first comment (Show HN convention — the text field is often left minimal, but including a short body is accepted for Show HN).

---

## Title

```
Show HN: One YAML file enforces policy across Claude Code, Codex, and Cursor
```

## First comment (the body)

```
Hey HN — I built policyctl because I kept getting burned by the same failure mode: my coding agent (Claude Code, Cursor, Codex — I use all three) would silently rewrite protected config files, sneak a `.env` value into a diff, or run a migration it was never supposed to touch. My `CLAUDE.md` said "don't do this" — the agent did it anyway once the context window filled up.

Prompts are advice. Advice degrades. So I built a policy runtime instead: a hook that intercepts every tool call at execution time and blocks prohibited operations *before* the file hits disk. Deterministic, no LLM in the decision path, <12ms per call, 100% local.

One `.policyctl.yml` file:

    version: 1
    rules:
      - id: protect-migrations
        action: BLOCK
        match:
          file:
            path: "db/migrations/**"
          command:
            kind: write
      - id: no-secrets
        action: BLOCK
        match:
          diff:
            pattern: "(?i)(api[_-]?key|secret)\\s*[=:]"

The same file works in Claude Code, OpenAI Codex, Cursor, and a CI gate (fails the PR on a block). Eight matchers: file path, command kind, diff pattern, AST, tool name, regex, glob, and semantic similarity. AST matcher means you can say "no `.forEach` on the main thread" and it catches it in real code, not string matches.

Free and MIT-licensed, local-first, zero telemetry:

    npx @policyctl/cli init

There's a paid cloud tier ($5/seat) for team policy versioning, an audit feed, and AI rule authoring — but the CLI including hooks and the CI gate is free forever. Demo video: https://www.youtube.com/watch?v=wYXd209Q0G0

Would genuinely love feedback on the matcher design — what rules would you want to write?
```

---

## Prepended to your account (post from your personal HN account with some karma; if your account is brand new, post from the oldest team account instead)

- Do NOT ask for upvotes anywhere. HN culture penalizes vote-solicitation hard; just answer questions.
- Real answers only. If someone calls it trivial, engage with the technical detail — the <12ms claim and the AST matcher are good threads to pull.
- If the thread takes off, post a follow-up comment around hour 3 summarizing the best feedback and what you'll change. HN loves that.
- Common questions you'll get, prep answers for: "How is this different from Claude Code's built-in permissions?" (answer: one file across 3 tools + CI, deterministic, no lock-in), "Why not just use pre-commit hooks?" (answer: intercepts at agent tool-call time, before the edit lands), "8 matchers but the hard ones are AST?" (answer: pattern tables compiled at init, evaluated in <12ms).

## Anti-patterns

- Don't post the link in the first 10 minutes to social media with "we're on HN!" — let it get organic traction from /newest first.
- Don't use multiple accounts to seed comments. HN detects it and it can kill the thread (and future ones).
