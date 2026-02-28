import { test, expect } from "@playwright/test";

test.describe("Cross-playground navigation", () => {
  test("navigate between playgrounds from sidebar", async ({ page }) => {
    await page.goto("/playground/json");

    await expect(page).toHaveURL(/\/playground\/json$/);
    await expect(page.getByRole("heading", { name: "JSON Tools" })).toBeVisible();

    await page.getByRole("button", { name: /Open sidebar/i }).click();
    await page.getByRole("link", { name: /JavaScript tools/i }).click();

    await expect(page).toHaveURL(/\/playground\/js$/);
    await expect(page.getByRole("heading", { name: "JavaScript tools" })).toBeVisible();

    await page.getByRole("button", { name: /Open sidebar/i }).click();
    await page.getByRole("link", { name: /JSON Tools/i }).click();

    await expect(page).toHaveURL(/\/playground\/json$/);
    await expect(page.getByRole("heading", { name: "JSON Tools" })).toBeVisible();
  });

  test("preserve state when navigating between playground routes", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Configurar herramientas" }).click();
    const jsonIndent4 = page.getByRole("button", { name: "4 espacios" });
    await jsonIndent4.click();
    await expect(jsonIndent4).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("toolsConfig") ?? ""))
      .toContain('"indent":4');

    await page.getByRole("button", { name: /Open sidebar/i }).click();
    await page.getByRole("link", { name: /JavaScript tools/i }).click();

    await expect(page).toHaveURL(/\/playground\/js$/);

    await page.getByRole("button", { name: /Open sidebar/i }).click();
    await page.getByRole("link", { name: /JSON Tools/i }).click();

    await expect(page).toHaveURL(/\/playground\/json$/);
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("toolsConfig") ?? ""))
      .toContain('"indent":4');
  });
});
