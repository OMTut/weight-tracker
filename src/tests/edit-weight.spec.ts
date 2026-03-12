import { test, expect } from "@playwright/test";

async function signupAndGoToDashboard(page: import("@playwright/test").Page) {
  const unique = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Edit Tester");
  await page.getByLabel("Email").fill(`et${unique}@example.com`);
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

test.describe("Edit weight entry", () => {
  test("clicking Edit puts row into edit mode with input pre-filled", async ({
    page,
  }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "180");

    const row = page.getByTestId("table-row").first();
    await expect(row).toBeVisible({ timeout: 5000 });

    // Open dropdown and click Edit
    await row.locator("button").first().click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    // Input should be visible and pre-filled with 180
    const input = page.getByTestId("edit-weight-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveValue("180");

    // Save and Cancel buttons visible
    await expect(page.getByTestId("save-edit")).toBeVisible();
    await expect(page.getByTestId("cancel-edit")).toBeVisible();

    await page.screenshot({ path: ".agent/screenshots/TASK-26-1.png" });
  });

  test("clicking Save updates the entry value", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "170");

    const row = page.getByTestId("table-row").first();
    await expect(row).toBeVisible({ timeout: 5000 });

    await row.locator("button").first().click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    const input = page.getByTestId("edit-weight-input");
    await input.fill("175");
    await page.getByTestId("save-edit").click();

    // Edit mode should exit
    await expect(page.getByTestId("edit-weight-input")).not.toBeVisible({
      timeout: 5000,
    });

    // New value should appear in the table
    await expect(
      page.getByTestId("table-row").first().locator("td").nth(1),
    ).toContainText("175");

    await page.screenshot({ path: ".agent/screenshots/TASK-26-2.png" });
  });

  test("clicking Cancel exits edit mode without saving", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "160");

    const row = page.getByTestId("table-row").first();
    await expect(row).toBeVisible({ timeout: 5000 });

    await row.locator("button").first().click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    const input = page.getByTestId("edit-weight-input");
    await input.fill("999");
    await page.getByTestId("cancel-edit").click();

    // Edit mode exits
    await expect(page.getByTestId("edit-weight-input")).not.toBeVisible();

    // Value unchanged
    await expect(
      page.getByTestId("table-row").first().locator("td").nth(1),
    ).toContainText("160");
  });

  test("saving an invalid value shows validation error", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "150");

    const row = page.getByTestId("table-row").first();
    await expect(row).toBeVisible({ timeout: 5000 });

    await row.locator("button").first().click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    const input = page.getByTestId("edit-weight-input");
    await input.fill("-5");
    await page.getByTestId("save-edit").click();

    await expect(page.getByTestId("edit-error")).toBeVisible();

    await page.screenshot({ path: ".agent/screenshots/TASK-26-3.png" });
  });
});
