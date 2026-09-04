import { describe, expect, it, vi } from "vitest";

// SQL-aware D1 fake: routes by SQL substring. Default first() is null,
// run() succeeds — callers opt into rows per query kind.
function dbFake(routes: { match: string; first?: unknown }[] = []) {
  const runOk = async () => ({ meta: { last_row_id: 1, changes: 1 } });
  return {
    prepare(sql: string) {
      return {
        run: runOk,
        batch: async (items: unknown[]) => items.map(() => ({ meta: { last_row_id: 1 } })),
        bind(..._args: unknown[]) {
          const r = routes.find((x) => sql.includes(x.match));
          return {
            first: async () => r?.first ?? null,
            all: async () => ({ results: [] }),
            run: runOk,
          };
        },
      };
    },
  } as any;
}

function kvFake(seed: Record<string, unknown> = {}) {
  const m = new Map(Object.entries(seed));
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

function testEnv(db: any, kv: any): any {
  return {
    DB: db,
    POLICYCTL_CACHE: kv,
    AI: {},
    POLICY_SESSION: {},
    AUTH0_DOMAIN: "d.example.com",
    AUTH0_AUDIENCE: "aud",
    ALLOWED_ORIGINS: "",
  };
}

vi.mock("../auth0.js", () => ({ verifyAuth0Token: vi.fn() }));

import { verifyAuth0Token } from "../auth0.js";
import worker from "../index.js";

const mockedVerify = verifyAuth0Token as unknown as ReturnType<typeof vi.fn>;

async function getMe(token: string | null, env: any) {
  const res = await worker.fetch(
    new Request("http://test/api/me", {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    }),
    env,
  );
  return { status: res.status, body: (await res.json()) as any };
}

const LEGACY_USER = {
  id: 3,
  email: "legacy@example.com",
  token: "tok-legacy",
  auth0_sub: null,
  display_name: null,
  provider: "magic",
  password_hash: null,
};

describe("requireUser auth paths (via GET /api/me)", () => {
  it("returns { user: null } with no token", async () => {
    mockedVerify.mockResolvedValue(null);
    const { status, body } = await getMe(null, testEnv(dbFake(), kvFake()));
    expect(status).toBe(200);
    expect(body).toEqual({ user: null });
  });

  it("falls back to the legacy magic-link token", async () => {
    mockedVerify.mockResolvedValue(null);
    const db = dbFake([{ match: "WHERE token", first: LEGACY_USER }]);
    const { body } = await getMe("tok-legacy", testEnv(db, kvFake()));
    expect(body.user.email).toBe("legacy@example.com");
    expect(body.user.id).toBe("3");
  });

  it("provisions a new user on first JWT login", async () => {
    mockedVerify.mockResolvedValue({ sub: "auth0|new1", email: "new@example.com", name: null });
    const { body } = await getMe("jwt-new", testEnv(dbFake(), kvFake()));
    expect(body.user.email).toBe("new@example.com");
  });

  it("serves a cached JWT user without touching D1", async () => {
    mockedVerify.mockResolvedValue({ sub: "auth0|cached", email: "c@example.com", name: null });
    const cached = { ...LEGACY_USER, id: 9, auth0_sub: "auth0|cached", email: "c@example.com" };
    const kv = kvFake({ "user:v1:auth0|cached": { user: cached, exp: Date.now() + 60_000 } });
    const db = {
      prepare() {
        throw new Error("D1 must not be hit on cache hit");
      },
    } as any;
    const { body } = await getMe("jwt-cached", testEnv(db, kv));
    expect(body.user.id).toBe("9");
  });

  it("authenticates an org-bound API key as the keyed org owner", async () => {
    mockedVerify.mockResolvedValue(null);
    const owner = { ...LEGACY_USER, id: 11, email: "owner@example.com" };
    const db = dbFake([
      { match: "api_key_hash", first: { id: 7 } },
      { match: "org_members", first: owner },
    ]);
    const { body } = await getMe("pc_live_testkey123", testEnv(db, kvFake()));
    expect(body.user.email).toBe("owner@example.com");
  });

  it("rejects an unknown API key with { user: null }", async () => {
    mockedVerify.mockResolvedValue(null);
    const { body } = await getMe("pc_live_bogus", testEnv(dbFake(), kvFake()));
    expect(body).toEqual({ user: null });
  });
});
