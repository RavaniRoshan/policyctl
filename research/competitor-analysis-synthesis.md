# Policyctl — Competitor Analysis & Positioning Strategy

> Research date: 2026-08-29. Method: 6 parallel subagents + adversarial verification.

## Direct Competitors (verified)

| Product | Position | Enforcement | Target |
|---|---|---|---|
| **Omnigent** | "Common layer over Claude Code, Codex, Pi" — meta-harness + sandboxing + spend caps | Hard (OS sandbox + policy) | Developers building multi-provider agents |
| **HumanLayer** | "Multiplayer coding agent workspace" — audit logs + human-in-the-loop | Soft + human-in-loop | Teams using Claude Code/Codex/Copilot |
| **Snyk** | "Secure AI-generated code" — governs development agents | Soft (scanning) + hard (PR gates) | Security teams, CISOs |
| **Semgrep** | "Code security for builders and agents" | Soft (scanning) + CI gates | Developers, AppSec |

## Key Insight

Every hard-enforcement approach (Claude Code hooks, Codex exec policy) is **vendor-locked**.
OPA/Rego is provider-agnostic but requires custom integration work.
**Policyctl is the only product combining hard, deterministic enforcement with provider-agnosticism.**
That is the positioning to own.

## Landing Page Design Patterns (stolen from best-in-class)

### Structure (mirror Cloudflare's proven pattern):
1. **Hero** — H1 + subheading + dual CTA + "free/made for"/"built for" meta. WebGL gradient-wave shader background.
2. **"Trusted by" strip** — staff engineers, open source, early adopters.
3. **The gap** — problem section: "Prompt files don't work" (32 violations / 56 days).
4. **How it works** — 3-step flow (Init → Wire → Check).
5. **Feature/benefit grid** — 3-column cards (Claude/Codex/Cursor + CI unified).
6. **Hard vs. soft comparison** — the sharpest edge: prompt files (weak) vs deterministic hooks (strong).
7. **Live terminal demo** — policyctl check in action.
8. **Testimonial** — early adopter quote.
9. **Pricing** — Free CLI + paid hosted plane.
10. **FAQ** — accordion.
11. **Final CTA** — "Start enforcing today."

### Visual identity:
- **WebGL hero**: Vercel-style shader scene (gradient wave via existing GradientWave component).
- **Color palette**: Cloudflare orange (#F6821F) accents on policyctl teal/emerald dark foundation.
- **Typography**: Inter (body) + Space Grotesk (display) + JetBrains Mono (code) — already in use.
- **Dark mode first**, near-universal in 2025-2026.

## Unique Positioning Vectors
1. **Provider-agnostic** — only tool enforcing one policy file across Claude Code + Codex + Cursor + CI
2. **Procedural rules** — not just security: migrations, README protection, test coverage
3. **Local-first** — no cloud dependency for core enforcement; MIT licensed
4. **Free CLI** — complete local experience, paid hosted plane is optional
