import { spawn } from "node:child_process";
import { chromium } from "playwright";
const srv = spawn("pnpm", ["exec", "vite", "--port", "5176", "--strictPort"], { cwd: new URL("..", import.meta.url), stdio: ["ignore", "pipe", "pipe"] });
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error("timeout")), 60000);
  const on = (d) => { if (String(d).includes("Local:")) { clearTimeout(t); res(); } };
  srv.stdout.on("data", on); srv.stderr.on("data", on);
});
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
await page.goto("http://localhost:5176/dashboard?demo_auth=1", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const data = await page.evaluate(() => {
  const cards = [...document.querySelectorAll("main [aria-live] > div")].map((d) => d.innerText.replace(/\n/g, " | "));
  return cards;
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
srv.kill();
