import type { Env } from "./types.js";

/**
 * Workers AI — semantic policy intelligence.
 *
 * Two capabilities:
 *   1. analyze  — given a diff + policy, explain violations in plain English
 *                  and suggest new rules
 *   2. author    — given a natural-language intent, produce a .policyctl.yml
 *                  rule block
 *
 * Both run edge LLM inference via the AI binding. Model choice is deferred
 * (see README); we default to a fast instruct model and let the response
 * shape the final pick.
 */

const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

/** Extract JSON from a response that may be wrapped in markdown code fences. */
function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n\s*```$/);
  if (fence) return fence[1].trim();
  return trimmed;
}

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function runAi(env: Env, messages: AiMessage[], maxTokens = 1024): Promise<string> {
  try {
    const res = (await env.AI.run(MODEL, {
      messages,
      max_tokens: maxTokens,
    })) as { response?: string };
    return res.response ?? "";
  } catch (e) {
    return `AI inference failed: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export interface AnalyzeResult {
  summary: string;
  violations: { ruleId?: string; explanation: string }[];
  suggestedRules: string[];
}

export async function analyzeDiff(
  env: Env,
  diff: string,
  policy: string,
  repo: string,
): Promise<AnalyzeResult> {
  const system = `You are a policy enforcement analyst for coding AI agents.
Given a git diff, the current policy, and the repo name, you:
1. Summarize what the diff does in 1-2 sentences.
2. Identify any violations of the policy rules, explaining each in plain English.
3. Suggest 1-3 new policy rules (as YAML snippets) that would catch similar issues.

Be concise. Only flag real violations, not hypotheticals.`;

  const user = `Repo: ${repo}

Current policy:
\`\`\`yaml
${policy || "(no policy set)"}
\`\`\`

Diff:
\`\`\`diff
${diff.slice(0, 8000)}
\`\`\`

Respond as JSON: { "summary": "...", "violations": [{"ruleId": "...", "explanation": "..."}], "suggestedRules": ["yaml snippet"] }`;

  const raw = await runAi(env, [
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  try {
    const json = JSON.parse(extractJson(raw)) as AnalyzeResult;
    return {
      summary: json.summary ?? "",
      violations: json.violations ?? [],
      suggestedRules: json.suggestedRules ?? [],
    };
  } catch {
    // LLM didn't return valid JSON — return the raw text as the summary
    return { summary: raw, violations: [], suggestedRules: [] };
  }
}

export interface AuthorResult {
  rule: string; // YAML snippet
  explanation: string;
}

export async function authorRule(env: Env, intent: string): Promise<AuthorResult> {
  const system = `You are a policy authoring assistant for policyctl, a
provider-agnostic policy runtime for coding AI agents. Given a user's
natural-language intent, produce a single .policyctl.yml rule block.

A rule has:
- id: kebab-case identifier
- description: one sentence
- scope: hook | ci | both
- when: matchers (path, command, tool, diff_contains, diff_not_contains, diff_regex, diff_paths_glob, diff_paths_not_glob)
- enforce: block | fail | warn

Only use matchers that exist in policyctl. Respond as JSON:
{ "rule": "yaml snippet", "explanation": "one sentence" }`;

  const user = `Intent: "${intent}"

Respond as JSON.`;

  const raw = await runAi(env, [
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  try {
    const json = JSON.parse(extractJson(raw)) as AuthorResult;
    return { rule: json.rule ?? "", explanation: json.explanation ?? "" };
  } catch {
    return { rule: raw, explanation: "" };
  }
}
