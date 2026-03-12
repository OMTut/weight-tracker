import { test, expect } from "@playwright/test";

test.describe("Sign in page", () => {
  test("renders form with all fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("HeavyDeets")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Invalid email")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("successful login stores token and redirects to /dashboard", async ({
    page,
  }) => {
    // First create an account
    const unique = Date.now();
    const email = `logintest${unique}@example.com`;
    await page.goto("/signup");
    await page.getByLabel("Name").fill("Login Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await page.waitForURL("**/dashboard");

    // Logout by clearing storage and going to login
    await page.evaluate(() => localStorage.clear());
    await page.goto("/login");

    // Login
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    const token = await page.evaluate(() =>
      localStorage.getItem("auth_token"),
    );
    expect(token).toBeTruthy();
  });
});
