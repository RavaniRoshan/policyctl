import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./api";
import { DEMO_ANALYTICS, DEMO_VIOLATIONS, DEMO_POLICIES } from "./demo-data";

// In demo mode we resolve instantly from the in-memory mock data.
// In production mode we call the Worker API.
const USE_DEMO = true;

async function withFallback<T>(real: () => Promise<T>, fallback: () => T): Promise<T> {
  if (USE_DEMO) return fallback();
  try {
    return await real();
  } catch {
    return fallback();
  }
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => withFallback(() => api.analytics(), () => DEMO_ANALYTICS),
    staleTime: 30_000,
  });
}

export function useViolations() {
  return useQuery({
    queryKey: ["violations"],
    queryFn: () => withFallback(() => api.violations(), () => DEMO_VIOLATIONS),
    staleTime: 30_000,
  });
}

export function usePolicyVersions() {
  return useQuery({
    queryKey: ["policyVersions"],
    queryFn: () => withFallback(() => api.policyVersions(), () => DEMO_POLICIES),
    staleTime: 60_000,
  });
}

export function useAiAnalyze() {
  return useMutation({
    mutationFn: async (text: string) => {
      if (USE_DEMO) {
        // Mock a streaming analysis for demo purposes.
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
        // Generate a simple policy stub from the prompt.
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