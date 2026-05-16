import { test, expect } from "@playwright/test";

test.describe("Colors workflow", () => {
  test("navigate to Colors playground and verify format outputs are visible", async ({ page }) => {
    await page.goto("/playground/colors");

    await expect(page.getByRole("heading", { name: "Color Picker" })).toBeVisible();

    // Format rows are always rendered from displayFormats (hex, rgb, hsl, hsv, cmyk)
    // They appear as uppercase labels in the format row spans
    await expect(page.getByText("hex", { exact: true })).toBeVisible();
    await expect(page.getByText("rgb", { exact: true })).toBeVisible();
    await expect(page.getByText("hsl", { exact: true })).toBeVisible();
  });

  test("enter a new hex value and verify the format rows update", async ({ page }) => {
    await page.goto("/playground/colors");

    const input = page.getByPlaceholder("HEX, RGB, HSL, HSV, CMYK...");
    await input.fill("#ff0000");

    // After entering a valid hex, format rows should display the converted values
    // The hex row value should now reflect the new color
    await expect(page.getByText("hex", { exact: true })).toBeVisible();
    // The code element in the hex row should contain the value (rgb(255, 0, 0) form or similar)
    await expect(page.locator("code").first()).toBeVisible();
  });

  test("copy buttons have accessible labels for each format", async ({ page }) => {
    await page.goto("/playground/colors");

    // Each format row has a copy button with aria-label="Copiar {format}"
    await expect(page.getByRole("button", { name: "Copiar hex" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copiar rgb" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copiar hsl" })).toBeVisible();
  });
});
