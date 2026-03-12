import { test, expect } from "@playwright/test";

/** Smoke tests for the authentication flows: signup, login, logout. */

test("user can sign up with a new email and is redirected to dashboard", async ({
  page,
}, testInfo) => {
  const email = `e2e-signup-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("user can log in with existing credentials", async ({
  page,
}, testInfo) => {
  const email = `e2e-login-${testInfo.workerIndex}-${Date.now()}@example.com`;

  // First sign up
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Login User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");

  // Log out
  await page.getByText("E2E Login User").click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await page.waitForURL("**/login");

  // Log back in
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("user can log out and is redirected to /login", async ({
  page,
}, testInfo) => {
  const email = `e2e-logout-${testInfo.workerIndex}-${Date.now()}@example.com`;

  // Sign up
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Logout User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");

  // Click username dropdown and logout
  await page.getByText("E2E Logout User").click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await page.waitForURL("**/login");
  await expect(page).toHaveURL(/\/login/);
});
