import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("home loads and links to playgrounds", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Crea, formatea y valida rápido." }),
    ).toBeVisible();

    await expect(page.locator('a[href="/playground/json"]')).toBeVisible();
    await expect(page.locator('a[href="/playground/js"]')).toBeVisible();
  });

  test("can navigate to JSON playground", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/playground/json"]');

    await expect(page).toHaveURL(/\/playground\/json$/);
    await expect(page.getByRole("heading", { name: "JSON Tools" })).toBeVisible();
  });
});
