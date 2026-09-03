---
title: Hook Execution Lifecycle
description: Step-by-step trace of how an agent tool call is intercepted, evaluated, and returned as an allow or deny verdict.
---

This document traces the complete lifecycle of a tool call from the moment an AI agent proposes an operation to the final verdict returned by `policyctl`.

---

## Lifecycle Sequence Diagram

```
+---------------+            +------------------+            +-------------------+
|  Agent Host   |            |  policyctl eval  |            |   File System /   |
| (Claude/Cursor)            |      Engine      |            |     OS Process    |
+-------+-------+            +--------+---------+            +---------+---------+
        |                             |                                |
        | 1. Proposes tool call       |                                |
        |    e.g. Write("config.json")|                                |
        |                             |                                |
        | 2. Spawns hook process      |                                |
        |    Pipes JSON on stdin ---->|                                |
        |                             | 3. Resolves .policyctl.yml     |
        |                             |    from project root           |
        |                             |                                |
        |                             | 4. Interpolates vars           |
        |                             |    and process.env             |
        |                             |                                |
        |                             | 5. Evaluates applicable        |
        |                             |    matchers (path, tool)       |
        |                             |                                |
        |                             | 6. Applies whitelist           |
        |                             |    exceptions                  |
        |                             |                                |
        | 7. Receives process exit    |                                |
        |    code (0, 1, or 2) <------+                                |
        |                             |                                |
        +-----------------------------+                                |
        |                                                              |
   ┌────┴──────────────────────────────┐                               |
   ▼                                   ▼                               |
Exit 0: Allow                       Exit 2: Deny                       |
Agent proceeds with tool execution   Agent receives rejection message  |
and modifies disk                   Tool call aborted                  |
        │                                                              |
        v                                                              |
+-------+--------------------------------------------------------------+
| 8. Modifies file on disk                                             |
+----------------------------------------------------------------------+
```

---

## The 7-Step Evaluation Pipeline

1. **Event Ingestion**: `policyctl eval` reads the JSON payload from standard input.
2. **Policy Discovery**: Locates `.policyctl.yml` (or `.yaml`) by traversing up the directory tree.
3. **Scope Filtering**: Rules with `scope: ci` are skipped immediately. Only rules where `scope === 'hook'` or `scope === 'both'` are processed.
4. **Variable Interpolation**: Replaces tokens like `${protected_files}` with values from `vars` or environment variables.
5. **Matcher Set Evaluation**: Evaluates globs via `picomatch` and commands via regex. Computes boolean conjunctions across `all` and `any` clauses.
6. **Exception Verification**: If a rule triggers, checks the `exceptions` block. If a matching exception exists with `enforce: ignore`, the violation is dismissed.
7. **Verdict Return**:
   - Exit `0`: Operation permitted.
   - Exit `1`: Warning logged, operation permitted.
   - Exit `2`: Operation blocked, agent receives error message via stderr.
