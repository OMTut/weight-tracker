import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

async function signupAndGoToAccount(
  page: import("@playwright/test").Page,
  workerIndex: number,
) {
  const email = `pw-test-${workerIndex}-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("PW Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
  await page.goto("/account");
  return email;
}

test("passwords do not match shows error", async ({ page }, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);
  await page.getByLabel("Current Password").fill(PASSWORD);
  await page.getByLabel("New Password", { exact: true }).fill("newpassword1");
  await page.getByLabel("Confirm New Password").fill("differentpassword");
  await page.getByRole("button", { name: "Save" }).nth(2).click();
  await expect(page.getByText("Passwords do not match")).toBeVisible();
});

test("new password too short shows error", async ({ page }, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);
  await page.getByLabel("Current Password").fill(PASSWORD);
  await page.getByLabel("New Password", { exact: true }).fill("short");
  await page.getByLabel("Confirm New Password").fill("short");
  await page.getByRole("button", { name: "Save" }).nth(2).click();
  await expect(
    page.getByText("New password must be at least 8 characters"),
  ).toBeVisible();
});

test("wrong current password shows error", async ({ page }, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);
  await page.getByLabel("Current Password").fill("wrongpassword");
  await page.getByLabel("New Password", { exact: true }).fill("newpassword1");
  await page.getByLabel("Confirm New Password").fill("newpassword1");
  await page.getByRole("button", { name: "Save" }).nth(2).click();
  await expect(page.getByText("Current password is incorrect")).toBeVisible();
});

test("successful password change shows success and clears inputs", async ({
  page,
}, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);
  await page.getByLabel("Current Password").fill(PASSWORD);
  await page.getByLabel("New Password", { exact: true }).fill("newpassword1");
  await page.getByLabel("Confirm New Password").fill("newpassword1");
  await page.getByRole("button", { name: "Save" }).nth(2).click();
  await expect(page.getByText("Password updated!")).toBeVisible();

  // All three inputs should be cleared
  await expect(page.getByLabel("Current Password")).toHaveValue("");
  await expect(page.getByLabel("New Password", { exact: true })).toHaveValue(
    "",
  );
  await expect(page.getByLabel("Confirm New Password")).toHaveValue("");

  await page.screenshot({
    path: ".agent/screenshots/TASK-30-1.png",
    fullPage: true,
  });
});
