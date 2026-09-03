/**
 * @policyctl/types — shared API contract types.
 *
 * These types define the wire format between the Worker API and the web SPA.
 * Both sides import from @policyctl/types so that response shapes stay in sync.
 *
 * Server-side-only types (D1 row definitions, internal DB shapes) stay in
 * packages/server/src/types.ts — they are not part of the public contract.
 */

// ── Auth ─────────────────────────────────────────────────────────────────────

/** A user identity as understood by the web app and API client. */
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  provider: string;
}

export interface Session {
  user: User;
}

export type Role = "owner" | "admin" | "member" | "viewer";

// ── Orgs ─────────────────────────────────────────────────────────────────────

export interface Org {
  id: string;
  name: string;
  current_version: string | null;
  /** Subscription status: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'. */
  subscription_status?: string | null;
  /** Subscription tier: 'free' | 'paid'. */
  subscription_tier?: string | null;
  /** Number of billable seats. */
  seat_count?: number | null;
  /** Unix timestamp when trial ends (if in trial). */
  trial_ends_at?: number | null;
  /** Unix timestamp when current billing period ends. */
  current_period_end?: number | null;
  /** Stripe price ID for the current subscription. */
  price_id?: string | null;
  /** Billing plan: 'free' | 'growth' | 'pro'. */
  plan?: BillingPlan | null;
}

/** A member of an organization, joined from the users table. */
export interface OrgMember {
  id: string;           // user id (from users table)
  email: string;
  display_name: string | null;
  role: Role;
  invited_at: string;   // ISO timestamp
  accepted_at: string | null;
  /** Whether this member counts as a billable seat (non-viewer). */
  is_billable: boolean;
}

/** An invitation token sent to a potential member. */
export interface InviteToken {
  id: string;
  email: string;
  role: Role;
  /** ISO timestamp when the invite expires. */
  expires_at: string;
  used_at: string | null;
}

// ── Billing ───────────────────────────────────────────────────────────────────

export type BillingTier = "free" | "paid";
export type BillingPlan = "free" | "growth" | "pro";
export type SubscriptionStatus = "free" | "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface Subscription {
  id: string;
  stripe_sub_id: string;
  status: SubscriptionStatus;
  tier: BillingTier;
  seat_count: number;
  plan: BillingPlan;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  trial_start: number | null;
  trial_end: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface BillingStatus {
  subscription: Subscription | null;
  is_paid: boolean;
  is_trial: boolean;
  days_remaining_in_trial: number | null;
  seat_count: number;
  plan: BillingPlan;
  /** Whether a control-plane API key has been generated for this org. */
  has_api_key: boolean;
}

export interface CheckoutSession {
  url: string;
}

// ── Violations ───────────────────────────────────────────────────────────────

export interface ReportResult {
  ruleId?: string;
  enforce?: string;
  message?: string;
}

export interface Violation {
  id: string;
  repo: string;
  rule_id: string;
  enforce: string | null;
  message: string;
  agent: string;
  created_at: string;
  /** Correlation ID linking CLI report to dashboard session. */
  session_id?: string | null;
  /** Git commit SHA where the violation was detected. */
  commit_sha?: string | null;
  /** Git branch where the violation was detected. */
  branch?: string | null;
  /** Link to the CI run (if available). */
  ci_url?: string | null;
  /** ISO timestamp when dismissed, if dismissed. */
  dismissed_at?: string | null;
  /** User who dismissed the violation. */
  dismissed_by?: string | null;
  /** Reason for dismissal (false positive, accepted risk, etc.). */
  dismiss_reason?: string | null;
  /** Unified diff context around the violation. */
  diff_context?: string | null;
}

// ── Policy ───────────────────────────────────────────────────────────────────

export interface PolicyVersion {
  id: string;
  version: number;
  yaml: string;
  author_id: string;
  author_email: string | null;
  note: string;
  created_at: string;
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface Analytics {
  compliance_score: number;
  active_sessions: number;
  violations_24h: number;
  ai_insights: number;
}

// ── AI ───────────────────────────────────────────────────────────────────────

/** A single policy-violation finding returned by the analyzer. */
export interface AiViolation {
  ruleId?: string;
  explanation: string;
}

export interface AiAnalyzeResult {
  summary: string;
  violations: AiViolation[];
  suggestedRules: string[];
}

export interface AiAuthorResult {
  rule: string;
  explanation: string;
}

// ── Reports ─────────────────────────────────────────────────────────────────

export interface DailyReportActor {
  actor: string;
  count: number;
}

export interface DailyReportOffender {
  rule_id: string;
  repo: string;
  count: number;
}

export interface DailyReport {
  generatedAt: number;
  period: string;
  total: number;
  byActor: DailyReportActor[];
  repeatOffenders: DailyReportOffender[];
  aiInsights: number;
}
