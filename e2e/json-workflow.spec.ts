import { test, expect } from "@playwright/test";
import { openToolbar } from "./helpers";

test.describe("JSON workflow", () => {
  test("load example and format JSON", async ({ page }) => {
    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();

    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();
  });

  test("load example and minify JSON", async ({ page }) => {
    await page.goto("/playground/json");
    await openToolbar(page);

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "JSON", exact: true }) });
    await inputPanel.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Minificar" }).click();

    await expect(page.getByText("JSON minificado correctamente")).toBeVisible();
  });

  test("clean removes null and empty string values", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Limpiar vacíos" }).click();

    await expect(page.getByText("JSON limpiado correctamente")).toBeVisible();

    await page.getByRole("button", { name: "Copiar" }).click();
    await expect(page.getByText("Copiado al portapapeles")).toBeVisible();

    const copied = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copied).not.toContain('"other": null');
    expect(copied).not.toContain('""');
  });

  test("apply JSONPath query to filter data", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ejemplo" }).click();

    const jsonPathInput = page.getByLabel("Expresion JSONPath");
    await jsonPathInput.fill("$.users[*].name");

    await page.getByRole("button", { name: "Aplicar filtro JSONPath" }).click();

    const outputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Resultado", exact: true }) });
    await outputPanel.getByRole("button", { name: "Copiar" }).click();

    await expect
      .poll(async () => page.evaluate(async () => navigator.clipboard.readText()))
      .toContain("Juan Pérez");
    const copiedText = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copiedText).toContain("María García");
    expect(copiedText).toContain("Carlos López");
  });

  test("JSONPath history saves and reuses expressions", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ejemplo" }).click();

    const jsonPathInput = page.getByLabel("Expresion JSONPath");
    await jsonPathInput.fill("$.products[*].name");
    await page.getByRole("button", { name: "Aplicar filtro JSONPath" }).click();

    const copyOutputAndAssertContainsLaptop = async () => {
      await page.getByRole("button", { name: "Copiar" }).click();
      await expect
        .poll(async () => page.evaluate(async () => navigator.clipboard.readText()))
        .toContain("Laptop");
    };

    await copyOutputAndAssertContainsLaptop();

    await page.getByRole("button", { name: "Historial de filtros" }).click();

    await expect(
      page.getByRole("heading", { name: "Historial de Filtros", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("$.products[*].name")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "Historial de Filtros", exact: true }),
    ).not.toBeVisible();

    await jsonPathInput.clear();
    await page.getByRole("button", { name: "Historial de filtros" }).click();

    await page.getByText("$.products[*].name").click();

    await expect(jsonPathInput).toHaveValue("$.products[*].name");

    await copyOutputAndAssertContainsLaptop();
  });

  test("config modal opens and closes", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Configurar herramientas" }).click();

    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas JSON" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas JSON" }),
    ).not.toBeVisible();
  });

  test("tips modal shows JSONPath examples", async ({ page }) => {
    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ver tips de filtros" }).click();

    await expect(page.locator("text=/Tips.*JSONPath/i")).toBeVisible();
    await expect(page.locator("text=/\\$\\./").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  test("download formatted JSON", async ({ page }) => {
    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();

    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent("download");
    const outputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Resultado", exact: true }) });
    await outputPanel.getByRole("button", { name: "Descargar" }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test("copy output to clipboard", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();

    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();

    await page.getByRole("button", { name: "Copiar" }).click();
    await expect(page.getByText("Copiado al portapapeles")).toBeVisible();

    const copied = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copied).toContain('"users"');
    expect(copied).toContain('"products"');
  });

  test("real-time validation shows errors", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Ejemplo" }).click();

    await page
      .getByRole("button", { name: /Limpiar/i })
      .first()
      .click();
    await page.waitForTimeout(200);

    const inputEditor = page.locator(".monaco-editor").first();
    await inputEditor.waitFor({ state: "visible", timeout: 10000 });
    await inputEditor.click();
    await page.keyboard.type("invalid json");

    await page.waitForTimeout(800);

    const validIndicator = page.locator("text=/JSON válido/i");
    await expect(validIndicator).not.toBeVisible();
  });

  test("save and load configuration persists", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Configurar herramientas" }).click();

    const indent4Button = page.getByRole("button", { name: "4 espacios" });
    await indent4Button.click();
    await expect(indent4Button).toHaveAttribute("aria-pressed", "true");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await page.reload();

    await page.getByRole("button", { name: "Configurar herramientas" }).click();
    const indent4ButtonReloaded = page.getByRole("button", { name: "4 espacios" });
    await expect(indent4ButtonReloaded).toHaveAttribute("aria-pressed", "true");
  });

  test("keyboard shortcuts work", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Ejemplo" }).click();

    await page.keyboard.press("Control+Shift+F");
    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();

    await page.keyboard.press("Control+Shift+M");
    await expect(page.getByText("JSON minificado correctamente")).toBeVisible();

    await page.keyboard.press("Control+Comma");
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas JSON" }),
    ).toBeVisible();
  });

  test("Ctrl+Shift+D opens diff overlay and Escape closes it", async ({ page }) => {
    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();
    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();

    await page.keyboard.press("Control+Shift+D");

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Diferencias")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("expand button opens editor modal with input value and Escape closes it", async ({
    page,
  }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Ejemplo" }).click();

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "JSON", exact: true }) });
    await inputPanel.getByRole("button", { name: "Expandir editor" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".monaco-editor")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("Ctrl+' shows keyboard shortcuts modal", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Ejemplo" }).click();

    await page.keyboard.press("Control+'");

    await expect(page.getByRole("heading", { name: "Atajos de teclado" })).toBeVisible();

    await page.getByRole("button", { name: "Cerrar modal" }).click();
    await expect(page.getByRole("heading", { name: "Atajos de teclado" })).not.toBeVisible();
  });

  test("JSONPath history: delete entry removes it from list", async ({ page }) => {
    await page.goto("/playground/json");
    await openToolbar(page);

    await page.getByRole("button", { name: "Ejemplo" }).click();

    const jsonPathInput = page.getByLabel("Expresion JSONPath");
    await jsonPathInput.fill("$.users[*].name");
    await page.getByRole("button", { name: "Aplicar filtro JSONPath" }).click();

    await expect(page.locator(".monaco-editor").last()).toBeVisible();
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: "Historial de filtros" }).click();
    await expect(
      page.getByRole("heading", { name: "Historial de Filtros", exact: true }),
    ).toBeVisible();

    await expect(page.getByText("$.users[*].name")).toBeVisible();

    await page.getByRole("button", { name: "Borrar filtro" }).first().click();

    await expect(page.getByText("$.users[*].name")).not.toBeVisible();
  });
});
