import { test, expect, type Page } from "@playwright/test";

const PASSWORD = "password123";

async function loginUser(page: Page, workerIndex: number) {
  const email = `e2e-weight-${workerIndex}-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Weight User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
  return email;
}

/** Smoke tests for weight entry flows: log, edit, delete. */

test("user can log a weight entry and see it in the table", async ({
  page,
}, testInfo) => {
  await loginUser(page, testInfo.workerIndex);

  // Open weight entry form
  await page.getByRole("button", { name: "Add weight entry" }).click();

  // Fill in weight and submit
  await page.getByRole("spinbutton").fill("185.5");
  await page.getByRole("button", { name: "Submit" }).click();

  // Entry should appear in table
  await expect(page.getByRole("cell", { name: /185\.5/ })).toBeVisible();
});

test("user can edit a weight entry and see the updated value", async ({
  page,
}, testInfo) => {
  await loginUser(page, testInfo.workerIndex);

  // Add an entry first
  await page.getByRole("button", { name: "Add weight entry" }).click();
  await page.getByRole("spinbutton").fill("185.5");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("cell", { name: /185\.5/ })).toBeVisible();

  // Open the ... menu and click Edit
  await page.getByLabel("Entry actions").click();
  await page.getByRole("menuitem", { name: "Edit" }).click();

  // Change the value and save
  const input = page.getByRole("spinbutton");
  await input.clear();
  await input.fill("186.0");
  await page.getByRole("button", { name: "Save" }).click();

  // Updated value should show in table
  await expect(page.getByRole("cell", { name: /186/ })).toBeVisible();
});

test("user can delete a weight entry and it disappears from the table", async ({
  page,
}, testInfo) => {
  await loginUser(page, testInfo.workerIndex);

  // Add an entry
  await page.getByRole("button", { name: "Add weight entry" }).click();
  await page.getByRole("spinbutton").fill("185.5");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("cell", { name: /185\.5/ })).toBeVisible();

  // Delete via ... menu
  await page.getByLabel("Entry actions").click();
  await page.getByRole("menuitem", { name: "Delete" }).click();

  // Entry should be gone — table shows empty state
  await expect(page.getByText("No entries yet")).toBeVisible();
});
