import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Runs before any test module: isolates HOME so config I/O never
    // touches the real ~/.policyctl. See test/setup.ts.
    setupFiles: ["./test/setup.ts"],
  },
});
