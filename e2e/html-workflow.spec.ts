import { test, expect } from "@playwright/test";
import { openToolbar } from "./helpers";

test.describe("HTML workflow", () => {
  test("load example and format HTML", async ({ page }) => {
    await page.goto("/playground/html");
    await openToolbar(page);

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "HTML", exact: true }) });
    await inputPanel.getByRole("button", { name: "Ejemplo" }).click();

    await page.getByRole("button", { name: /Formatear/i }).click();
    await expect(page.getByText("HTML formateado correctamente")).toBeVisible();
  });

  test("load example and minify HTML", async ({ page }) => {
    await page.goto("/playground/html");
    await openToolbar(page);

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "HTML", exact: true }) });
    await inputPanel.getByRole("button", { name: "Ejemplo" }).click();

    await page.getByRole("button", { name: /Minificar/i }).click();
    await expect(page.getByText("HTML minificado correctamente")).toBeVisible();
  });

  test("save and load HTML configuration", async ({ page }) => {
    await page.goto("/playground/html");

    await page.getByRole("button", { name: "Configurar herramientas" }).click();
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas HTML" }),
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

  test("download HTML input", async ({ page }) => {
    await page.goto("/playground/html");

    const downloadPromise = page.waitForEvent("download");
    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "HTML", exact: true }) });
    await inputPanel.getByRole("button", { name: "Descargar" }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("index.html");
  });

  test("copy output after formatting", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await page.goto("/playground/html");
    await openToolbar(page);

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "HTML", exact: true }) });
    await inputPanel.getByRole("button", { name: "Ejemplo" }).click();

    await page.getByRole("button", { name: /Formatear/i }).click();
    await expect(page.getByText("HTML formateado correctamente")).toBeVisible();

    const outputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Resultado", exact: true }) });
    await outputPanel.getByRole("button", { name: "Copiar" }).click();
    await expect(page.getByText("Resultado copiado al portapapeles")).toBeVisible();

    const copiedOutput = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copiedOutput).toContain("<html");
  });

  test("toolbar actions", async ({ page }) => {
    await page.goto("/playground/html");
    await openToolbar(page);

    await page.getByRole("button", { name: /Formatear/i }).click();
    await expect(page.getByText("HTML formateado correctamente")).toBeVisible();

    await page.getByRole("button", { name: /Minificar/i }).click();
    await expect(page.getByText("HTML minificado correctamente")).toBeVisible();

    await page.getByRole("button", { name: "Configurar herramientas" }).click();
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas HTML" }),
    ).toBeVisible();
  });

  test("live preview and DOM inspection", async ({ page }) => {
    await page.goto("/playground/html");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ver vista previa" }).click();
    await expect(page.getByTitle("Vista previa HTML")).toBeVisible();
    await expect(page.getByText("Inspección DOM")).toBeVisible();

    await page.getByRole("button", { name: /Formatear/i }).click();
    await expect(page.getByText("HTML formateado correctamente")).toBeVisible();

    await expect(page.getByTestId("dom-inspection-summary")).toContainText("html");
    await expect(page.getByTestId("dom-inspection-summary")).toContainText("body");

    await page.getByRole("button", { name: "Ver resultado" }).click();
    await expect(page.getByRole("heading", { name: "Resultado", exact: true })).toBeVisible();
  });
});
