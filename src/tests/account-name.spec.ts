import { test, expect } from "@playwright/test";

const PASSWORD = "password123";
const INITIAL_NAME = "Name Tester";

async function signupAndGoToAccount(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.goto("/signup");
  await page.getByLabel("Name").fill(INITIAL_NAME);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
  await page.goto("/account");
}

test("display name input is pre-filled with current name", async ({
  page,
}, testInfo) => {
  const email = `name-prefill-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await signupAndGoToAccount(page, email);
  await expect(page.getByLabel("Name")).toHaveValue(INITIAL_NAME);
});

test("empty name shows validation error", async ({ page }, testInfo) => {
  const email = `name-empty-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await signupAndGoToAccount(page, email);
  await page.getByLabel("Name").clear();
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page.getByText("Name is required")).toBeVisible();
});

test("saving new name shows success and updates dashboard", async ({
  page,
}, testInfo) => {
  const email = `name-save-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await signupAndGoToAccount(page, email);

  const input = page.getByLabel("Name");
  await input.clear();
  await input.fill("Updated Name");
  await page.getByRole("button", { name: "Save" }).first().click();

  // Success message appears
  await expect(page.getByText("Saved!")).toBeVisible();

  // Navigate to dashboard and verify name in top bar
  await page.goto("/dashboard");
  await expect(page.getByText("Updated Name")).toBeVisible();

  // Go back to account and verify input shows new name
  await page.goto("/account");
  await expect(page.getByLabel("Name")).toHaveValue("Updated Name");
});

test("account name form screenshot", async ({ page }, testInfo) => {
  const email = `name-screenshot-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await signupAndGoToAccount(page, email);

  const input = page.getByLabel("Name");
  await input.clear();
  await input.fill("Updated Name");
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page.getByText("Saved!")).toBeVisible();

  await page.screenshot({
    path: ".agent/screenshots/TASK-28-1.png",
    fullPage: true,
  });
});
