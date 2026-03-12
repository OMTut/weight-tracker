import { test, expect } from "@playwright/test";

const PASSWORD = "password123";
const NAME = "Layout Tester";

test.beforeEach(async ({ page }, testInfo) => {
  // Use unique email per test to avoid conflicts in parallel runs
  const email = `account-layout-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill(NAME);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
});

test("account page has header with back button and title", async ({ page }) => {
  await page.goto("/account");
  await expect(
    page.getByRole("button", { name: "Back to dashboard" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Account Info" }).or(
      page.locator("header").getByText("Account Info"),
    ),
  ).toBeVisible();
});

test("back button navigates to /dashboard", async ({ page }) => {
  await page.goto("/account");
  await page.getByRole("button", { name: "Back to dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("account page shows all sections", async ({ page }) => {
  await page.goto("/account");
  await expect(page.getByText("Display Name", { exact: true })).toBeVisible();
  await expect(page.getByText("Email Address", { exact: true })).toBeVisible();
  await expect(page.getByText("Password", { exact: true })).toBeVisible();
  await expect(page.getByText("Weight Unit", { exact: true })).toBeVisible();
  await expect(page.getByText("Danger Zone", { exact: true })).toBeVisible();
});

test("account page screenshot — desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/account");
  await page.screenshot({
    path: ".agent/screenshots/TASK-27-1.png",
    fullPage: true,
  });
});

test("account page screenshot — mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/account");
  await page.screenshot({
    path: ".agent/screenshots/TASK-27-2.png",
    fullPage: true,
  });
});
