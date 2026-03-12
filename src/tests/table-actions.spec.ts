import { test, expect } from "@playwright/test";

async function signupAndGoToDashboard(page: import("@playwright/test").Page) {
  const unique = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Actions Tester");
  await page.getByLabel("Email").fill(`at${unique}@example.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await page.waitForURL("**/dashboard", { timeout: 5000 });
}

async function addWeightEntry(
  page: import("@playwright/test").Page,
  weight: string,
) {
  await page.getByLabel("Add weight entry").click();
  await page.getByLabel(/Weight/).fill(weight);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByLabel(/Add weight entry/)).toBeVisible({
    timeout: 5000,
  });
}

test.describe("Table row actions", () => {
  test("... button opens dropdown with Edit and Delete options", async ({
    page,
  }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "200");

    // Wait for row to appear and click the actions button
    const row = page.getByTestId("table-row").first();
    await expect(row).toBeVisible({ timeout: 5000 });

    // Click the DropdownMenu trigger (the outermost button wrapping the icon)
    await row.locator("button").first().click();

    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();

    await page.screenshot({ path: ".agent/screenshots/TASK-25-1.png" });
  });

  test("clicking Delete removes the entry from the table", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "195");

    const row = page.getByTestId("table-row").first();
    await expect(row).toBeVisible({ timeout: 5000 });

    await row.locator("button").first().click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    // Entry should disappear
    await expect(page.getByTestId("table-empty")).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: ".agent/screenshots/TASK-25-2.png" });
  });
});
