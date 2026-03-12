import { test, expect } from "@playwright/test";

async function signupAndGoToDashboard(page: import("@playwright/test").Page) {
  const unique = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Weight Tester");
  await page.getByLabel("Email").fill(`we${unique}@example.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await page.waitForURL("**/dashboard", { timeout: 5000 });
}

test.describe("Weight entry form", () => {
  test("+ button reveals form, X closes it", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await expect(page.getByLabel("Weight (lbs)")).not.toBeVisible();
    await page.getByLabel("Add weight entry").click();
    await expect(page.getByLabel("Weight (lbs)")).toBeVisible();
    await page.getByLabel("Close entry form").click();
    await expect(page.getByLabel("Weight (lbs)")).not.toBeVisible();
  });

  test("Cancel button closes the form", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await page.getByLabel("Add weight entry").click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByLabel("Weight (lbs)")).not.toBeVisible();
  });

  test("submitting a valid weight hides the form", async ({ page }) => {
    await signupAndGoToDashboard(page);
    await page.getByLabel("Add weight entry").click();
    await page.getByLabel("Weight (lbs)").fill("175.5");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByLabel("Weight (lbs)")).not.toBeVisible({ timeout: 5000 });
  });
});
