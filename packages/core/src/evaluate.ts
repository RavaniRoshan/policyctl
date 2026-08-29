import type {
  CiContext,
  EvalContext,
  EvalMode,
  Enforce,
  HookContext,
  Matchers,
  Policy,
  Rule,
  When,
} from "./types.js";
import { evaluateWhen, globMatchExported, isGroup } from "./matchers.js";

export interface EvaluationResult {
  ruleId: string;
  description?: string;
  enforce: Enforce;
  message: string;
}

export interface EvaluationOutcome {
  results: EvaluationResult[];
  /** 0 = allow, 1 = warn, 2 = deny (block/fail). */
  exitCode: 0 | 1 | 2;
}

function lookupVar(name: string, vars: Record<string, string>): string {
  return vars[name] ?? process.env[name] ?? "";
}

function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\$\{([^}]+)\}/g, (_, n) => lookupVar(String(n).trim(), vars));
}

function resolveMatchers(set: Matchers, vars: Record<string, string>): Matchers {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(set)) out[k] = interpolate(v, vars);
  return out as Matchers;
}

export function resolveWhen(when: When, vars: Record<string, string>): When {
  if (isGroup(when)) {
    return {
      all: (when.all ?? []).map((s) => resolveMatchers(s, vars)),
      any: (when.any ?? []).map((s) => resolveMatchers(s, vars)),
    };
  }
  return resolveMatchers(when, vars);
}

export { resolveMatchers };

function primaryPath(ctx: EvalContext, mode: EvalMode): string | undefined {
  return mode === "hook"
    ? (ctx as HookContext).file_path
    : (ctx as CiContext).files[0]?.path;
}

function renderMessage(rule: Rule, ctx: EvalContext, mode: EvalMode): string {
  const path = primaryPath(ctx, mode) ?? "";
  const tool = mode === "hook" ? (ctx as HookContext).tool : "ci";
  const base = rule.message ?? rule.description ?? rule.id;
  return base
    .replaceAll("{{ruleId}}", rule.id)
    .replaceAll("{{path}}", path)
    .replaceAll("{{tool}}", tool);
}

function applyExceptions(
  results: EvaluationResult[],
  policy: Policy,
  ctx: EvalContext,
  mode: EvalMode,
): EvaluationResult[] {
  if (!policy.exceptions || policy.exceptions.length === 0) return results;
  const path = primaryPath(ctx, mode);
  return results.filter((r) => {
    const exc = policy.exceptions!.find(
      (e) =>
        (!e.rule || e.rule === r.ruleId) &&
        (!e.path || (path != null && globMatchExported(e.path, [path]))),
    );
    if (!exc) return true;
    if (exc.enforce === "ignore") return false;
    r.enforce = "warn";
    r.message = `${r.message}  (sanctioned exception)`;
    return true;
  });
}

/**
 * Evaluate a policy against a hook or CI context.
 * A rule fires when all of its mode-applicable matchers (within its set/group) match.
 */
export function evaluatePolicy(
  policy: Policy,
  ctx: EvalContext,
  mode: EvalMode,
): EvaluationOutcome {
  const vars = policy.vars ?? {};
  const results: EvaluationResult[] = [];
  for (const rule of policy.rules) {
    if (rule.scope !== "both" && rule.scope !== mode) continue;
    const resolved = resolveWhen(rule.when, vars);
    if (evaluateWhen(resolved, ctx, mode)) {
      results.push({
        ruleId: rule.id,
        description: rule.description,
        enforce: rule.enforce,
        message: renderMessage(rule, ctx, mode),
      });
    }
  }
  const finalResults = applyExceptions(results, policy, ctx, mode);
  const hasDeny = finalResults.some(
    (r) => r.enforce === "block" || r.enforce === "fail",
  );
  const exitCode: 0 | 1 | 2 = hasDeny
    ? 2
    : finalResults.some((r) => r.enforce === "warn")
      ? 1
      : 0;
  return { results: finalResults, exitCode };
}
