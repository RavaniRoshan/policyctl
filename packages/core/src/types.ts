// Shared policy types for policyctl. Single source of truth across CLI + server.

export type Scope = "hook" | "ci" | "both";

// "block" = deny at hook time; "fail" = fail the build at CI time; "warn" = non-blocking; "ignore" = suppressed by exception.
export type Enforce = "block" | "fail" | "warn" | "ignore";

export interface Matchers {
  /** Glob matched against a file path. Hook: the file the tool touches. CI: any changed file. */
  path?: string;
  /** Regex matched against a shell command string (hook mode, e.g. the Bash tool). */
  command?: string;
  /** Tool name. Exact match, or regex if wrapped in `/.../` (hook mode). */
  tool?: string;
  /** Substring check against the full unified-diff text (CI mode). */
  diff_contains?: string;
  /** Fires when the signature string is ABSENT from the diff — used to require a generator header (CI mode). */
  diff_not_contains?: string;
  /** Regex against the full unified-diff text (CI mode). */
  diff_regex?: string;
  /** Glob that must match at least one changed file path (CI mode). */
  diff_paths_glob?: string;
  /** Glob that must match NO changed file path (CI mode). */
  diff_paths_not_glob?: string;
}

/** A group of matcher sets. Fires if every `all` set matches AND any `any` set matches. */
export interface WhenGroup {
  all?: Matchers[];
  any?: Matchers[];
}

/** A rule fires on either a single matcher set (implicit AND) or a WhenGroup. */
export type When = Matchers | WhenGroup;

export type Priority = "high" | "medium" | "low";

export interface Rule {
  id: string;
  description?: string;
  scope: Scope;
  /** Matchers (AND) or a group. All mode-applicable matchers across the set(s) must match. */
  when: When;
  enforce: Enforce;
  /** Group labels for `check --only/--except` and dashboard grouping. */
  tags?: string[];
  /** Custom violation message; `{{ruleId}} {{path}} {{tool}}` are interpolated. */
  message?: string;
  /** Priority for rule execution and dashboard display */
  priority?: Priority;
}

/** A sanctioned bypass: downgrades or suppresses a matched violation without editing the main policy. */
export interface Exception {
  rule?: string;
  /** Glob; matched against the violating file path (hook) or first changed file (CI). */
  path?: string;
  /** "warn" downgrades a block/fail to a warning; "ignore" suppresses it entirely. */
  enforce?: "warn" | "ignore";
  note?: string;
}

export interface Policy {
  version: number;
  rules: Rule[];
  /** Reusable values referenced as `${name}` inside matcher strings. */
  vars?: Record<string, string>;
  /** Reviewed exceptions applied after evaluation. */
  exceptions?: Exception[];
}

/** Context passed by an agent hook (PreToolUse / PostToolUse). */
export interface HookContext {
  tool: string;
  command?: string;
  file_path?: string;
  [key: string]: unknown;
}

export type FileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "copied"
  | string;

export interface DiffFile {
  path: string;
  status: FileStatus;
  patch?: string;
}

/** Context passed by CI / pre-commit: the resulting diff. */
export interface CiContext {
  files: DiffFile[];
  /** Raw unified-diff text, used by diff_contains / diff_regex. */
  text: string;
}

export type EvalMode = "hook" | "ci";
export type EvalContext = HookContext | CiContext;
