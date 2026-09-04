import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { getBearerToken, requirePaidPlan, saveConfig } from "../src/hosted.js";
import { AuthError } from "../src/lib/errors.js";

let fetchCalls: { url: string; init?: RequestInit }[] = [];
let originalFetch: typeof globalThis.fetch;

function mockAuthFetch(opts: { refreshToken?: string; billingPaid?: boolean } = {}): void {
  fetchCalls = [];
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    fetchCalls.push({ url, init });
    if (url.includes("/oauth/token")) {
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () =>
          Promise.resolve({
            access_token: "fresh-access-token",
            refresh_token: opts.refreshToken ?? "rotated-refresh-token",
            expires_in: 3600,
          }),
        text: () => Promise.resolve("{}"),
      } as Response;
    }
    if (url.includes("/api/billing/status")) {
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ is_paid: opts.billingPaid ?? true, is_trial: false }),
        text: () => Promise.resolve("{}"),
      } as Response;
    }
    return Promise.reject(new Error("no mock for: " + url));
  }) as typeof globalThis.fetch;
}

function seedConfig(cfg: Record<string, unknown>): void {
  saveConfig({ server: "https://test.example.com", ...(cfg as any) });
}

beforeEach(() => {
  originalFetch = globalThis.fetch;
  vi.unstubAllEnvs();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllEnvs();
});

describe("token refresh", () => {
  it("returns a valid access token without network", async () => {
    seedConfig({
      accessToken: "valid-token",
      accessTokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
      refreshToken: "rt",
      auth0Domain: "d.example.com",
      auth0ClientId: "cid",
    });
    mockAuthFetch();
    const token = await getBearerToken();
    expect(token).toBe("valid-token");
    expect(fetchCalls.length).toBe(0);
  });

  it("refreshes once for concurrent callers (no thundering herd)", async () => {
    seedConfig({
      accessToken: "expired-token",
      accessTokenExpiresAt: Math.floor(Date.now() / 1000) - 100,
      refreshToken: "rt",
      auth0Domain: "d.example.com",
      auth0ClientId: "cid",
    });
    mockAuthFetch();
    const [a, b] = await Promise.all([getBearerToken(), getBearerToken()]);
    expect(a).toBe("fresh-access-token");
    expect(b).toBe("fresh-access-token");
    expect(fetchCalls.filter((c) => c.url.includes("/oauth/token")).length).toBe(1);
  });

  it("persists the rotated token with a future expiry", async () => {
    seedConfig({
      accessToken: "expired-token",
      accessTokenExpiresAt: Math.floor(Date.now() / 1000) - 100,
      refreshToken: "rt",
      auth0Domain: "d.example.com",
      auth0ClientId: "cid",
    });
    mockAuthFetch({ refreshToken: "new-rt" });
    await getBearerToken();
    const { loadConfig } = await import("../src/hosted.js");
    const cfg = loadConfig();
    expect(cfg.accessToken).toBe("fresh-access-token");
    expect(cfg.refreshToken).toBe("new-rt");
    expect(cfg.accessTokenExpiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("throws AuthError when no refresh credentials exist", async () => {
    seedConfig({ server: "https://test.example.com" });
    mockAuthFetch();
    await expect(getBearerToken()).rejects.toBeInstanceOf(AuthError);
  });

  it("requirePaidPlan sends the refreshed token to billing/status", async () => {
    seedConfig({
      accessToken: "expired-token",
      accessTokenExpiresAt: Math.floor(Date.now() / 1000) - 100,
      refreshToken: "rt",
      auth0Domain: "d.example.com",
      auth0ClientId: "cid",
    });
    mockAuthFetch();
    await requirePaidPlan("https://test.example.com");
    const billingCall = fetchCalls.find((c) => c.url.includes("/api/billing/status"));
    expect(billingCall).toBeDefined();
    expect((billingCall!.init!.headers as Record<string, string>)["authorization"]).toBe(
      "Bearer fresh-access-token",
    );
  });
});
