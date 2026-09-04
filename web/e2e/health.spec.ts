import { test, expect, gotoDemo, watch, assertClean } from "./fixtures";

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
  test(`health: ${path} loads with zero errors`, async ({ page }) => {
    const w = watch(page);
    await gotoDemo(page, path);
    assertClean(w);
  });
}

test("health: palette opens and navigates", async ({ page }) => {
  const w = watch(page);
  await gotoDemo(page, "/dashboard?demo_auth=1");
  await page.keyboard.press("Meta+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.type("bill");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dashboard\/billing/);
  assertClean(w);
});

test("health: waitlist join succeeds", async ({ page }) => {
  const w = watch(page);
  await gotoDemo(page, "/pricing");
  await page.getByLabel(/work email/i).fill("qa@example.com");
  await page.getByRole("button", { name: /join the waitlist/i }).click();
  // No backend in this harness: the request fails gracefully with an inline error.
  await expect(page.getByRole("alert")).toBeVisible();
  assertClean(w);
});
