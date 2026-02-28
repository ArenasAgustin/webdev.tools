import { test, expect } from "@playwright/test";

test.describe("JS workflow", () => {
  test("execute valid JavaScript code", async ({ page }) => {
    await page.goto("/playground/js");

    await page.getByRole("button", { name: "Ejemplo", exact: true }).click();
    await page.getByRole("button", { name: "Ejecutar", exact: true }).click();

    await expect(page.getByText("Código ejecutado correctamente")).toBeVisible();
  });

  test("capture console.log outputs", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await page.addInitScript(() => {
      window.localStorage.setItem("lastJs", 'console.log("E2E_LOG_OK")');
    });

    await page.goto("/playground/js");
    await page.getByRole("button", { name: "Ejecutar" }).click();

    await expect(page.getByText("Código ejecutado correctamente")).toBeVisible();

    await page.getByRole("button", { name: "Copiar" }).last().click();
    await expect(page.getByText("Resultado copiado al portapapeles")).toBeVisible();

    const copiedOutput = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copiedOutput).toContain("E2E_LOG_OK");
  });

  test("show runtime errors", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lastJs", 'throw new Error("Boom")');
    });

    await page.goto("/playground/js");
    await page.getByRole("button", { name: "Ejecutar" }).click();

    await expect(page.getByText("Error: Boom")).toBeVisible();
  });

  test("format JS code", async ({ page }) => {
    await page.goto("/playground/js");

    await page.getByRole("button", { name: "Ejemplo", exact: true }).click();
    await page.getByRole("button", { name: "Formatear", exact: true }).click();

    await expect(page.getByText("Código formateado correctamente")).toBeVisible();
  });

  test("minify JS code", async ({ page }) => {
    await page.goto("/playground/js");

    await page.getByRole("button", { name: "Ejemplo", exact: true }).click();
    await page.getByRole("button", { name: "Minificar", exact: true }).click();

    await expect(page.getByText("Código minificado correctamente")).toBeVisible();
  });

  test("save and load JS configuration", async ({ page }) => {
    await page.goto("/playground/js");

    await page.getByRole("button", { name: "Configurar herramientas" }).click();
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas JS" }),
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

  test("download JS file", async ({ page }) => {
    await page.goto("/playground/js");

    const downloadPromise = page.waitForEvent("download");
    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Código", exact: true }) });
    await inputPanel.getByRole("button", { name: "Descargar" }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("code.js");
  });

  test("copy output", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await page.goto("/playground/js");

    await page.getByRole("button", { name: "Ejecutar" }).click();
    const outputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Resultado", exact: true }) });
    await outputPanel.getByRole("button", { name: "Copiar" }).click();
    await expect(page.getByText("Resultado copiado al portapapeles")).toBeVisible();

    const copiedOutput = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copiedOutput).toContain("Factorial de 5:");
  });

  test("real-time syntax validation", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lastJs", "function(");
    });

    await page.goto("/playground/js");

    await page.getByRole("button", { name: "Formatear" }).click();

    await expect(
      page.getByText(/Error al formatear código|Unexpected|Error/i).first(),
    ).toBeVisible();
  });

  test("keyboard shortcuts", async ({ page }) => {
    await page.goto("/playground/js");

    await page.getByRole("button", { name: "Ejemplo", exact: true }).click();

    await page.getByRole("button", { name: "Formatear", exact: true }).click();
    await expect(page.getByText("Código formateado correctamente")).toBeVisible();

    await page.getByRole("button", { name: "Minificar", exact: true }).click();
    await expect(page.getByText("Código minificado correctamente")).toBeVisible();
  });
});
