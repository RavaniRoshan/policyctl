---
title: Security Model & Privacy
description: Learn about policyctl's local-first execution model, zero telemetry policy, and self-protecting rules.
---

Security and privacy are the primary engineering tenets of `policyctl`. A policy runtime must not introduce a new security vulnerability or exfiltrate proprietary code.

---

## 1. Zero Telemetry & Local-First Execution

The `policyctl` CLI is completely open-source (MIT licensed) and local-first:
- **No Network Calls by Default**: Running `policyctl check`, `policyctl eval`, or `policyctl init` executes 100% locally on your machine.
- **Zero Telemetry**: No anonymous usage data, pingbacks, or analytics are sent to any server.
- **Auditable Binary**: Built directly from TypeScript source code in `packages/cli`.

---

## 2. Self-Protecting Rules

A common concern with agent guardrails is: *"What stops the agent from editing `.policyctl.yml` and disabling the rules?"*

`policyctl` handles this through **self-guarding rules**:
When you run `policyctl init`, the default configuration automatically includes `.policyctl.yml` as a protected path:

```yaml
rules:
  - id: protect-policy-file
    description: "Agents cannot modify the policy file that governs them"
    scope: hook
    enforce: block
    message: "Modifications to {{path}} are denied. Only human developers can alter project policy."
    when:
      path: ".policyctl.y*ml"
```

If an agent attempts to edit `.policyctl.yml`, the hook intercepts the call and blocks the edit before the file is modified on disk.

---

## 3. Sandboxing & Fail-Open Guarantee

When operating in real-time agent hook mode (`eval --hook`):
- **Memory Isolated**: The evaluation executes in a short-lived Node/V8 process that exits in under 12 milliseconds.
- **Fail-Open Strategy**: If the policy file is temporarily corrupted (e.g. by a merge conflict), the CLI logs a warning and exits with code `0`. This prevents an accidental lockup of the developer's development environment while ensuring CI catches the issue before merge.

---

## 4. Cloud Control Plane Security

For teams using the optional hosted dashboard ($5/seat/month):
- **JWT Authentication**: Auth0 RS256 token verification using JSON Web Key Sets (JWKS).
- **Control Plane API Keys**: Generated using cryptographically random byte arrays (`crypto.getRandomValues`) and stored in Cloudflare D1 as irreversible SHA-256 hashes (`orgs.api_key_hash`).
- **Bot Defense**: Cloudflare Turnstile token validation on all public authentication and login flows.
