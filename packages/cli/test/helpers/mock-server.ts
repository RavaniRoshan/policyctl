/**
 * Mock server for CLI integration tests.
 *
 * Spins up an in-process Hono app that simulates the policyctl control plane API.
 * Tests use this instead of hitting the real server.
 */

import { Hono } from "hono";

export interface MockServerOptions {
  /** If set, all billing status checks return this (paid/trial/free). */
  billingMode?: "paid" | "trial" | "free";
  /** Policy YAML to return from GET /api/policy. */
  policyYaml?: string;
  /** Violations to return from GET /api/violations. */
  violations?: any[];
}

export interface MockServer {
  /** Start the server on a random port. Returns the base URL. */
  start(): Promise<string>;
  /** Stop the server. */
  stop(): Promise<void>;
  /** Get the base URL (only valid after start). */
  url: string;
}

/** Create an in-memory mock server for CLI integration tests. */
export function createMockServer(opts: MockServerOptions = {}): MockServer {
  const app = new Hono();

  // Track state.
  let storedPolicy = opts.policyYaml ?? "";
  let lastReportedBody: any = null;

  const billing = {
    paid: { is_paid: true, is_trial: false, plan: "growth" },
    trial: { is_paid: false, is_trial: true, plan: "growth" },
    free: { is_paid: false, is_trial: false, plan: "free" },
  };

  // GET /api/auth0/config — public endpoint for CLI device flow
  app.get("/api/auth0/config", (c) => {
    return c.json({
      domain: "test.auth0.com",
      client_id: "test_client_id",
      audience: "test_audience",
    });
  });

  // GET /api/me
  app.get("/api/me", (c) => {
    const auth = c.req.header("authorization") ?? "";
    if (!auth.startsWith("Bearer test-access-token") && !auth.startsWith("Bearer valid-legacy-token")) {
      return c.json({ user: null });
    }
    return c.json({
      user: { id: "1", email: "test@example.com" },
    });
  });

  // GET /api/billing/status
  app.get("/api/billing/status", (c) => {
    const auth = c.req.header("authorization") ?? "";
    if (!auth) return c.json({ error: "unauthorized" }, 401);
    return c.json({
      ...billing[opts.billingMode ?? "paid"],
      seat_count: 1,
      has_api_key: false,
      days_remaining_in_trial: null,
    });
  });

  // POST /api/report
  app.post("/api/report", async (c) => {
    const auth = c.req.header("authorization") ?? "";
    if (!auth) return c.json({ error: "unauthorized" }, 401);
    const billingMode = opts.billingMode ?? "paid";
    if (billingMode === "free") {
      return c.json({ error: "subscription required" }, 403);
    }
    lastReportedBody = await c.req.json();
    return c.json({ ok: true, count: lastReportedBody?.results?.length ?? 0 });
  });

  // GET /api/policy
  app.get("/api/policy", (c) => {
    const auth = c.req.header("authorization") ?? "";
    if (!auth) return c.json({ error: "unauthorized" }, 401);
    return c.json({ yaml: storedPolicy });
  });

  // POST /api/policy
  app.post("/api/policy", async (c) => {
    const auth = c.req.header("authorization") ?? "";
    if (!auth) return c.json({ error: "unauthorized" }, 401);
    const billingMode = opts.billingMode ?? "paid";
    if (billingMode === "free") {
      return c.json({ error: "subscription required", code: "UPGRADE_REQUIRED" }, 403);
    }
    const body = await c.req.json();
    storedPolicy = body.yaml;
    return c.json({ ok: true, version: 1, id: 1 });
  });

  // GET /api/violations
  app.get("/api/violations", (c) => {
    const auth = c.req.header("authorization") ?? "";
    if (!auth) return c.json({ error: "unauthorized" }, 401);
    const limit = Number(c.req.query("limit") ?? 200);
    const offset = Number(c.req.query("offset") ?? 0);
    const all = opts.violations ?? [];
    return c.json(all.slice(offset, offset + limit));
  });

  return {
    url: "",
    async start(): Promise<string> {
      // In tests, we use fetchMock to intercept requests. This returns a base URL
      // that the CLI will be configured to use.
      // The actual serving is done by the test harness via fetchMock or a real server.
      this.url = "http://mock-policyctl.test";
      return this.url;
    },
    async stop(): Promise<void> {
      // No-op for in-memory mock
    },
    // Expose the Hono app for direct testing
    _app: app,
    _state: {
      get storedPolicy() {
        return storedPolicy;
      },
      get lastReportedBody() {
        return lastReportedBody;
      },
    },
  } as MockServer & { _app: Hono; _state: any };
}
