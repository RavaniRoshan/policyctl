#!/usr/bin/env node
// Post-build: add a Node shebang to dist/cli.js and chmod +x so the bin is directly runnable.
import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cliDist = resolve(here, "..", "packages", "cli", "dist");
const cliEntry = join(cliDist, "cli.js");
const cliText = readFileSync(cliEntry, "utf8");
if (!cliText.startsWith("#!/usr/bin/env node")) {
  writeFileSync(cliEntry, `#!/usr/bin/env node\n${cliText}`);
  chmodSync(cliEntry, 0o755);
}
console.log("post-build: shebang added.");
