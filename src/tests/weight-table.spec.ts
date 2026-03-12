import { test, expect } from "@playwright/test";

async function signupAndGoToDashboard(page: import("@playwright/test").Page) {
  const unique = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Table Tester");
  await page.getByLabel("Email").fill(`tt${unique}@example.com`);
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

test.describe("Weight table", () => {
  test("shows empty state when no entries exist", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await expect(page.getByTestId("table-empty")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("table-empty")).toHaveText("No entries yet");
  });

  test("renders table with Date, Weight, Actions columns after adding entry", async ({
    page,
  }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "185.5");
    const table = page.getByTestId("weight-table");
    await expect(table).toBeVisible({ timeout: 5000 });
    await expect(table.getByRole("columnheader", { name: "Date" })).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Weight" }),
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Actions" }),
    ).toBeVisible();
    // Row should exist
    await expect(table.getByTestId("table-row").first()).toBeVisible();
    // Date formatted as DD.MM.YYYY
    const dateCell = table
      .getByTestId("table-row")
      .first()
      .getByRole("cell")
      .first();
    await expect(dateCell).toHaveText(/\d{2}\.\d{2}\.\d{4}/);
    // Weight shows unit label
    const weightCell = table
      .getByTestId("table-row")
      .first()
      .getByRole("cell")
      .nth(1);
    await expect(weightCell).toHaveText(/185.5 lbs/);
    await page.screenshot({ path: ".agent/screenshots/TASK-24-1.png" });
  });

  test("pagination controls show page info and Prev is disabled on page 1", async ({
    page,
  }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "180");
    await expect(page.getByTestId("page-info")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("prev-page")).toBeDisabled();
  });

  test("Next button is disabled when only 1 page of data", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await addWeightEntry(page, "175");
    await expect(page.getByTestId("next-page")).toBeDisabled({ timeout: 5000 });
    await page.screenshot({ path: ".agent/screenshots/TASK-24-2.png" });
  });
});
