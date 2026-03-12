import { test, expect } from "@playwright/test";

/** Helper: sign up a fresh user and land on /dashboard. */
async function signupAndGoToDashboard(page: import("@playwright/test").Page) {
  const unique = Date.now();
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Dash Tester");
  await page.getByLabel("Email").fill(`dash${unique}@example.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await page.waitForURL("**/dashboard", { timeout: 5000 });
}

test.describe("Dashboard layout", () => {
  test("shows top bar with app name, + button, and username", async ({
    page,
  }) => {
    await signupAndGoToDashboard(page);
    await expect(page.getByText("HeavyDeets")).toBeVisible();
    await expect(page.getByLabel("Add weight entry")).toBeVisible();
    await expect(page.getByText("Dash Tester")).toBeVisible();
  });

  test("username dropdown shows Account Info and Logout", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await page.getByText("Dash Tester").click();
    await expect(page.getByRole("menuitem", { name: "Account Info" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Logout" })).toBeVisible();
  });

  test("Account Info navigates to /account", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await page.getByText("Dash Tester").click();
    await page.getByRole("menuitem", { name: "Account Info" }).click();
    await page.waitForURL("**/account", { timeout: 3000 });
  });

  test("Logout redirects to /login", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await page.getByText("Dash Tester").click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await page.waitForURL("**/login", { timeout: 3000 });
    const token = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(token).toBeNull();
  });
});
