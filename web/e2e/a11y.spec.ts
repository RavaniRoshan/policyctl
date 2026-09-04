import AxeBuilder from "@axe-core/playwright";
import { test, expect, gotoDemo } from "./fixtures";

// Full-page axe scans on heavy pages (landing canvas DOM) take ~30s+ under
// parallel load — well above the 30s default.
test.setTimeout(120_000);

// Gate policy (see docs/a11y-debt.md): block on critical; serious+below are
// reported, not blocking — the known contrast debt (heat/alpha microcopy on
// light surfaces) is a design-token decision tracked in the debt file.
const BLOCK_IMPACTS = new Set(["critical"]);

const ROUTES = [
  "/",
  "/pricing",
  "/login",
  "/signup",
  "/terms",
  "/privacy",
  "/dashboard?demo_auth=1",
  "/dashboard/violations?demo_auth=1",
  "/dashboard/policies?demo_auth=1",
  "/dashboard/ai?demo_auth=1",
  "/dashboard/reports?demo_auth=1",
  "/dashboard/settings?demo_auth=1",
  "/dashboard/billing?demo_auth=1",
  "/dashboard/team?demo_auth=1",
  "/onboarding?demo_auth=1",
];

for (const path of ROUTES) {
  test(`a11y: ${path} has no critical violations`, async ({ page }) => {
    await gotoDemo(page, path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blocking = results.violations.filter((v) => v.impact && BLOCK_IMPACTS.has(v.impact));
    const rest = results.violations
      .filter((v) => !v.impact || !BLOCK_IMPACTS.has(v.impact))
      .map((v) => `${v.impact ?? "?"}:${v.id}(${v.nodes.length})`)
      .join(", ");
    // Non-blocking findings print into the log as the ratchet watchlist.
    if (rest) console.log(`[a11y-watchlist] ${path}: ${rest}`);
    expect(
      blocking.map((v) => `${v.id} @ ${v.nodes.map((n) => n.target).join(",")}`),
    ).toEqual([]);
  });
}
