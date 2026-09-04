export interface Env {
  DB: D1Database;
  /** Deployment environment (production, staging, development). */
  NODE_ENV?: string;
  /** KV cache for parsed policies + JWKS + user lookups (sub-ms reads). */
  POLICYCTL_CACHE: KVNamespace;
  /** Workers AI — edge LLM inference for semantic policy intelligence. */
  AI: Ai;
  /** Durable Objects — live enforcement sessions + streaming dashboard. */
  POLICY_SESSION: DurableObjectNamespace;
  /** Optional override for the canonical server URL (used in CLI hints). */
  SERVER_URL?: string;
  // ── Turnstile ──
  /** Turnstile secret key (set via: wrangler secret put TURNSTILE_SECRET_SITE). */
  TURNSTILE_SECRET_SITE?: string;
  /** Turnstile site key (public). */
  TURNSTILE_SITE_KEY?: string;
  // ── Auth0 (primary auth provider for the SPA) ──
  /** Auth0 tenant domain, e.g. "dev-wyyyhy36ogxygyky.us.auth0.com". */
  AUTH0_DOMAIN?: string;
  /** Auth0 API audience / client ID to validate tokens against. */
  AUTH0_AUDIENCE?: string;
  /** Auth0 client_id for CLI device-flow login (public, may be same as SPA client_id). */
  AUTH0_CLI_CLIENT_ID?: string;
  // ── Legacy OAuth (CLI magic-link flow — kept for backward compat) ──
  OAUTH_GOOGLE_CLIENT_ID?: string;
  OAUTH_GOOGLE_CLIENT_SECRET?: string;
  OAUTH_REDIRECT_URI?: string;

  // ── Stripe (subscription billing for the control plane tier) ──
  /** Stripe secret key (set via: wrangler secret put STRIPE_SECRET_KEY). */
  STRIPE_SECRET_KEY?: string;
  /** Stripe webhook signing secret (set via: wrangler secret put STRIPE_WEBHOOK_SECRET). */
  STRIPE_WEBHOOK_SECRET?: string;
  /** Stripe price ID for Growth monthly subscription ($5/seat/month). */
  STRIPE_PRICE_ID_GROWTH_MONTHLY?: string;
  /** Stripe price ID for Growth annual subscription ($50/seat/year). */
  STRIPE_PRICE_ID_GROWTH_ANNUAL?: string;
  /** Stripe price ID for Pro monthly subscription ($12/seat/month). */
  STRIPE_PRICE_ID_PRO_MONTHLY?: string;
  /** Stripe price ID for Pro annual subscription ($120/seat/year). */
  STRIPE_PRICE_ID_PRO_ANNUAL?: string;

  // ── CORS ──
  /** Comma-separated list of origins allowed to call the Worker API. */
  ALLOWED_ORIGINS?: string;

  // ── Waitlist (free-launch mode) ──
  /** Transactional email binding (Cloudflare Email Sending). Optional. */
  EMAIL?: {
    send(msg: {
      to: string;
      from: { email: string; name?: string };
      subject: string;
      text: string;
      html?: string;
    }): Promise<unknown>;
  };
  /** Owner address notified on each waitlist signup. Empty = skip email. */
  WAITLIST_NOTIFY_TO?: string;
  /** Sender address (domain must be onboarded to Email Sending). */
  WAITLIST_FROM?: string;
}

export interface User {
  id: number;
  email: string;
  token: string; // legacy CLI magic-link token (retained for backward compat)
  auth0_sub: string | null; // Auth0 sub claim — primary identity for the SPA
  display_name: string | null;
  provider: string;
  password_hash: string | null;
}

export interface Org {
  id: number;
  name: string;
  current_version: number | null;
  /** Stripe customer ID for this org's billing. */
  stripe_customer_id: string | null;
  /** Stripe subscription ID (if any). */
  stripe_sub_id: string | null;
  /** Subscription status: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'. */
  subscription_status: string | null;
  /** Subscription tier: 'free' | 'paid'. */
  subscription_tier: string | null;
  /** Number of billable seats. */
  seat_count: number | null;
  /** Unix timestamp when trial ends (if in trial). */
  trial_ends_at: number | null;
  /** Unix timestamp when current billing period ends. */
  current_period_end: number | null;
  /** Stripe price ID for the current subscription. */
  price_id: string | null;
  /** Billing plan: 'free' | 'growth' | 'pro'. */
  plan: string | null;
  /** SHA-256 hash of the control-plane API key (null if none generated). */
  api_key_hash: string | null;
}

export interface Subscription {
  id: number;
  org_id: number;
  stripe_sub_id: string;
  status: string;
  tier: string;
  seat_count: number;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  trial_start: number | null;
  trial_end: number | null;
  cancel_at_period_end: number;
  canceled_at: number | null;
  created_at: number;
  updated_at: number;
  /** Billing plan: 'growth' | 'pro'. */
  plan: string;
}

export interface OrgMember {
  org_id: number;
  user_id: number;
  role: "owner" | "admin" | "member" | "viewer";
}

export interface PolicyVersion {
  id: number;
  org_id: number;
  version: number;
  yaml: string;
  author_id: number | null;
  note: string | null;
  created_at: number;
}

export interface Violation {
  id: number;
  org_id: number;
  repo: string | null;
  rule_id: string | null;
  enforce: string | null;
  message: string | null;
  agent: string | null;
  actor: string | null;
  created_at: number;
  dismissed_at: number | null;
  dismissed_by: number | null;
  dismiss_reason: string | null;
}

export type ReportResult = {
  ruleId?: string;
  enforce?: string;
  message?: string;
};

export const ROLES = ["owner", "admin", "member", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export interface Session {
  user: User;
}

export type { Env as WorkerEnv };
