import { test, expect } from "@playwright/test";

test.describe("Timestamp workflow", () => {
  test("convert default example timestamp and assert format rows visible", async ({ page }) => {
    await page.goto("/playground/timestamp");

    await expect(page.getByRole("heading", { name: "Unix Timestamp" })).toBeVisible();

    // Default input contains timestampConfig.example ("1712160000")
    await page.getByRole("button", { name: "Convertir" }).click();

    // After conversion, format rows appear
    await expect(page.getByText("Unix (s)", { exact: true })).toBeVisible();
    await expect(page.getByText("ISO 8601", { exact: true })).toBeVisible();
    await expect(page.getByText("RFC 2822", { exact: true })).toBeVisible();
  });

  test("Ahora button populates input with a recent timestamp", async ({ page }) => {
    await page.goto("/playground/timestamp");

    // Clear the default value first
    await page.getByRole("button", { name: "Limpiar" }).click();

    const input = page.getByPlaceholder("Unix timestamp o fecha (ISO 8601, RFC 2822)...");
    await expect(input).toHaveValue("");

    await page.getByRole("button", { name: "Ahora" }).click();

    // Input should now contain a recent unix timestamp (a 10-digit number)
    const value = await input.inputValue();
    expect(value).toMatch(/^\d{10}$/);
  });

  test("invalid input shows error message", async ({ page }) => {
    await page.goto("/playground/timestamp");

    const input = page.getByPlaceholder("Unix timestamp o fecha (ISO 8601, RFC 2822)...");
    await input.fill("esto-no-es-un-timestamp-valido");

    await page.getByRole("button", { name: "Convertir" }).click();

    await expect(
      page.getByText("Input inválido. Ingresa un timestamp o fecha válida."),
    ).toBeVisible();
  });
});
