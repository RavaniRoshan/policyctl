import picomatch from "picomatch";
import type {
  CiContext,
  EvalContext,
  EvalMode,
  HookContext,
  Matchers,
  Rule,
  When,
  WhenGroup,
} from "./types.js";

const HOOK_MATCHERS: (keyof Matchers)[] = ["path", "command", "tool"];
const CI_MATCHERS: (keyof Matchers)[] = [
  "path",
  "diff_contains",
  "diff_not_contains",
  "diff_regex",
  "diff_paths_glob",
  "diff_paths_not_glob",
];

function matcherSupportedInMode(key: keyof Matchers, mode: EvalMode): boolean {
  return mode === "hook"
    ? HOOK_MATCHERS.includes(key)
    : CI_MATCHERS.includes(key);
}

function normalizePath(p: string): string {
  return p.startsWith("./") ? p.slice(2) : p;
}

function globMatch(pattern: string, paths: string[]): boolean {
  const isMatch = picomatch(pattern);
  return paths.some((p) => isMatch(normalizePath(p)));
}

export function globMatchExported(pattern: string, paths: string[]): boolean {
  return globMatch(pattern, paths);
}

function matchTool(pattern: string, tool: string): boolean {
  if (pattern.startsWith("/") && pattern.endsWith("/") && pattern.length > 1) {
    return new RegExp(pattern.slice(1, -1)).test(tool);
  }
  return pattern === tool;
}

/** JS RegExp has no inline (?i); honor a leading (?i) as the case-insensitive flag. */
function compileRegex(value: string): RegExp {
  if (value.startsWith("(?i)")) return new RegExp(value.slice(4), "i");
  return new RegExp(value);
}

function matchOne(
  key: keyof Matchers,
  value: string,
  ctx: EvalContext,
  mode: EvalMode,
): boolean {
  if (mode === "hook") {
    const h = ctx as HookContext;
    switch (key) {
      case "path":
        return h.file_path ? globMatch(value, [h.file_path]) : false;
      case "command":
        return compileRegex(value).test(h.command ?? "");
      case "tool":
        return matchTool(value, h.tool);
      default:
        return false;
    }
  }
  const c = ctx as CiContext;
  switch (key) {
    case "path":
      return globMatch(value, c.files.map((f) => f.path));
    case "diff_contains":
      return c.text.includes(value);
    case "diff_not_contains":
      return !c.text.includes(value);
    case "diff_regex":
      return compileRegex(value).test(c.text);
    case "diff_paths_glob":
      return globMatch(value, c.files.map((f) => f.path));
    case "diff_paths_not_glob":
      return !globMatch(value, c.files.map((f) => f.path));
    default:
      return false;
  }
}

/** Evaluate a single matcher set (all matchers must match). */
export function evaluateSet(set: Matchers, ctx: EvalContext, mode: EvalMode): boolean {
  const entries = Object.entries(set) as [keyof Matchers, string][];
  const applicable = entries.filter(([k]) => matcherSupportedInMode(k, mode));
  if (applicable.length === 0) return false;
  return applicable.every(([k, v]) => matchOne(k, v, ctx, mode));
}

export function isGroup(when: When): when is WhenGroup {
  return "all" in when || "any" in when;
}

/** Evaluate a rule's `when`, supporting both a bare matcher set and an OR-group. */
export function evaluateWhen(when: When, ctx: EvalContext, mode: EvalMode): boolean {
  if (isGroup(when)) {
    const allMatch = (when.all ?? []).every((s) => evaluateSet(s, ctx, mode));
    const anySets = when.any ?? [];
    const anyMatch = anySets.length === 0 ? true : anySets.some((s) => evaluateSet(s, ctx, mode));
    return allMatch && anyMatch;
  }
  return evaluateSet(when, ctx, mode);
}

export function evaluateRule(rule: Rule, ctx: EvalContext, mode: EvalMode): boolean {
  return evaluateWhen(rule.when, ctx, mode);
}
