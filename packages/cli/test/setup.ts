import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Isolate ALL config file I/O for the whole run: point HOME at a throwaway
// dir before any test module (or src/hosted.js, which binds CONFIG_PATH to
// homedir() at import time) is loaded. Tests must never read, write, or
// delete the developer's real ~/.policyctl.
process.env.HOME = mkdtempSync(join(tmpdir(), "pc-test-home-"));
