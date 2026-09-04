import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, API_BASE } from "./api";
import type { BillingStatus, Role } from "@policyctl/types";
import { DEMO_ANALYTICS, DEMO_VIOLATIONS, DEMO_POLICIES, DEMO_DAILY_REPORT, DEMO_ORGS } from "./demo-data";
import { useState, useRef, useCallback, useEffect } from "react";
import type { SessionViolation, UseSessionStreamOptions } from "./hooks.types";

/**
 * Build-mode detection:
 * - `import.meta.env.DEV`     → `true` under `vite dev` only
 * - `import.meta.env.MODE`    → `"development"` | `"production"`
 * - `import.meta.env.PROD`    → `true` for any production build
 *   (both `vite build` output and `vite preview`, which serves that output)
 *
 * Mock data is served in every non-production MODE. Production builds
 * always call the real Worker API — no fallback, no mock, no lies.
 */
const ENV = import.meta.env.MODE;

const USE_DEMO = ENV !== "production";

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

/**
 * Shared current-org selection: the header switcher writes it, Team and
 * Settings read it. Falls back to the first org until the user picks one.
 */
export function useCurrentOrgId(): string | undefined {
  const { data: orgsData } = useOrgs();
  const { data: stored } = useQuery<string | null>({
    queryKey: ["currentOrgId"],
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return stored ?? orgsData?.orgs?.[0]?.id;
}

export function useSetCurrentOrgId() {
  const queryClient = useQueryClient();
  return (orgId: string) => queryClient.setQueryData(["currentOrgId"], orgId);
}

export function useBilling() {
  return useQuery({
    queryKey: ["billing"],
    queryFn: () => fetchData(() => api.billingStatus(), () => demoBillingStatus()),
    staleTime: 60_000,
  });
}

/**
 * Demo billing tier for QA: `?demo_tier=free|trial|paid` (default: trial).
 * Lets developers exercise the paywall, trial banner, and paid states locally.
 */
type DemoTier = "free" | "trial" | "paid";

function demoTier(): DemoTier {
  const t = new URLSearchParams(window.location.search).get("demo_tier");
  return t === "free" || t === "paid" ? t : "trial";
}

function demoBillingStatus(): BillingStatus {
  const tier = demoTier();
  if (tier === "free") {
    return {
      subscription: null,
      is_paid: false,
      is_trial: false,
      days_remaining_in_trial: null,
      seat_count: 0,
      plan: "free",
      has_api_key: false,
    };
  }
  const trialing = tier === "trial";
  return {
    subscription: {
      id: "demo-1",
      stripe_sub_id: "sub_demo",
      status: trialing ? "trialing" : "active",
      tier: "paid",
      plan: "growth",
      seat_count: 1,
      price_id: "price_demo_monthly",
      current_period_start: Date.now(),
      current_period_end: Date.now() + 14 * 86400000,
      trial_start: trialing ? Date.now() : null,
      trial_end: trialing ? Date.now() + 14 * 86400000 : null,
      cancel_at_period_end: false,
      canceled_at: null,
      created_at: Date.now(),
      updated_at: Date.now(),
    },
    is_paid: true,
    is_trial: trialing,
    days_remaining_in_trial: trialing ? 14 : null,
    seat_count: 1,
    plan: "growth",
    has_api_key: true,
  };
}

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

// ── Org members ──────────────────────────────────────────────────────────────

export function useOrgMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ["orgMembers", orgId],
    queryFn: () => (orgId ? api.members(orgId) : []),
    staleTime: 60_000,
    enabled: !!orgId,
  });
}

export function useInviteMember() {
  return useMutation({
    mutationFn: ({ orgId, email, role }: { orgId: string; email: string; role: Role }) =>
      api.inviteMember(orgId, email, role),
  });
}

export function useUpdateMember() {
  return useMutation({
    mutationFn: ({ orgId, userId, role }: { orgId: string; userId: string; role: Role }) =>
      api.updateMember(orgId, userId, role),
  });
}

export function useRemoveMember() {
  return useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) =>
      api.removeMember(orgId, userId),
  });
}

// ── Live sessions (WebSocket to Durable Object) ────────────────────────────

/**
 * Connect to a live enforcement session via WebSocket.
 *
 * The Worker exposes `/api/session/:key/stream` which upgrades to a WebSocket
 * connection to the Durable Object. This hook manages the connection lifecycle
 * and streams violations as they arrive.
 */
export function useSessionStream(
  sessionKey: string | null,
  options: UseSessionStreamOptions = {},
): {
  connected: boolean;
  lastViolation: SessionViolation | null;
  reconnect: () => void;
  disconnect: () => void;
} {
  const {
    onViolation,
    onOpen,
    onClose,
    onError,
    autoReconnect = true,
    maxRetries = 10,
  } = options;

  const [connected, setConnected] = useState(false);
  const [lastViolation, setLastViolation] = useState<SessionViolation | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectGenRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (!sessionKey) return;
    const gen = ++connectGenRef.current;

    (async () => {
      const apiBase = API_BASE.replace(/^https/, "wss").replace(/^http/, "ws");
      let url = `${apiBase}/api/session/${encodeURIComponent(sessionKey)}/stream`;
      try {
        const token = await optionsRef.current.getAccessToken?.();
        if (token) url += `?token=${encodeURIComponent(token)}`;
      } catch {
        /* unauthenticated — server will 401 and onclose will schedule a retry */
      }
      if (gen !== connectGenRef.current) return; // superseded by disconnect/reconnect

      const ws = new WebSocket(url);
      wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retriesRef.current = 0;
      optionsRef.current.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "violation" && data.violation) {
          const v: SessionViolation = {
            id: data.violation.id ?? `${Date.now()}`,
            ruleId: data.violation.ruleId ?? "unknown",
            enforce: data.violation.enforce ?? "warn",
            message: data.violation.message ?? "",
            repo: data.violation.repo ?? "",
            agent: data.violation.agent ?? "ci",
            timestamp: data.violation.timestamp ?? Date.now(),
          };
          setLastViolation(v);
          optionsRef.current.onViolation?.(v);
        }
      } catch {
        /* ignore malformed messages */
      }
    };

    ws.onclose = () => {
      setConnected(false);
      optionsRef.current.onClose?.();
      if (autoReconnect && retriesRef.current < maxRetries) {
        retriesRef.current++;
        const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      optionsRef.current.onError?.(new Error("WebSocket connection failed"));
      // Ensure onclose runs so the backoff reconnect path is deterministic.
      try {
        ws.close();
      } catch {
        /* already closed */
      }
    };
    })();
  }, [sessionKey, autoReconnect, maxRetries]);

  const disconnect = useCallback(() => {
    connectGenRef.current++; // invalidate any in-flight token fetch
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current?.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    retriesRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connected, lastViolation, reconnect, disconnect };
}