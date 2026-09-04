import { test, expect, gotoDemo } from "./fixtures";

const PUBLIC_ROUTES = ["/", "/pricing", "/login", "/signup", "/terms", "/privacy", "/nonexistent-xyz"];
const DASH_ROUTES = [
  "/dashboard?demo_auth=1",
  "/dashboard/violations?demo_auth=1",
  "/dashboard/policies?demo_auth=1",
  "/dashboard/ai?demo_auth=1",
  "/dashboard/ai?demo_auth=1&demo_tier=free",
  "/dashboard/reports?demo_auth=1",
  "/dashboard/settings?demo_auth=1",
  "/dashboard/billing?demo_auth=1",
  "/dashboard/team?demo_auth=1",
  "/onboarding?demo_auth=1",
];

for (const path of [...PUBLIC_ROUTES, ...DASH_ROUTES]) {
  test(`visual: ${path}`, async ({ page }) => {
    await gotoDemo(page, path);
    // Landing hero is live shader art: hide canvases for a deterministic
    // layout/type assertion (artwork covered by the human loop in web/visual/).
    // NOTE: stylePath resolves relative to the package root (web/).
    const stylePath = path === "/" ? "e2e/visual-hide-canvas.css" : undefined;
    await expect(page).toHaveScreenshot({ fullPage: false, stylePath });
  });
}
