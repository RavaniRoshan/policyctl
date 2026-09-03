---
title: Limit Blast Radius
description: Recipe for constraining agent edits to prevent runaway hallucinations and accidental widespread code deletion.
---

Coding agents under deep prompt chaining can occasionally enter a hallucination loop: touching dozens of unrelated files, wiping directories with `rm -rf`, or making edits across entire monorepos.

`policyctl` provides safeguards both at the command level and at the file path level.

---

## 1. Block Destructive Shell Commands

Agents with shell access (e.g. Claude Code's `Bash` tool) can execute arbitrary commands. Block hazardous commands at hook time:

```yaml
rules:
  - id: deny-destructive-bash
    description: "Prevent execution of destructive recursive commands"
    scope: hook
    enforce: block
    message: "Destructive shell command denied: {{tool}}"
    when:
      command: "(?i)(rm\\s+-rf\\s+[\\/~]|git\\s+reset\\s+--hard|git\\s+clean\\s+-fdx|drop\\s+database)"
```

---

## 2. Restrict Directory Boundaries

Prevent an agent assigned to the frontend from making changes to backend or infrastructure code:

```yaml
rules:
  - id: frontend-agent-jail
    description: "Frontend tasks are jailed to web/ and packages/design-system/"
    scope: hook
    enforce: block
    message: "Path {{path}} is outside frontend scope. Edit files within web/ only."
    when:
      any:
        - { path: "packages/server/**" }
        - { path: "infra/**" }
        - { path: "docker-compose.yml" }
```

---

## 3. Pairing with `trace` for Debugging

If you want to see exactly which rules evaluate and why:

```bash
# Debug a shell command
echo '{"tool_name": "Bash", "tool_input": {"command": "rm -rf /"}}' | policyctl trace --mode hook
```

`trace` will print every evaluated matcher group with verbose match details:

```text
[all]
  ✓ command: (?i)(rm\s+-rf\s+[\/~]...) -> MATCHED
Verdict: BLOCK (exit 2)
```
