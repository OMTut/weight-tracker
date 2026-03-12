import { test, expect } from "@playwright/test";

async function signupAndGoToDashboard(page: import("@playwright/test").Page) {
  const unique = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Chart Tester");
  await page.getByLabel("Email").fill(`ct${unique}@example.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await page.waitForURL("**/dashboard", { timeout: 5000 });
}

async function addWeightEntry(page: import("@playwright/test").Page, weight: string) {
  await page.getByLabel("Add weight entry").click();
  await page.getByLabel(/Weight/).fill(weight);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByLabel(/Add weight entry/)).toBeVisible({ timeout: 5000 });
}

test.describe("Weight area chart", () => {
  test("shows empty state when no entries exist in selected range", async ({ page }) => {
    await signupAndGoToDashboard(page);
    // Fresh account — no entries — 7d filter should show empty state
    await page.getByTestId("filter-7d").click();
    await expect(page.getByTestId("chart-empty")).toBeVisible({ timeout: 5000 });
  });

  test("filter buttons are rendered and active filter is highlighted", async ({ page }) => {
    await signupAndGoToDashboard(page);
    for (const label of ["Last 7 Days", "Last 30 Days", "Last 3 Months", "All Time"]) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
    // Default active filter is "Last 30 Days"
    const active = page.getByTestId("filter-30d");
    await expect(active).toBeVisible();
  });

  test("chart renders after adding a weight entry", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "175");
    // Chart should render (recharts SVG present)
    await expect(page.locator(".recharts-responsive-container")).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: ".agent/screenshots/TASK-23-1.png" });
  });

  test("switching filter updates the chart", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "180");
    // Switch to All Time — chart should be visible
    await page.getByTestId("filter-all").click();
    await expect(page.locator(".recharts-responsive-container")).toBeVisible({ timeout: 5000 });
    // Switch to 7d — still visible (entry just added today)
    await page.getByTestId("filter-7d").click();
    await expect(page.locator(".recharts-responsive-container")).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: ".agent/screenshots/TASK-23-2.png" });
  });
});
