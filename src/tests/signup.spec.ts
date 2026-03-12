import { test, expect } from "@playwright/test";

test.describe("Sign up page", () => {
  test("renders form with all fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("HeavyDeets")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Invalid email")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("successful signup stores token and redirects to /dashboard", async ({
    page,
  }) => {
    await page.goto("/signup");
    const unique = Date.now();
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill(`test${unique}@example.com`);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    const token = await page.evaluate(() =>
      localStorage.getItem("auth_token"),
    );
    expect(token).toBeTruthy();
  });
});
