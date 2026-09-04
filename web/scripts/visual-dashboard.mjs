#!/usr/bin/env node
// Dashboard visual audit: serves `vite dev` (non-production MODE, so demo data
// + ?demo_auth=1 are active) and screenshots every dashboard route.
// Production builds compile the demo paths out — this only ever sees dev.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const PORT = 5174;
const OUT = new URL("../visual/dash/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["overview", "/dashboard?demo_auth=1"],
  ["violations", "/dashboard/violations?demo_auth=1"],
  ["policies", "/dashboard/policies?demo_auth=1"],
  ["ai", "/dashboard/ai?demo_auth=1"],
  ["ai-free", "/dashboard/ai?demo_auth=1&demo_tier=free"],
  ["reports", "/dashboard/reports?demo_auth=1"],
  ["settings", "/dashboard/settings?demo_auth=1"],
  ["billing", "/dashboard/billing?demo_auth=1"],
  ["team", "/dashboard/team?demo_auth=1"],
  ["onboarding", "/onboarding?demo_auth=1"],
];
const VIEWPORTS = [
  ["mobile", { width: 390, height: 844 }],
  ["desktop", { width: 1280, height: 800 }],
];

function serve() {
  return new Promise((resolve, reject) => {
    const p = spawn(
      "pnpm",
      ["exec", "vite", "--port", String(PORT), "--strictPort"],
      { cwd: new URL("..", import.meta.url), stdio: ["ignore", "pipe", "pipe"] },
    );
    let ready = false;
    const timer = setTimeout(() => reject(new Error("dev server timeout")), 60_000);
    const onData = (d) => {
      if (!ready && String(d).includes("Local:")) {
        ready = true;
        clearTimeout(timer);
        resolve(p);
      }
    };
    p.stdout.on("data", onData);
    p.stderr.on("data", onData);
    p.on("exit", () => !ready && reject(new Error("dev server exited early")));
  });
}

const server = await serve();
const browser = await chromium.launch();
try {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ colorScheme: theme });
    await context.addInitScript((t) => {
      localStorage.setItem("policyctl-theme", t);
      // Simulate a returning user everywhere except the onboarding route itself.
      if (!window.location.pathname.includes("/onboarding")) {
        localStorage.setItem("policyctl-onboarding-complete", "1");
      }
    }, theme);
    const page = await context.newPage();
    for (const [name, path] of ROUTES) {
      for (const [vp, size] of VIEWPORTS) {
        await page.setViewportSize(size);
        await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(6500); // let 5s CountUp animations settle
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
