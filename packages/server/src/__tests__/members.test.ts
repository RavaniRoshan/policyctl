import { describe, expect, it, beforeEach } from "vitest";
import { Hono } from "hono";
import type { Env, Role, User, Org } from "../types.js";
import type { OrgMember } from "@policyctl/types";

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

describe("members API endpoints", () => {
  it("returns members list", async () => {
    const { listMembers } = await import("../store.js");
    const db = createMockDb({
      all: [
        { user_id: 1, email: "a@b.com", display_name: "A", role: "owner", created_at: 1, accepted_at: 1 },
      ],
    });

    const rows = await listMembers(db, 1);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("a@b.com");
  });

  it("returns empty when no members", async () => {
    const { listMembers } = await import("../store.js");
    const db = createMockDb({
      all: [],
    });
    const rows = await listMembers(db, 1);
    expect(rows).toHaveLength(0);
  });
});
