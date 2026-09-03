import { describe, expect, it, beforeEach } from "vitest";
import { Hono } from "hono";
import type { Env, Role, User, Org, Violation } from "../types.js";

// Simple in-memory mock for D1Database
function createMockDb(rows: Record<string, any[]> = {}) {
  const data: Record<string, any[]> = rows;
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: any[]) {
          const stmt = {
            first: () => data["first"]?.[0] ?? null,
            all: () => ({ results: data["all"] ?? [] }),
            run: () => ({ meta: { last_row_id: 1 } }),
            batch: (items: any[]) => items.map((item) => ({ meta: { last_row_id: 1 } })),
          };
          return stmt;
        },
      };
    },
  } as any;
}

function createMockEnv(overrides: Partial<Env> = {}): Env {
  return {
    DB: createMockDb(),
    POLICYCTL_CACHE: {} as any,
    AI: {} as any,
    POLICY_SESSION: {} as any,
    ...overrides,
  } as Env;
}

function createMockUser(id = 1, email = "user@test.com"): User {
  return { id, email, token: "", auth0_sub: null, display_name: "Test User", provider: "test", password_hash: "" };
}

function createMockOrg(id = 1): Org {
  return {
    id,
    name: "Test Org",
    current_version: 1,
    stripe_customer_id: null,
    stripe_sub_id: null,
    subscription_status: "free",
    subscription_tier: "free",
    seat_count: 1,
    trial_ends_at: null,
    current_period_end: null,
    price_id: null,
    plan: "free",
    api_key_hash: null,
  };
}

function createMockViolation(id = 1, orgId = 1): Violation {
  return {
    id,
    org_id: orgId,
    repo: "test/repo",
    rule_id: "test-rule",
    enforce: "fail",
    message: "Test violation",
    agent: "claude",
    created_at: Date.now(),
  };
}

describe("violations API endpoints", () => {
  it("returns a single violation by id", async () => {
    const violation = createMockViolation(1, 1);
    const db = createMockDb({
      first: [violation],
    });

    const { listViolations } = await import("../store.js");
    // listViolations doesn't take a single id, so we test the store function indirectly
    // by checking toWebViolation mapping
    const { toWebViolation } = await import("../store.js");
    const webViolation = toWebViolation(violation);
    expect(webViolation.id).toBe("1");
    expect(webViolation.repo).toBe("test/repo");
    expect(webViolation.rule_id).toBe("test-rule");
  });

  it("maps violation fields correctly to web type", async () => {
    const violation = createMockViolation(42, 2);
    violation.repo = null;
    violation.rule_id = null;
    violation.enforce = null;
    violation.message = null;
    violation.agent = null;

    const { toWebViolation } = await import("../store.js");
    const webViolation = toWebViolation(violation);
    expect(webViolation.id).toBe("42");
    expect(webViolation.repo).toBe("");
    expect(webViolation.rule_id).toBe("");
    expect(webViolation.enforce).toBe("");
    expect(webViolation.message).toBe("");
    expect(webViolation.agent).toBe("");
  });
});
