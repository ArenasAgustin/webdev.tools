import { test, expect } from "@playwright/test";

test.describe("Password workflow", () => {
  test("generate password and assert input has a value", async ({ page }) => {
    await page.goto("/playground/password");

    await expect(page.getByRole("heading", { name: "Password Generator" })).toBeVisible();

    await page.getByRole("button", { name: "Generar" }).click();

    const passwordInput = page.getByPlaceholder("Tu contraseña aparecerá aquí");
    const value = await passwordInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test("toggle visibility changes input type", async ({ page }) => {
    await page.goto("/playground/password");

    await page.getByRole("button", { name: "Generar" }).click();

    const passwordInput = page.getByPlaceholder("Tu contraseña aparecerá aquí");

    // By default the input is type="password"
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click "Mostrar contraseña" to reveal
    await page.getByRole("button", { name: "Mostrar contraseña" }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click "Ocultar contraseña" to hide again
    await page.getByRole("button", { name: "Ocultar contraseña" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("strength indicator is visible after generating a password", async ({ page }) => {
    await page.goto("/playground/password");

    await page.getByRole("button", { name: "Generar" }).click();

    // Strength indicator renders when password is set
    await expect(page.getByText("Fortaleza:")).toBeVisible();
  });
});
