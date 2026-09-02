import type { Analytics, Violation, PolicyVersion, DailyReport, Org } from "./api";

/**
 * Demo data for the dashboard when the Worker isn't reachable.
 * Provides realistic, varied data that exercises every UI state.
 */

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const DEMO_ANALYTICS: Analytics = {
  compliance_score: 94,
  active_sessions: 7,
  violations_24h: 3,
  ai_insights: 2,
};

export const DEMO_VIOLATIONS: Violation[] = [
  {
    id: "v_001",
    repo: "acme-platform/api-gateway",
    rule_id: "no-secrets-in-commits",
    enforce: "fail",
    message: "OpenAI API key pattern detected in src/config/llm.ts — redaction required before merge.",
    agent: "claude",
    created_at: new Date(NOW - 2 * HOUR).toISOString(),
  },
  {
    id: "v_002",
    repo: "acme-platform/web",
    rule_id: "migrations-via-generator",
    enforce: "block",
    message: "Direct edit to db/migrations/0007_add_audit.sql — must be generated via `pnpm db:gen add-audit`.",
    agent: "cursor",
    created_at: new Date(NOW - 5 * HOUR).toISOString(),
  },
  {
    id: "v_003",
    repo: "acme-platform/infra",
    rule_id: "no-protected-edits",
    enforce: "block",
    message: "Agent attempted to modify .github/workflows/deploy.yml — protected path.",
    agent: "claude",
    created_at: new Date(NOW - 14 * HOUR).toISOString(),
  },
  {
    id: "v_004",
    repo: "acme-platform/mobile",
    rule_id: "tests-for-source",
    enforce: "warn",
    message: "src/screens/Profile.tsx changed without a matching __tests__/Profile.test.tsx update.",
    agent: "codex",
    created_at: new Date(NOW - 1 * DAY).toISOString(),
  },
  {
    id: "v_005",
    repo: "acme-platform/web",
    rule_id: "no-console-log",
    enforce: "warn",
    message: "console.log() in src/utils/debug.ts:42 — replace with logger.debug() before merge.",
    agent: "claude",
    created_at: new Date(NOW - 1 * DAY - 3 * HOUR).toISOString(),
  },
  {
    id: "v_006",
    repo: "acme-platform/api-gateway",
    rule_id: "no-secrets-in-commits",
    enforce: "fail",
    message: "AWS access key pattern (AKIA…) detected in src/aws/credentials.json.",
    agent: "claude",
    created_at: new Date(NOW - 2 * DAY).toISOString(),
  },
  {
    id: "v_007",
    repo: "acme-platform/shared",
    rule_id: "migrations-via-generator",
    enforce: "block",
    message: "Direct migration edit blocked: db/migrations/0008_add_metrics.sql.",
    agent: "cursor",
    created_at: new Date(NOW - 2 * DAY - 6 * HOUR).toISOString(),
  },
  {
    id: "v_008",
    repo: "acme-platform/infra",
    rule_id: "branch-protection",
    enforce: "warn",
    message: "PR to main is missing a required CODEOWNERS reviewer.",
    agent: "ci",
    created_at: new Date(NOW - 3 * DAY).toISOString(),
  },
];

export const DEMO_POLICIES: PolicyVersion[] = [
  {
    id: "pv_003",
    version: 3,
    yaml: `rules:
  - id: migrations-via-generator
    match:
      path: db/migrations/*
    enforce: block
    message: |
      Migration files must be generated via the CLI.
      Run \`policyctl gen migration <name>\` instead.
  - id: no-secrets-in-commits
    match:
      regex: '(AKIA|ghp_|sk-[A-Za-z0-9]{20,}|xox[abp]-)'
    enforce: fail
  - id: no-protected-edits
    match:
      path: '.github/**'
    enforce: block
  - id: tests-for-source
    match:
      path: 'src/**'
    enforce: warn`,
    author_id: "usr_a8f3c2",
    author_email: "ada@acme.dev",
    note: "Added tests-for-source rule and tightened migration path matcher",
    created_at: new Date(NOW - 1 * DAY).toISOString(),
  },
  {
    id: "pv_002",
    version: 2,
    yaml: `rules:
  - id: migrations-via-generator
    match:
      path: db/migrations/*
    enforce: block
  - id: no-secrets-in-commits
    match:
      regex: '(AKIA|ghp_)'
    enforce: fail`,
    author_id: "usr_b1c4d9",
    author_email: "lin@acme.dev",
    note: "Tightened secret regex",
    created_at: new Date(NOW - 5 * DAY).toISOString(),
  },
  {
    id: "pv_001",
    version: 1,
    yaml: `rules:
  - id: no-secrets-in-commits
    match:
      regex: '(AKIA|ghp_)'
    enforce: warn`,
    author_id: "usr_a8f3c2",
    author_email: "ada@acme.dev",
    note: "Initial policy from `policyctl init`",
    created_at: new Date(NOW - 14 * DAY).toISOString(),
  },
];

export const DEMO_ORGS: Org[] = [
  {
    id: "1",
    name: "Acme Platform",
    current_version: "3",
  },
];

export const DEMO_SESSIONS = DEMO_VIOLATIONS.map((v, i) => ({
  ...v,
  session_id: `sess_${i.toString().padStart(3, "0")}`,
  duration_ms: Math.floor(Math.random() * 45000) + 5000,
  tool_calls: Math.floor(Math.random() * 8) + 1,
}));

export const DEMO_DAILY_REPORT: DailyReport = {
  generatedAt: NOW - 3 * HOUR,
  period: "24h",
  total: 12,
  byActor: [
    { actor: "claude", count: 7 },
    { actor: "cursor", count: 3 },
    { actor: "codex", count: 1 },
    { actor: "ci", count: 1 },
  ],
  repeatOffenders: [
    { rule_id: "no-secrets-in-commits", repo: "acme-platform/api-gateway", count: 3 },
    { rule_id: "migrations-via-generator", repo: "acme-platform/web", count: 2 },
  ],
};
