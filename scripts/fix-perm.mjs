#!/usr/bin/env node
// Post-build:
//  1) Add a Node shebang to dist/cli.js and chmod +x so the bin is directly runnable.
//  2) Rewrite `@policyctl/core` import specifiers in dist/* to relative paths so the
//     CLI works when installed standalone (no workspace links).
//  3) Replace the `workspace:*` dep in package.json with a `file:` reference so npm
//     can install the package outside a pnpm workspace.
import { chmodSync, copyFileSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cliRoot = resolve(here, "..", "packages", "cli");
const cliDist = resolve(cliRoot, "dist");
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

// Bundle a fresh copy of @policyctl/core into the package and rewrite the dep.
const bundledCore = join(cliRoot, "node_modules", "@policyctl", "core");
try {
  rmSync(bundledCore, { recursive: true, force: true });
} catch {
  /* ignore */
}
mkdirSync(dirname(bundledCore), { recursive: true });
mkdirSync(bundledCore, { recursive: true });
function copyRecursive(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dst, name);
    if (statSync(s).isDirectory()) copyRecursive(s, d);
    else copyFileSync(s, d);
  }
}
copyRecursive(coreDist, bundledCore);
// Also copy the core package.json so npm sees a complete package.
const corePkgSrc = resolve(here, "..", "packages", "core", "package.json");
copyFileSync(corePkgSrc, join(bundledCore, "package.json"));

const pkgPath = join(cliRoot, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
if (pkg.dependencies && pkg.dependencies["@policyctl/core"]) {
  pkg.dependencies["@policyctl/core"] = "file:./node_modules/@policyctl/core";
}
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`post-build: shebang added, ${rewritten} file(s) rewritten, @policyctl/core bundled.`);
