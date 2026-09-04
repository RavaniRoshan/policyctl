import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

const ONBOARDING_FLAG = "policyctl-onboarding-complete";

/**
 * First-run gate: brand-new users (no completed onboarding on this browser)
 * go through /onboarding once before the dashboard. Skippable there, and the
 * flag persists in localStorage afterwards.
 */
export function FirstRunGate({ children }: { children: ReactNode }) {
  if (typeof window !== "undefined" && !window.localStorage.getItem(ONBOARDING_FLAG)) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}
