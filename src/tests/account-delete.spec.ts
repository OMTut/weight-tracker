import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

async function signupAndGoToAccount(
  page: import("@playwright/test").Page,
  workerIndex: number,
) {
  const email = `delete-test-${workerIndex}-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Delete Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
  await page.goto("/account");
  return email;
}

test("delete account button opens confirmation dialog", async ({
  page,
}, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);
  await page.getByRole("button", { name: "Delete Account" }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Delete Account" }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText("cannot be undone"),
  ).toBeVisible();

  await page.screenshot({
    path: ".agent/screenshots/TASK-32-1.png",
    fullPage: false,
  });
});

test("cancel closes dialog without action", async ({ page }, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);
  await page.getByRole("button", { name: "Delete Account" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  // Still on account page
  await expect(page).toHaveURL(/\/account/);
});

test("confirm delete redirects to login and prevents re-login", async ({
  page,
}, testInfo) => {
  const email = await signupAndGoToAccount(page, testInfo.workerIndex);

  // Delete account
  await page.getByRole("button", { name: "Delete Account" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete Account" })
    .click();

  // Should redirect to /login
  await page.waitForURL("**/login");
  await expect(page).toHaveURL(/\/login/);

  // Attempt login with deleted credentials — should fail
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
});
