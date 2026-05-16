import { test, expect } from "@playwright/test";

test.describe("Hash workflow", () => {
  test("generate hashes for default text and assert SHA-256 row is visible", async ({ page }) => {
    await page.goto("/playground/hash");

    await expect(page.getByRole("heading", { name: "Hash Generator" })).toBeVisible();

    // Default input mode is text with hashConfig.example ("Hello World")
    await page.getByRole("button", { name: "Generar" }).click();

    await expect(page.getByRole("heading", { name: "Resultados" })).toBeVisible();
    // sha256 label appears in the results row (uppercase span)
    await expect(page.getByText("sha256", { exact: true })).toBeVisible();
  });

  test("switch to file mode and assert drop zone is visible", async ({ page }) => {
    await page.goto("/playground/hash");

    await page.getByRole("button", { name: "Archivo" }).click();

    // When no file is selected, the drop zone renders as a button
    await expect(
      page.getByRole("button", { name: "Seleccionar archivo — clic o arrastrar aquí" }),
    ).toBeVisible();
  });

  test("compare hash returns match for valid input", async ({ page }) => {
    await page.goto("/playground/hash");

    // Generate hashes for the default text
    await page.getByRole("button", { name: "Generar" }).click();
    await expect(page.getByRole("heading", { name: "Resultados" })).toBeVisible();

    // Get the sha256 hash value from the code element in the sha256 row
    const sha256Row = page
      .locator("div.flex.items-center.justify-between")
      .filter({ has: page.getByText("sha256", { exact: true }) });
    const hashValue = await sha256Row.locator("code").innerText();

    // Paste into compare input and click compare
    await page.getByPlaceholder("Ingresa un hash para comparar...").fill(hashValue);
    await page.getByRole("button", { name: "Comparar" }).click();

    await expect(page.getByText("El hash coincide")).toBeVisible();
  });
});
