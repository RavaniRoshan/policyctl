# Competitor Landscape: Coding-Agent Policy & Guardrails

> Deep research for **policyctl** — a provider-agnostic policy runtime for coding AI agents.
> Research date: 2026-08-29. Method: parallel subagent search → adversarial verification → re-verification of hallucinations.

**Executive summary.** The direct-competitor set for policyctl is *small*. Most names floated in the first research pass (Chock, Vectimus, AgentJail, CC Safety Net, Greywall, Rampart, etc.) were hallucinated by the research agents — they do not exist. After verification, only **two** products match policyctl's "provider-agnostic policy enforcement" positioning: **Omnigent** and **HumanLayer**. Two incumbent security platforms (**Snyk**, **Semgrep**) are expanding into agent governance. The dominant "approach" is vendor-native hooks (Claude Code, Codex) — strong but locked to one provider, which is exactly the gap policyctl fills. The market is early, real pain is acute, and no one owns the "policy-as-code, provider-agnostic" category yet.

---

## 1. Verified direct competitors

These are the only products verified to exist *and* enforce policies across multiple coding-agent providers.

| Product | URL | Positioning | Pricing | Target |
|---|---|---|---|---|
| **Omnigent** | https://omnigent.ai | "A common layer over Claude Code, Codex, Pi, and the agents you write yourself: swap or combine harnesses without rewriting, keep them in check with policies and sandboxing." Contextual policies: stateful spend caps, model routing, risk-based escalation. Secure OS sandbox. | Not public (early-stage) | Developers building/running multi-provider agents |
| **HumanLayer** | https://humanlayer.dev | "The Multiplayer Coding Agent Workspace" / "Ship Fast Without Sacrificing Quality." Audit logs, human-in-the-loop, governance. | Free (3 users, 200 sessions/mo); Pro $100/user/mo; Enterprise custom | Teams using Claude Code, Codex, Copilot |

**Omnigent is the closest competitor.** It shares policyctl's core thesis — a common governance layer across Claude Code, Codex, and other harnesses. Its differentiator is the meta-harness/orchestration angle; policyctl's differentiator is the policy-as-code engine (declarative `.policyctl.yml`, matchers, CI gate). Omnigent is earlier-stage with no public pricing.

**HumanLayer** is broader (a multiplayer workspace) with governance as one feature. Its "compounding engineering" angle (agents get smarter over time) is more about context accumulation than deterministic enforcement.

### Incumbent security platforms expanding into agent governance

| Product | URL | Agent-governance claim | Pricing | Target |
|---|---|---|---|---|
| **Snyk** | https://snyk.io | "An independent security layer that continuously validates AI-generated code, governs development agents, and secures AI-native applications." | Enterprise sales | Security teams, CISOs |
| **Semgrep** | https://semgrep.dev | "Code security for builders and agents." "Built-in guardrails guide safe fixes before code ships." | Free (≤10 devs); Teams ~$30/dev/mo; Enterprise custom | Developers, AppSec, CISOs |

These are not policyctl's direct competitors today, but they signal where the market is heading: security platforms absorbing agent governance. Snyk's "governs development agents" and Semgrep's "guardrails" language are direct encroachment on policyctl's positioning.

### Excluded (verified to exist but NO policy/guardrail capability)

Trunk, CodeRabbit, Greptile, Aider, Cursor, Codex, OpenHands, Devin, Windsurf, Cline, Continue — all real products, none enforce cross-agent policy. They are *adjacent* (code review, CI, IDEs) but not competitors for the policy-runtime slot.

---

## 2. Verified guardrail approaches (how the space works)

| Approach | How it works | Enforcement level | Source |
|---|---|---|---|
| **Claude Code permissions** | Allow/deny/ask rules per tool, targeting commands/paths/domains (e.g. `Bash(git push *)`, `Edit(deny: ["~/.aws/**"])`). Saved to `.claude/settings.json`. | Hard (deterministic, pre-tool) | [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/permissions) |
| **Claude Code hooks** | Shell commands / HTTP / MCP / LLM prompts at lifecycle events (PreToolUse, PostToolUse, SessionStart, Stop). PreToolUse exit-2 blocks a tool call. | Hard (can override allow rules) | [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/hooks) |
| **Claude Code sandbox** | macOS Seatbelt / Linux bubblewrap filesystem + network isolation for Bash. | Hard (OS-level) | [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/sandboxing) |
| **OpenAI Codex exec policy** | Starlark `.rules` files with `prefix_rule()` → allow/prompt/forbidden for commands outside sandbox. | Hard (pre-execution) | [developers.openai.com](https://developers.openai.com/codex/exec-policy) |
| **Codex AGENTS.md** | Instruction chain from `AGENTS.md` files (global + project scope). 32 KiB limit. | Soft (prompt-level only) | [developers.openai.com](https://developers.openai.com/codex/guides/agents-md) |
| **Codex sandbox** | Cloud container, internet off by default. Local CLI uses exec policy + sandbox. | Hard (cloud) | [developers.openai.com](https://developers.openai.com/codex/security) |
| **Cursor Rules** | Project rules (`.cursor/rules/*.mdc`), Team Rules (org-wide, enforced via dashboard), User Rules, AGENTS.md. | Soft (prompt-level) | [cursor.com/docs](https://cursor.com/docs/context/rules) |
| **GitHub Copilot instructions + hooks** | Custom instructions files + hooks for validation/logging/scanning/automation. | Soft (instructions) / automation (hooks) | [docs.github.com](https://docs.github.com/en/copilot/concepts/about-copilot-coding-agent) |
| **MCP** | Client-server protocol. Host (Claude Code, Cursor) manages connections. Not enforcement itself — guardrails are host-implemented. | None (protocol) | [modelcontextprotocol.io](https://modelcontextprotocol.io/docs/concepts/architecture) |
| **OPA / Rego** | General-purpose policy engine. Declarative Rego evaluates JSON input → allow/deny. CNCF graduated. Needs custom integration for agents. | Hard (if integrated) | [openpolicyagent.org](https://www.openpolicyagent.org/docs/latest/) |

**The key insight:** every hard-enforcement approach above is *vendor-locked* (Claude Code hooks only work in Claude; Codex exec policy only works in Codex). OPA is provider-agnostic but requires you to build the integration yourself. **policyctl is the only product that combines hard, deterministic enforcement with provider-agnosticism.** That is the positioning to own.

---

## 3. How competitors market themselves (landing-page patterns)

From verified landing pages (Snyk, Semgrep, Cursor, Claude Code, Codex, HumanLayer, Omnigent, Greptile, CodeRabbit):

### Headline patterns
- **Outcome-first, 4-8 words:** "Code security for builders and agents" (Semgrep), "Ship Fast Without Sacrificing Quality" (HumanLayer), "The Multiplayer Coding Agent Workspace" (HumanLayer).
- **"Without losing control" framing:** Snyk's "move fast with AI without losing control" — the dominant emotional hook.
- **Trust/verification language:** "Can you trust what you're shipping?" (Snyk), "The future isn't writing code. It's reviewing it." (CodeRabbit).

### Value-prop structure
1. **One bold claim** (headline)
2. **One sentence of mechanism** (how it works)
3. **3-5 feature bullets** with icons
4. **Social proof** (logos, "used by Fortune 500", star counts)
5. **Two CTAs** (primary action + secondary "learn more/docs")

### Pricing models
- **Enterprise sales** (Snyk, Semgrep Enterprise, HumanLayer Enterprise) — no public price.
- **Free tier + per-seat** (Semgrep, Greptile, HumanLayer Pro).
- **Usage-based** (Claude Code via API, Codex via ChatGPT subscription).
- **Free + bring-your-own-model** (Aider).

### What policyctl's landing page should steal
- **Short, outcome-first headline** (not "Provider-agnostic policy runtime" — that's a category label, not a benefit).
- **"Without losing control" emotional hook** — the dominant market anxiety.
- **Mechanism sentence immediately after headline** — what it is and why prompt-files fail.
- **Provider-agnosticism as the hero differentiator** — visualized (Claude + Codex + Cursor icons with one policy file).
- **Hard vs. soft guardrails** — a visual that shows prompt-files (weak) vs. deterministic hooks (strong). This is policyctl's sharpest edge.

---

## 4. User pain points (verified)

From GitHub issues (AutoGen, LangChain, LangGraph), Anthropic engineering docs, and framework communities:

- **Prompt-based guardrails are broken.** Agents treat workflow rules as suggestions. A documented case: 32 violations over 56 days despite 8 configured guardrail mechanisms — all ignored. (source: [microsoft/autogen#7770](https://github.com/microsoft/autogen/issues/7770))
- **No standardized hook point** between agent decision and tool execution. AutoGen lacks any mechanism to intercept tool calls before execution. (source: [microsoft/autogen#7405](https://github.com/microsoft/autogen/issues/7405))
- **No persistent violation state** survives context resets or re-logins. After every reset, all rules are forgotten. (source: [microsoft/autogen#7770](https://github.com/microsoft/autogen/issues/7770))
- **Over-specified rule files get ignored.** Anthropic docs: "If your CLAUDE.md is too long, Claude ignores half of it." (source: [anthropic.com/engineering/claude-code-best-practices](https://www.anthropic.com/engineering/claude-code-best-practices))
- **The trust-then-verify gap.** Agents produce plausible-looking code that doesn't handle edge cases. Without deterministic verification, users ship broken code. (source: Anthropic best practices)
- **Approval mechanisms are bolted on**, not built in. No built-in approval at tool or agent level; context (user credentials) can't propagate through the call stack. (source: [microsoft/autogen#4894](https://github.com/microsoft/autogen/issues/4894))

> **Note:** A widely-cited "$106K loss from prompt-guardrail failure" anecdote was investigated and **could not be sourced** — it appears to be a hallucination. The underlying pain (agents ignoring rules with real damage) is well-documented, but that specific figure should not be used.

---

## 5. Disagreements & open questions

- **Is "provider-agnostic" a real buyer need or a nice-to-have?** Most teams currently use one agent (Claude Code OR Codex). Mixed-agent stacks are a staff-engineer pattern today, but growing. policyctl's bet is that multi-agent becomes the norm.
- **Will vendor-native hooks (Claude Code, Codex) absorb this space?** They're hard to beat on integration depth, but they lock you in. The risk is that Anthropic/OpenAI make cross-agent policy a non-problem — but neither shows signs of prioritizing it.
- **OPA/Rego as a competitor or foundation?** Several competitors (Cupcake, AgentJail in the hallucinated set) claimed OPA-based engines. OPA is real and powerful but requires integration work. policyctl could position *against* "you have to build it yourself with OPA."

---

## 6. Recommendations for policyctl's landing page

1. **Own the category name.** No one else calls it "provider-agnostic policy runtime." Lead with it.
2. **Headline = benefit, not category.** Current: "Make your coding agents obey the rules." Strong. Keep that energy but sharpen: lead with the *pain* (agents ignoring rules) → *mechanism* (deterministic, not prompts) → *scope* (every agent, one file).
3. **Visual: one policy file → three agent icons.** This is the entire product thesis in one image. Claude + Codex + Cursor with a single `.policyctl.yml` flowing into all three.
4. **Hard vs. soft guardrails comparison.** A 2-column visual: "Prompt files (CLAUDE.md, .cursorrules) — advisory, ignored" vs. "policyctl — deterministic hooks + CI gate, enforced." This is the sharpest edge over both vendor-native hooks (locked-in) and prompt-files (weak).
5. **"Without losing control" emotional hook.** The market's dominant anxiety. Use it.
6. **Social proof band.** Even early: "Built for staff engineers running mixed-agent stacks." Add logos/testimonials as they come.
7. **Two CTAs.** Primary: "Install policyctl" (the npm one-liner). Secondary: "Read the docs" or "See it in action" (the terminal demo).
8. **Pricing clarity.** "Free CLI, paid hosted control plane." Remove friction — the CLI must feel complete and free.

---

## 7. Full source list

- [Anthropic Claude Code permissions](https://docs.anthropic.com/en/docs/claude-code/permissions)
- [Anthropic Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Anthropic Claude Code sandboxing](https://docs.anthropic.com/en/docs/claude-code/sandboxing)
- [Anthropic Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [OpenAI Codex exec policy](https://developers.openai.com/codex/exec-policy)
- [OpenAI Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [OpenAI Codex security](https://developers.openai.com/codex/security)
- [Cursor Rules](https://cursor.com/docs/context/rules)
- [GitHub Copilot coding agent](https://docs.github.com/en/copilot/concepts/about-copilot-coding-agent)
- [MCP architecture](https://modelcontextprotocol.io/docs/concepts/architecture)
- [Open Policy Agent](https://www.openpolicyagent.org/docs/latest/)
- [Omnigent](https://omnigent.ai)
- [HumanLayer](https://humanlayer.dev)
- [Snyk](https://snyk.io)
- [Semgrep](https://semgrep.dev)
- [AutoGen #7770 (guardrail failures)](https://github.com/microsoft/autogen/issues/7770)
- [AutoGen #7405 (hook gap)](https://github.com/microsoft/autogen/issues/7405)
- [AutoGen #4894 (approval bolted-on)](https://github.com/microsoft/autogen/issues/4894)
