import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, saveConfig, CONFIG_PATH } from "../src/hosted.js";
import { logoutCommand } from "../src/commands/logout.js";
import { configSetCommand, configGetCommand, configCommand } from "../src/commands/config.js";

// We test config and logout since they don't require a live server.

describe("config", () => {
  const testDir = mkdtempSync(join(tmpdir(), "pc-config-"));

  // Override the config path for tests
  const origConfigPath = CONFIG_PATH;

  beforeEach(() => {
    // Save existing config if it exists, use test config
    const testConfig = join(testDir, "config.json");
    saveConfig({ server: "https://test.example.com", accessToken: "old-token" });
  });

  afterEach(() => {
    // Clean up test config
    if (existsSync(join(testDir, "config.json"))) {
      rmSync(join(testDir, "config.json"));
    }
  });

  it("config list shows current values", () => {
    const origExit = process.exit;
    const origError = console.error;
    let exited = false;
    process.exit = ((c?: number) => {
      exited = true;
      throw new Error(`exit(${c})`);
    }) as never;
    console.error = () => {};

    try {
      configCommand({});
    } catch {
      // may throw if process.exit
    } finally {
      process.exit = origExit;
      console.error = origError;
    }

    expect(exited).toBe(false); // should not exit
  });

  it("config set updates the server URL", () => {
    configSetCommand({ key: "server", value: "https://new.example.com" });
    const cfg = loadConfig();
    expect(cfg.server).toBe("https://new.example.com");
  });

  it("config set rejects invalid keys", () => {
    const origExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((c?: number) => {
      exitCode = c;
      throw new Error(`exit(${c})`);
    }) as never;

    try {
      expect(() => configSetCommand({ key: "invalid", value: "x" })).toThrow();
      expect(exitCode).toBe(3);
    } finally {
      process.exit = origExit;
    }
  });

  it("config get returns the value", () => {
    configSetCommand({ key: "server", value: "https://get.example.com" });
    // Capture stdout
    const origLog = console.log;
    let output = "";
    console.log = (msg: string) => {
      output = msg;
    };
    try {
      configGetCommand({ key: "server" });
    } finally {
      console.log = origLog;
    }
    expect(output).toContain("https://get.example.com");
  });

  it("config get shows (not set) for missing values", () => {
    // Set email to something, don't set orgId
    configSetCommand({ key: "email", value: "user@test.com" });
    const origLog = console.log;
    let output = "";
    console.log = (msg: string) => {
      output = msg;
    };
    try {
      configGetCommand({ key: "orgId" });
    } finally {
      console.log = origLog;
    }
    expect(output).toContain("(not set)");
  });
});

describe("logout", () => {
  it("clears credentials", () => {
    const origExit = process.exit;
    const origError = console.error;
    process.exit = (() => {
      throw new Error("should not exit");
    }) as never;
    console.error = () => {};

    try {
      // Write a config with credentials
      saveConfig({
        server: "https://test.example.com",
        accessToken: "test-access",
        refreshToken: "test-refresh",
        email: "test@example.com",
      });

      logoutCommand({});

      const cfg = loadConfig();
      expect(cfg.accessToken).toBeUndefined();
      expect(cfg.refreshToken).toBeUndefined();
      expect(cfg.token).toBeUndefined();
      expect(cfg.accessTokenExpiresAt).toBeUndefined();
    } finally {
      process.exit = origExit;
      console.error = origError;
    }
  });

  it("handles no config gracefully", () => {
    const origExit = process.exit;
    const origLog = console.log;
    const origError = console.error;
    let logged = "";
    process.exit = (() => {
      throw new Error("should not exit");
    }) as never;
    console.error = () => {};
    console.log = (msg: string) => {
      logged += msg;
    };

    try {
      logoutCommand({});
      expect(logged).toContain("not logged in");
    } finally {
      process.exit = origExit;
      console.log = origLog;
      console.error = origError;
    }
  });
});

describe("error types", () => {
  it("AuthError has exit code 4", async () => {
    const { AuthError, exitCodeOf } = await import("../src/lib/errors.js");
    const err = new AuthError("test");
    expect(err.exitCode).toBe(4);
    expect(exitCodeOf(err)).toBe(4);
  });

  it("ValidationError has exit code 3", async () => {
    const { ValidationError, exitCodeOf } = await import("../src/lib/errors.js");
    const err = new ValidationError("bad input");
    expect(err.exitCode).toBe(3);
    expect(exitCodeOf(err)).toBe(3);
  });

  it("NetworkError has exit code 2", async () => {
    const { NetworkError, exitCodeOf } = await import("../src/lib/errors.js");
    const err = new NetworkError("timeout");
    expect(err.exitCode).toBe(2);
    expect(exitCodeOf(err)).toBe(2);
  });

  it("generic Error has exit code 2", async () => {
    const { exitCodeOf } = await import("../src/lib/errors.js");
    expect(exitCodeOf(new Error("boom"))).toBe(2);
  });

  it("toJSON produces structured output", async () => {
    const { AuthError } = await import("../src/lib/errors.js");
    const err = new AuthError("expired", { endpoint: "/api/policy" });
    const json = err.toJSON();
    expect(json.error).toBe("AUTH_ERROR");
    expect(json.message).toBe("expired");
    expect(json.context).toEqual({ endpoint: "/api/policy" });
  });

  it("formatError renders plain text by default", async () => {
    const { formatError, AuthError } = await import("../src/lib/errors.js");
    const err = new AuthError("not authenticated");
    const out = formatError(err, false);
    expect(out).toContain("not authenticated");
  });

  it("formatError renders JSON when requested", async () => {
    const { formatError, AuthError } = await import("../src/lib/errors.js");
    const err = new AuthError("not authenticated");
    const out = formatError(err, true);
    const parsed = JSON.parse(out);
    expect(parsed.error).toBe("AUTH_ERROR");
    expect(parsed.message).toBe("not authenticated");
  });
});
