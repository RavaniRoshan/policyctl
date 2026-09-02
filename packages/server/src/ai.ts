import type { Env } from "./types.js";
import type { AiAnalyzeResult, AiAuthorResult } from "@policyctl/types";

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

/** Compute a SHA-256 cache key for a given AI request payload. */
async function aiCacheKey(messages: AiMessage[]): Promise<string> {
  const payload = MODEL + JSON.stringify(messages);
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  const hex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `ai:resp:v1:${hex}`;
}

async function runAi(env: Env, messages: AiMessage[], maxTokens = 1024): Promise<string> {
  const key = await aiCacheKey(messages);

  // Check KV cache — same inputs return cached output (saves Workers AI credits).
  const cached = await env.POLICYCTL_CACHE.get(key, "text");
  if (cached != null) return cached;

  try {
    const res = (await env.AI.run(MODEL, {
      messages,
      max_tokens: maxTokens,
    })) as { response?: string };
    const response = res.response ?? "";

    // Only cache successful (non-error) results.
    if (response) {
      await env.POLICYCTL_CACHE.put(key, response, { expirationTtl: 3600 });
    }
    return response;
  } catch (e) {
    return `AI inference failed: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function analyzeDiff(
  env: Env,
  diff: string,
  policy: string,
  repo: string,
): Promise<AiAnalyzeResult> {
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
    const json = JSON.parse(extractJson(raw)) as AiAnalyzeResult;
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

export async function authorRule(env: Env, intent: string): Promise<AiAuthorResult> {
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
    const json = JSON.parse(extractJson(raw)) as AiAuthorResult;
    return { rule: json.rule ?? "", explanation: json.explanation ?? "" };
  } catch {
    return { rule: raw, explanation: "" };
  }
}
