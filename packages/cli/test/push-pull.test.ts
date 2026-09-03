import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tempDir, SAMPLE_POLICY } from "./helpers/test-utils.js";

let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(responses: Record<string, { status: number; body?: unknown; json?: () => Promise<unknown> }>): void {
  globalThis.fetch = ((input: string | URL, init?: RequestInit) => {
    const url = String(input);
    for (const [pattern, resp] of Object.entries(responses)) {
      if (url.includes(pattern)) {
        return Promise.resolve({
          ok: resp.status >= 200 && resp.status < 300,
          status: resp.status,
          headers: new Headers(),
          json: resp.json ?? (() => Promise.resolve(resp.body ?? {})),
          text: () => Promise.resolve(typeof resp.body === "string" ? resp.body : JSON.stringify(resp.body ?? {})),
        } as Response);
      }
    }
    return Promise.reject(new Error("no mock for: " + url));
  }) as typeof globalThis.fetch;
}

async function writeFakeConfig(): Promise<void> {
  const { saveConfig, loadConfig } = await import("../src/hosted.js");
  const cfg = loadConfig();
  cfg.accessToken = "test-access-token";
  cfg.accessTokenExpiresAt = Math.floor(Date.now() / 1000) + 3600;
  saveConfig(cfg);
}

async function cleanupConfig(): Promise<void> {
  try {
    const { CONFIG_PATH } = await import("../src/hosted.js");
    if (existsSync(CONFIG_PATH)) {
      rmSync(CONFIG_PATH);
    }
  } catch {
    /* ignore */
  }
}

describe("check command exit codes", () => {
  it("exits 0 when no violations in clean diff", async () => {
    const { checkCommand } = await import("../src/commands/check.js");
    const dir = tempDir();
    writeFileSync(join(dir, ".policyctl.yml"), SAMPLE_POLICY);

    const origExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
      throw new Error(`exit(${c})`);
    }) as never;

    const origLog = console.log;
    const origErr = console.error;
    console.log = () => {};
    console.error = () => {};

    try {
      await checkCommand({ cwd: dir });
    } catch {
      // process.exit throws
    } finally {
      process.exit = origExit;
      console.log = origLog;
      console.error = origErr;
    }
    expect(exitCode).toBe(0);
  });

  it("exits 3 when policy file is missing", async () => {
    const { checkCommand } = await import("../src/commands/check.js");
    const dir = tempDir();

    const origExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
      throw new Error(`exit(${c})`);
    }) as never;

    const origErr = console.error;
    console.error = () => {};

    try {
      await checkCommand({ cwd: dir });
    } catch {
      // process.exit throws
    } finally {
      process.exit = origExit;
      console.error = origErr;
    }
    expect(exitCode).toBe(3);
  });
});

describe("report error handling", () => {
  beforeEach(async () => {
    await writeFakeConfig();
  });

  afterEach(async () => {
    await cleanupConfig();
  });

  it("sendReport throws ServerError on 500 response", async () => {
    const { sendReport } = await import("../src/hosted.js");

    mockFetch({
      "/api/billing/status": { status: 200, body: { is_paid: true, is_trial: false } },
      "/api/report": { status: 500, body: { error: "internal" } },
    });

    let threw = false;
    try {
      await sendReport({ repo: "test", agent: "ci", results: [] });
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toContain("500");
    }
    expect(threw).toBe(true);
  });

  it("sendReport throws AuthError on 401 response", async () => {
    const { AuthError } = await import("../src/lib/errors.js");
    const { sendReport } = await import("../src/hosted.js");

    mockFetch({
      "/api/billing/status": { status: 401, body: { error: "unauthorized" } },
    });

    let threw = false;
    try {
      await sendReport({ repo: "test", agent: "ci", results: [] });
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(AuthError);
    }
    expect(threw).toBe(true);
  });

  it("requirePaidPlan throws AuthError when not paid", async () => {
    const { AuthError } = await import("../src/lib/errors.js");
    const { requirePaidPlan } = await import("../src/hosted.js");

    mockFetch({
      "/api/billing/status": { status: 200, body: { is_paid: false, is_trial: false } },
    });

    let threw = false;
    try {
      await requirePaidPlan();
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(AuthError);
      expect((e as Error).message).toContain("subscription required");
    }
    expect(threw).toBe(true);
  });
});

describe("push command", () => {
  beforeEach(async () => {
    await writeFakeConfig();
  });

  afterEach(async () => {
    await cleanupConfig();
  });

  it("validates YAML before pushing — catches missing rule id", async () => {
    const { pushCommand } = await import("../src/commands/push.js");

    const dir = tempDir();
    writeFileSync(join(dir, ".policyctl.yml"), "version: 1\nrules:\n  - when: { path: x }\n    enforce: block\n");

    const origExit = process.exit;
    process.exit = ((c?: number) => {
      throw new Error(`exit(${c})`);
    }) as never;

    console.error = () => {};

    try {
      await pushCommand({ cwd: dir });
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toContain("missing an `id`");
    } finally {
      process.exit = origExit;
    }
  });

  it("validates YAML before pushing — catches bad enforce value", async () => {
    const { pushCommand } = await import("../src/commands/push.js");

    const dir = tempDir();
    writeFileSync(join(dir, ".policyctl.yml"), "version: 1\nrules:\n  - id: test\n    scope: ci\n    when: { path: x }\n    enforce: bogus\n");

    const origExit = process.exit;
    process.exit = ((c?: number) => {
      throw new Error(`exit(${c})`);
    }) as never;

    console.error = () => {};

    try {
      await pushCommand({ cwd: dir });
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toContain("enforce");
    } finally {
      process.exit = origExit;
    }
  });

  it("--dry-run validates without making network calls", async () => {
    const { pushCommand } = await import("../src/commands/push.js");

    const dir = tempDir();
    writeFileSync(join(dir, ".policyctl.yml"), SAMPLE_POLICY);

    let fetchCalled = false;
    globalThis.fetch = ((input: string, init?: RequestInit) => {
      fetchCalled = true;
      return Promise.reject(new Error("should not fetch in dry-run: " + String(input)));
    }) as typeof globalThis.fetch;

    const origExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
      throw new Error(`exit(${c})`);
    }) as never;

    const origErr = console.error;
    console.error = () => {};

    try {
      await pushCommand({ cwd: dir, dryRun: true });
    } catch {
      // process.exit throws
    } finally {
      process.exit = origExit;
      console.error = origErr;
    }

    expect(fetchCalled).toBe(false);
    expect(exitCode).toBeUndefined();
  });

  it("pushes valid policy with server call", async () => {
    const { pushCommand } = await import("../src/commands/push.js");

    mockFetch({
      "/api/billing/status": { status: 200, body: { is_paid: true, is_trial: false } },
      "/api/policy": { status: 200, body: { ok: true, version: 3, id: 5 } },
    });

    const dir = tempDir();
    writeFileSync(join(dir, ".policyctl.yml"), SAMPLE_POLICY);

    const origExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
      throw new Error(`exit(${c})`);
    }) as never;

    const origLog = console.log;
    console.log = () => {};

    try {
      await pushCommand({ cwd: dir });
    } catch {
      // process.exit throws
    } finally {
      process.exit = origExit;
      console.log = origLog;
    }

    expect(exitCode).toBeUndefined();
  });
});

describe("pull command", () => {
  beforeEach(async () => {
    await writeFakeConfig();
  });

  afterEach(async () => {
    await cleanupConfig();
  });

  it("--dry-run prints valid YAML without writing", async () => {
    const { pullCommand } = await import("../src/commands/pull.js");

    const testYaml = `version: 1
rules:
  - id: t
    scope: ci
    when: { path: "x" }
    enforce: block
`;
    mockFetch({
      "/api/billing/status": { status: 200, body: { is_paid: true, is_trial: false } },
      "/api/policy": { status: 200, body: { yaml: testYaml } },
    });

    const dir = tempDir();
    const target = join(dir, ".policyctl.yml");

    const origExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
      throw new Error(`exit(${c})`);
    }) as never;

    const origLog = console.log;
    const origErr = console.error;
    console.log = () => {};
    console.error = () => {};

    try {
      await pullCommand({ cwd: dir, dryRun: true });
    } catch {
      // process.exit throws
    } finally {
      process.exit = origExit;
      console.log = origLog;
      console.error = origErr;
    }

    expect(existsSync(target)).toBe(false);
  });

  it("writes policy file on success", async () => {
    const { pullCommand } = await import("../src/commands/pull.js");

    const testYaml = `version: 1
rules:
  - id: t
    scope: ci
    when: { path: "x" }
    enforce: block
`;
    mockFetch({
      "/api/billing/status": { status: 200, body: { is_paid: true, is_trial: false } },
      "/api/policy": { status: 200, body: { yaml: testYaml } },
    });

    const dir = tempDir();
    const target = join(dir, ".policyctl.yml");

    const origExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
      throw new Error(`exit(${c})`);
    }) as never;

    const origLog = console.log;
    const origErr = console.error;
    console.log = () => {};
    console.error = () => {};

    try {
      await pullCommand({ cwd: dir });
    } catch {
      // process.exit throws
    } finally {
      process.exit = origExit;
      console.log = origLog;
      console.error = origErr;
    }

    expect(existsSync(target)).toBe(true);
  });

  it("rejects invalid YAML from server", async () => {
    const { pullCommand } = await import("../src/commands/pull.js");

    mockFetch({
      "/api/billing/status": { status: 200, body: { is_paid: true, is_trial: false } },
      "/api/policy": { status: 200, body: { yaml: "not valid yaml: [unclosed" } },
    });

    const dir = tempDir();

    const origExit = process.exit;
    process.exit = ((c?: number) => {
      throw new Error(`exit(${c})`);
    }) as never;

    const origErr = console.error;
    console.error = () => {};

    let threw = false;
    try {
      await pullCommand({ cwd: dir });
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toContain("invalid");
    } finally {
      process.exit = origExit;
      console.error = origErr;
    }

    expect(threw).toBe(true);
  });
});
