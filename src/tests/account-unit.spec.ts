import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

async function signupAndGoToAccount(
  page: import("@playwright/test").Page,
  workerIndex: number,
) {
  const email = `unit-test-${workerIndex}-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Unit Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
  await page.goto("/account");
}

test("weight unit selector defaults to lbs", async ({ page }, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);
  const trigger = page.getByRole("combobox", { name: "Weight unit" });
  await expect(trigger).toContainText("lbs");
});

test("switch to kg saves and shows success", async ({ page }, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);

  // Open select and choose kg
  await page.getByRole("combobox", { name: "Weight unit" }).click();
  await page.getByRole("option", { name: "Kilograms (kg)" }).click();

  // Click Save in weight unit section (last Save button on page)
  await page.getByRole("button", { name: "Save" }).last().click();
  await expect(page.getByText("Preferences saved!")).toBeVisible();
});

test("unit change reflected in weight entry form on dashboard", async ({
  page,
}, testInfo) => {
  await signupAndGoToAccount(page, testInfo.workerIndex);

  // Switch to kg
  await page.getByRole("combobox", { name: "Weight unit" }).click();
  await page.getByRole("option", { name: "Kilograms (kg)" }).click();
  await page.getByRole("button", { name: "Save" }).last().click();
  await expect(page.getByText("Preferences saved!")).toBeVisible();

  // Go to dashboard and open weight entry form
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Add weight entry" }).click();

  // Weight label should show kg
  await expect(page.getByText(/kg/)).toBeVisible();

  await page.screenshot({
    path: ".agent/screenshots/TASK-31-1.png",
    fullPage: false,
  });
});
