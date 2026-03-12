import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

async function signup(
  page: import("@playwright/test").Page,
  name: string,
  email: string,
) {
  await page.goto("/signup");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
}

test("email input is pre-filled with current email", async ({
  page,
}, testInfo) => {
  const email = `email-prefill-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await signup(page, "Email Tester", email);
  await page.goto("/account");
  await expect(page.getByLabel("Email")).toHaveValue(email);
});

test("invalid email format shows validation error", async ({
  page,
}, testInfo) => {
  const email = `email-invalid-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await signup(page, "Email Tester", email);
  await page.goto("/account");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: "Save" }).nth(1).click();
  await expect(page.getByText("Invalid email format")).toBeVisible();
});

test("duplicate email shows 'Email already in use'", async ({
  page,
}, testInfo) => {
  const email1 = `email-dup1-${testInfo.workerIndex}-${Date.now()}@example.com`;
  const email2 = `email-dup2-${testInfo.workerIndex}-${Date.now()}@example.com`;

  // Create second account with email2
  await signup(page, "User Two", email2);
  // Logout and sign up as first account
  await page.getByText("User Two").click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await page.waitForURL("**/login");
  await signup(page, "User One", email1);

  // Try to change email to email2 (already taken)
  await page.goto("/account");
  await page.getByLabel("Email").fill(email2);
  await page.getByRole("button", { name: "Save" }).nth(1).click();
  await expect(page.getByText("Email already in use")).toBeVisible();
});

test("saving valid email shows success message", async ({
  page,
}, testInfo) => {
  const email = `email-save-${testInfo.workerIndex}-${Date.now()}@example.com`;
  const newEmail = `email-new-${testInfo.workerIndex}-${Date.now()}@example.com`;
  await signup(page, "Email Tester", email);
  await page.goto("/account");
  await page.getByLabel("Email").fill(newEmail);
  await page.getByRole("button", { name: "Save" }).nth(1).click();
  await expect(page.getByText("Email updated!")).toBeVisible();

  // Verify input shows new email after save
  await expect(page.getByLabel("Email")).toHaveValue(newEmail);

  await page.screenshot({
    path: ".agent/screenshots/TASK-29-1.png",
    fullPage: true,
  });
});
