#!/usr/bin/env node
// Visual audit harness: serves the production build and screenshots public
// routes at 3 breakpoints x light/dark into web/visual/.
// Dashboard routes need Auth0 login — screenshot those manually via preview URL.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const PORT = 4174;
const OUT = new URL("../visual/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["home", "/"],
  ["pricing", "/pricing"],
  ["login", "/login"],
  ["signup", "/signup"],
  ["notfound", "/nonexistent-xyz"],
];
const VIEWPORTS = [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 768, height: 1024 }],
  ["desktop", { width: 1280, height: 800 }],
];

function serve() {
  return new Promise((resolve, reject) => {
    const p = spawn("pnpm", ["exec", "vite", "preview", "--port", String(PORT), "--strictPort"], {
      cwd: new URL("..", import.meta.url),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let ready = false;
    const timer = setTimeout(() => reject(new Error("preview server timeout")), 30_000);
    p.stdout.on("data", (d) => {
      if (!ready && String(d).includes("Local:")) {
        ready = true;
        clearTimeout(timer);
        resolve(p);
      }
    });
    p.stderr.on("data", (d) => process.stderr.write(d));
    p.on("exit", () => !ready && reject(new Error("preview exited early")));
  });
}

const server = await serve();
const browser = await chromium.launch();
try {
  for (const [theme, storage] of [["light", "light"], ["dark", "dark"]]) {
    const context = await browser.newContext({
      colorScheme: theme,
      storageState: undefined,
    });
    await context.addInitScript(
      (t) => localStorage.setItem("policyctl-theme", t),
      theme,
    );
    void storage;
    const page = await context.newPage();
    for (const [name, path] of ROUTES) {
      for (const [vp, size] of VIEWPORTS) {
        await page.setViewportSize(size);
        await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "networkidle", timeout: 20000 });
        await page.waitForTimeout(2500); // let Scramble/Typewriter/Marquee settle
        await page.screenshot({ path: new URL(`${name}-${vp}-${theme}.png`, OUT).pathname, fullPage: false });
        console.log(`${name} ${vp} ${theme} ok`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log("done ->", OUT.pathname);
