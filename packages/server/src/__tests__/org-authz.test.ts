import { describe, expect, it } from "vitest";
import { resolveOrg, getPrimaryOrg, getRole, getSeatCount } from "../store.js";

// SQL-aware D1 fake that also records every prepared statement.
function dbFake(routes: { match: string; first?: unknown }[] = []) {
  const seen: string[] = [];
  const db = {
    seen,
    prepare(sql: string) {
      seen.push(sql);
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
  return db;
}

const ORG_ROW = {
  id: 1,
  name: "Acme",
  current_version: 2,
  stripe_customer_id: null,
  stripe_sub_id: null,
  subscription_status: "active",
  subscription_tier: "paid",
  seat_count: 2,
  trial_ends_at: null,
  current_period_end: null,
  price_id: null,
  plan: "growth",
  api_key_hash: null,
};

describe("org resolution and roles", () => {
  it("blocks cross-org access: requested org without membership resolves null", async () => {
    const db = dbFake([{ match: "FROM org_members WHERE org_id", first: null }]);
    expect(await resolveOrg(db, 5, 2)).toBeNull();
  });

  it("resolves an explicitly requested org when membership exists", async () => {
    const db = dbFake([
      { match: "FROM org_members WHERE org_id", first: { 1: 1 } },
      { match: "FROM orgs WHERE id", first: ORG_ROW },
    ]);
    const org = await resolveOrg(db, 5, 1);
    expect(org?.id).toBe(1);
  });

  it("getPrimaryOrg returns the membership org regardless of role", async () => {
    const db = dbFake([{ match: "JOIN org_members", first: ORG_ROW }]);
    const org = await getPrimaryOrg(db, 5);
    expect(org?.id).toBe(1);
    // No owner-only filter may remain in the default resolution path.
    expect(db.seen.join("\n")).not.toContain("m.role = 'owner'");
  });

  it.each([
    ["owner", "owner"],
    ["admin", "admin"],
    ["member", "member"],
    ["viewer", "viewer"],
  ])("getRole returns %s", async (role) => {
    const db = dbFake([{ match: "SELECT role", first: { role } }]);
    expect(await getRole(db, 1, 5)).toBe(role);
  });

  it("getRole returns null for non-members", async () => {
    const db = dbFake([]);
    expect(await getRole(db, 1, 5)).toBeNull();
  });

  it("seat count query excludes viewers", async () => {
    const db = dbFake([]);
    await getSeatCount(db, 1);
    expect(db.seen.join("\n")).toContain("role != 'viewer'");
  });
});
