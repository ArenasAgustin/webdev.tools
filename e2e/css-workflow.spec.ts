import { test, expect } from "@playwright/test";

test.describe("CSS workflow", () => {
  test("load example and format CSS", async ({ page }) => {
    await page.goto("/playground/css");

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "CSS", exact: true }) });
    await inputPanel.getByRole("button", { name: "Ejemplo" }).click();

    await page.getByRole("button", { name: /Formatear/i }).click();
    await expect(page.getByText("CSS formateado correctamente")).toBeVisible();
  });

  test("load example and minify CSS", async ({ page }) => {
    await page.goto("/playground/css");

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "CSS", exact: true }) });
    await inputPanel.getByRole("button", { name: "Ejemplo" }).click();

    await page.getByRole("button", { name: /Minificar/i }).click();
    await expect(page.getByText("CSS minificado correctamente")).toBeVisible();
  });

  test("save and load CSS configuration", async ({ page }) => {
    await page.goto("/playground/css");

    await page.getByRole("button", { name: "Configurar herramientas" }).click();
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas CSS" }),
    ).toBeVisible();

    const indent4 = page.getByRole("button", { name: "4 espacios" });
    await indent4.click();
    await expect(indent4).toHaveAttribute("aria-pressed", "true");

    await page.keyboard.press("Escape");
    await page.reload();

    await page.getByRole("button", { name: "Configurar herramientas" }).click();
    const indent4Reloaded = page.getByRole("button", { name: "4 espacios" });
    await expect(indent4Reloaded).toHaveAttribute("aria-pressed", "true");
  });
});
