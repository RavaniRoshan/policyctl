import { describe, expect, it, vi } from "vitest";

vi.mock("../auth0.js", () => ({ verifyAuth0Token: vi.fn() }));

import worker, { isOrgActive } from "../index.js";

function dbFake(routes: { match: string; first?: unknown }[] = []) {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          const r = routes.find((x) => sql.includes(x.match));
          return {
            first: async () => r?.first ?? null,
            all: async () => ({ results: [] }),
            run: async () => ({ meta: { last_row_id: 1, changes: 1 } }),
          };
        },
      };
    },
  } as any;
}

function kvFake() {
  const m = new Map<string, unknown>();
  return {
    get: async (k: string) => (m.has(k) ? m.get(k) : null),
    put: async (k: string, v: unknown) => {
      m.set(k, v);
    },
    delete: async (k: string) => {
      m.delete(k);
    },
  } as any;
}

const USER = {
  id: 3,
  email: "u@example.com",
  token: "tok",
  auth0_sub: null,
  display_name: null,
  provider: "magic",
  password_hash: null,
};

function orgRow(status: string) {
  return {
    id: 1,
    name: "Acme",
    current_version: 1,
    stripe_customer_id: null,
    stripe_sub_id: null,
    subscription_status: status,
    subscription_tier: status === "free" ? "free" : "paid",
    seat_count: 1,
    trial_ends_at: null,
    current_period_end: null,
    price_id: null,
    plan: status === "free" ? "free" : "growth",
    api_key_hash: null,
  };
}

function envFor(status: string): any {
  const db = dbFake([
    { match: "WHERE token", first: USER },
    { match: "JOIN org_members", first: orgRow(status) },
  ]);
  return {
    DB: db,
    POLICYCTL_CACHE: kvFake(),
    AI: {},
    POLICY_SESSION: {},
    AUTH0_DOMAIN: "d",
    AUTH0_AUDIENCE: "a",
    ALLOWED_ORIGINS: "",
  };
}

async function postAnalyze(status: string) {
  const res = await worker.fetch(
    new Request("http://test/api/ai/analyze", {
      method: "POST",
      headers: { authorization: "Bearer tok", "content-type": "application/json" },
      body: JSON.stringify({ diff: "diff --git a/x b/x" }),
    }),
    envFor(status),
  );
  return { status: res.status, body: (await res.json()) as any };
}

describe("subscription tier gates", () => {
  it.each([
    ["free", false],
    ["trialing", true],
    ["active", true],
    ["past_due", true],
    ["canceled", false],
    ["incomplete", false],
    ["unpaid", false],
  ])("isOrgActive(%s) === %s", (status, expected) => {
    expect(isOrgActive({ subscription_status: status } as any)).toBe(expected);
  });

  it("isOrgActive(null) is false", () => {
    expect(isOrgActive(null)).toBe(false);
  });

  it("free orgs get 403 UPGRADE_REQUIRED on /api/ai/analyze", async () => {
    const { status, body } = await postAnalyze("free");
    expect(status).toBe(403);
    expect(body.code).toBe("UPGRADE_REQUIRED");
  });

  it.each(["trialing", "active", "past_due"])("%s orgs pass the AI tier gate", async (status) => {
    const { status: httpStatus } = await postAnalyze(status);
    // Must not be rejected by the tier gate (AI itself may 500 on the fake binding).
    expect(httpStatus).not.toBe(403);
  });
});
