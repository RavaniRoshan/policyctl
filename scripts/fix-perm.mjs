#!/usr/bin/env node
// Post-build:
//  1) Add a Node shebang to dist/cli.js and chmod +x so the bin is directly runnable.
//  2) Rewrite `@policyctl/core` import specifiers in dist/* to relative paths so the
//     CLI works when installed standalone (no workspace links).
import { chmodSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cliDist = resolve(here, "..", "packages", "cli", "dist");
const coreDist = resolve(here, "..", "packages", "core", "dist");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (name.endsWith(".js") || name.endsWith(".cjs") || name.endsWith(".mjs")) yield p;
  }
}

let rewritten = 0;
for (const file of walk(cliDist)) {
  const text = readFileSync(file, "utf8");
  if (!text.includes("@policyctl/core")) continue;
  const dir = dirname(file);
  const next = text.replace(/from\s+"@policyctl\/core"/g, () => {
    const target = relative(dir, coreDist).replaceAll("\\", "/");
    return `from "${target}/index.js"`;
  });
  writeFileSync(file, next);
  rewritten++;
}

const cliEntry = join(cliDist, "cli.js");
const cliText = readFileSync(cliEntry, "utf8");
if (!cliText.startsWith("#!/usr/bin/env node")) {
  writeFileSync(cliEntry, `#!/usr/bin/env node\n${cliText}`);
  chmodSync(cliEntry, 0o755);
}
console.log(`post-build: shebang added, ${rewritten} file(s) rewritten.`);
