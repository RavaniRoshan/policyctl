import type { Session, Violation } from "@policyctl/types";

// Shared SessionViolation interface between hooks.ts and Sessions.tsx
export interface SessionViolation {
  id: string;
  ruleId: string;
  enforce: string;
  message: string;
  repo: string;
  agent: string;
  timestamp: number;
}

// Live sessions (WebSocket to Durable Object) ───────────────────────────────────

export interface UseSessionStreamOptions {
  /** Called when a new violation arrives over the WebSocket. */
  onViolation?: (v: SessionViolation) => void;
  /** Called when the WebSocket connection opens. */
  onOpen?: () => void;
  /** Called when the WebSocket connection closes. */
  onClose?: () => void;
  /** Called when an error occurs. */
  onError?: (err: Error) => void;
  /** Whether to auto-reconnect (default: true). */
  autoReconnect?: boolean;
  /** Max reconnection attempts (default: 10). */
  maxRetries?: number;
  /**
   * Resolves the Auth0 access token to send as `?token=` on the WebSocket URL.
   * Browsers can't set Authorization headers on WebSocket(); the Worker reads
   * the same query param as REST (`bearerToken`). Omit for anonymous streams.
   */
  getAccessToken?: () => Promise<string | null>;
}

export type { Session, Violation } from "@policyctl/types";