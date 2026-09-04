import { test as base, expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";

/** Fixed clock so demo timestamps/dates render deterministically. */
export const FROZEN_TIME = new Date("2026-09-04T12:00:00Z");

type Fixtures = {
  context: BrowserContext;
};

export const test = base.extend<Fixtures>({
  context: async (
    { browser, colorScheme, viewport, userAgent, deviceScaleFactor, isMobile, hasTouch },
    use,
  ) => {
    // Preserve project device settings while adding reduced-motion + init script.
    const context = await browser.newContext({
      colorScheme,
      reducedMotion: "reduce",
      viewport: viewport ?? undefined,
      userAgent,
      deviceScaleFactor,
      isMobile,
      hasTouch,
    });
    // Theme + returning-user flag before any page script runs.
    await context.addInitScript((scheme: string) => {
      window.localStorage.setItem("policyctl-theme", scheme === "dark" ? "dark" : "light");
      if (!window.location.pathname.includes("/onboarding")) {
        window.localStorage.setItem("policyctl-onboarding-complete", "1");
      }
    }, colorScheme);
    await use(context);
    await context.close();
  },
});

export { expect };

export type Watchers = {
  consoleErrors: string[];
  pageErrors: string[];
  badResponses: string[];
};

/**
 * Attach failure collectors. Backend-absent noise (no Worker in this harness)
 * is allow-listed; everything else fails the test.
 */
export function watch(page: Page): Watchers {
  const w: Watchers = { consoleErrors: [], pageErrors: [], badResponses: [] };
  // No backend runs in this harness: CORS/preflight rejections and unreachable
  // hosts are environmental noise. App-level errors still fail the test.
  const NOISE =
    /websocket|wss:|net::ERR|failed to fetch|Failed to load resource|turnstile|challenge-platform|cloudflareinsights|CORS|preflight|access control|ERR_CONNECTION_REFUSED/i;
  page.on("console", (msg) => {
    if (msg.type() === "error" && !NOISE.test(msg.text())) {
      w.consoleErrors.push(msg.text().slice(0, 300));
    }
  });
  page.on("pageerror", (err) => {
    w.pageErrors.push(String(err).slice(0, 300));
  });
  page.on("response", (res) => {
    if (res.status() >= 400 && !NOISE.test(res.url())) {
      w.badResponses.push(`${res.status()} ${res.url().slice(0, 120)}`);
    }
  });
  return w;
}

export function assertClean(w: Watchers) {
  expect(w.pageErrors, `pageerrors: ${w.pageErrors.join(" | ")}`).toEqual([]);
  expect(w.consoleErrors, `console errors: ${w.consoleErrors.join(" | ")}`).toEqual([]);
  expect(w.badResponses, `bad responses: ${w.badResponses.join(" | ")}`).toEqual([]);
}

/** Navigate with frozen clock + web-first readiness (no networkidle). */
export async function gotoDemo(page: Page, path: string) {
  await page.clock.install({ time: FROZEN_TIME });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.locator("body").waitFor({ state: "attached" });
  await page.clock.fastForward(6000); // settle CountUp/Scramble/typewriter
}
