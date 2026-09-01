import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./api";
import { DEMO_ANALYTICS, DEMO_VIOLATIONS, DEMO_POLICIES } from "./demo-data";

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

export function useAiAnalyze() {
  return useMutation({
    mutationFn: async (text: string) => {
      if (USE_DEMO) {
        return {
          summary: `Analyzed ${text.split(/\s+/).length} tokens. No critical violations detected. The diff follows best practices for the policy set you've configured.`,
          violations: [],
          suggestedRules: [],
        };
      }
      return api.aiAnalyze(text);
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