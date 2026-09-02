import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { BillingStatus } from "@policyctl/types";
import { DEMO_ANALYTICS, DEMO_VIOLATIONS, DEMO_POLICIES, DEMO_DAILY_REPORT, DEMO_ORGS } from "./demo-data";

/**
 * Build-mode detection:
 * - `import.meta.env.DEV`     → `true` in `vite dev` (local + preview server)
 * - `import.meta.env.MODE`    → `"development"` | `"production"` | `"preview"`
 * - `import.meta.env.PROD`    → `true` in `vite build` (Cloudflare Pages)
 *
 * Mock data is ONLY served in development/preview. In production builds,
 * every query calls the real Worker API — no fallback, no mock, no lies.
 */
const ENV = import.meta.env.MODE;
const IS_PRODUCTION = import.meta.env.PROD;

const USE_DEMO = !IS_PRODUCTION;

if (USE_DEMO) {
  // eslint-disable-next-line no-console
  console.info(
    `%c[policyctl] Mock data active (${ENV}). Set USE_DEMO=false in lib/hooks.ts to disable.`,
    "color:#fa5d19;font-weight:bold",
  );
}

/**
 * In development/preview: serve demo data instantly.
 * In production: call the real Worker. If it fails, surface the error —
 * never silently substitute fake data.
 */
async function fetchData<T>(real: () => Promise<T>, demo: () => T): Promise<T> {
  if (USE_DEMO) return demo();
  return real();
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetchData(() => api.analytics(), () => DEMO_ANALYTICS),
    staleTime: 30_000,
  });
}

export function useViolations() {
  return useQuery({
    queryKey: ["violations"],
    queryFn: () => fetchData(() => api.violations(), () => DEMO_VIOLATIONS),
    staleTime: 30_000,
  });
}

export function usePolicyVersions() {
  return useQuery({
    queryKey: ["policyVersions"],
    queryFn: () => fetchData(() => api.policyVersions(), () => DEMO_POLICIES),
    staleTime: 60_000,
  });
}

export function useDailyReport() {
  return useQuery({
    queryKey: ["dailyReport"],
    queryFn: () => fetchData(() => api.dailyReport(), () => ({ report: DEMO_DAILY_REPORT })),
    staleTime: 60_000,
  });
}

export { API_BASE, ApiError } from "./api.js";

export function useOrgs() {
  return useQuery({
    queryKey: ["orgs"],
    queryFn: () => fetchData(() => api.orgs(), () => ({ orgs: DEMO_ORGS })),
    staleTime: 60_000,
  });
}

export function useBilling() {
  return useQuery({
    queryKey: ["billing"],
    queryFn: () => fetchData(() => api.billingStatus(), () => DEMO_BILLING_STATUS),
    staleTime: 60_000,
  });
}

const DEMO_BILLING_STATUS: BillingStatus = {
  subscription: {
    id: "demo-1",
    stripe_sub_id: "sub_demo",
    status: "trialing",
    tier: "paid",
    plan: "growth",
    seat_count: 1,
    price_id: "price_demo_monthly",
    current_period_start: Date.now(),
    current_period_end: Date.now() + 14 * 86400000,
    trial_start: Date.now(),
    trial_end: Date.now() + 14 * 86400000,
    cancel_at_period_end: false,
    canceled_at: null,
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  is_paid: true,
  is_trial: true,
  days_remaining_in_trial: 14,
  seat_count: 1,
  plan: "growth",
  has_api_key: true,
};

export function useAiAnalyze() {
  return useMutation({
    mutationFn: async ({ diff, policy, repo }: { diff: string; policy?: string; repo?: string }) => {
      if (USE_DEMO) {
        return {
          summary: `Analyzed ${diff.split(/\s+/).length} tokens. No critical violations detected. The diff follows best practices for the policy set you've configured.`,
          violations: [],
          suggestedRules: [],
        };
      }
      return api.aiAnalyze(diff, { policy, repo });
    },
  });
}

export function useAiAuthor() {
  return useMutation({
    mutationFn: async (text: string) => {
      if (USE_DEMO) {
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 4)
          .join("-");
        return {
          rule: `rules:\n  - id: ${id || "custom-rule"}\n    match:\n      path: src/**\n    enforce: warn\n    message: |\n      Generated from prompt: "${text.slice(0, 60)}"`,
          explanation: `Generated policy stub from your prompt. Edit the match path and enforce level before deploying.`,
        };
      }
      return api.aiAuthor(text);
    },
  });
}

/** Exposed for tests / debug panels. */
export const __isDemoMode = USE_DEMO;
export const __buildMode = ENV;

export function useGenerateApiKey() {
  return useMutation({
    mutationFn: () => api.generateApiKey(),
  });
}

export function useDeleteOrg() {
  return useMutation({
    mutationFn: (id: string | number) => api.deleteOrg(id),
  });
}

export function usePublishPolicy() {
  return useMutation({
    mutationFn: ({ yaml, note }: { yaml: string; note?: string }) => api.publishPolicy(yaml, note),
  });
}

export function useRollbackVersion() {
  return useMutation({
    mutationFn: (id: string) => api.rollbackVersion(id),
  });
}

export function useResendReport() {
  return useMutation({
    mutationFn: () => api.resendReport(),
  });
}