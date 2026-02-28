import { test, expect } from "@playwright/test";

test.describe("JSON workflow", () => {
  test("load example and format JSON", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();

    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();
  });

  test("load example and minify JSON", async ({ page }) => {
    await page.goto("/playground/json");

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Entrada", exact: true }) });
    await inputPanel.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Minificar" }).click();

    await expect(page.getByText("JSON minificado correctamente")).toBeVisible();
  });

  test("clean removes null and empty string values", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await page.goto("/playground/json");

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

    await page.getByRole("button", { name: "Ejemplo" }).click();

    // Apply a JSONPath query
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

    // Open history modal
    await page.getByRole("button", { name: "Historial de filtros" }).click();

    // Verify modal is open and contains the expression
    await expect(
      page.getByRole("heading", { name: "Historial de Filtros", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("$.products[*].name")).toBeVisible();

    // Close modal
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "Historial de Filtros", exact: true }),
    ).not.toBeVisible();

    // Test reusing from history
    await jsonPathInput.clear();
    await page.getByRole("button", { name: "Historial de filtros" }).click();

    // Click on the history item to reuse it
    await page.getByText("$.products[*].name").click();

    // Verify the expression was filled and filter applied
    await expect(jsonPathInput).toHaveValue("$.products[*].name");

    await copyOutputAndAssertContainsLaptop();
  });

  test("config modal opens and closes", async ({ page }) => {
    await page.goto("/playground/json");

    // Open config modal
    await page.getByRole("button", { name: "Configurar herramientas" }).click();

    // Verify modal is visible
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas" }),
    ).toBeVisible();

    // Close modal with Escape key
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas" }),
    ).not.toBeVisible();
  });

  test("tips modal shows JSONPath examples", async ({ page }) => {
    await page.goto("/playground/json");

    // Open tips modal
    await page.getByRole("button", { name: "Ver tips de filtros" }).click();

    // Verify modal shows tips content
    await expect(page.locator("text=/Tips.*JSONPath/i")).toBeVisible();

    // Verify it shows example paths
    await expect(page.locator("text=/\\$\\./").first()).toBeVisible();

    // Close modal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  test("download formatted JSON", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();

    // Wait for format to complete
    await page.waitForTimeout(500);

    // Setup download listener and click download inside the output panel
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

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();

    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();

    // Copy output
    await page.getByRole("button", { name: "Copiar" }).click();
    await expect(page.getByText("Copiado al portapapeles")).toBeVisible();

    // Verify clipboard contains formatted JSON
    const copied = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copied).toContain('"users"');
    expect(copied).toContain('"products"');
  });

  test("real-time validation shows errors", async ({ page }) => {
    await page.goto("/playground/json");

    // Load example first to clear the editor
    await page.getByRole("button", { name: "Ejemplo" }).click();

    // Clear and type invalid JSON
    await page
      .getByRole("button", { name: /Limpiar/i })
      .first()
      .click();
    await page.waitForTimeout(200);

    const inputEditor = page.locator(".monaco-editor").first();
    await inputEditor.click();
    await page.keyboard.type("invalid json");

    // Wait for validation
    await page.waitForTimeout(800);

    // Check that "JSON válido" is NOT visible (indicating invalid state)
    const validIndicator = page.locator("text=/JSON válido/i");
    await expect(validIndicator).not.toBeVisible();
  });

  test("save and load configuration persists", async ({ page }) => {
    await page.goto("/playground/json");

    // Open config modal
    await page.getByRole("button", { name: "Configurar herramientas" }).click();

    const indent4Button = page.getByRole("button", { name: "4 espacios" });
    await indent4Button.click();
    await expect(indent4Button).toHaveAttribute("aria-pressed", "true");

    // Close modal (saves config)
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();

    // Re-open modal and verify persisted selection
    await page.getByRole("button", { name: "Configurar herramientas" }).click();
    const indent4ButtonReloaded = page.getByRole("button", { name: "4 espacios" });
    await expect(indent4ButtonReloaded).toHaveAttribute("aria-pressed", "true");
  });

  test("keyboard shortcuts work", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Ejemplo" }).click();

    // Test format shortcut (Ctrl+Shift+F)
    await page.keyboard.press("Control+Shift+F");
    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();

    // Test minify shortcut (Ctrl+Shift+M)
    await page.keyboard.press("Control+Shift+M");
    await expect(page.getByText("JSON minificado correctamente")).toBeVisible();

    // Test config shortcut (Ctrl+,)
    await page.keyboard.press("Control+Comma");
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas" }),
    ).toBeVisible();
  });
});
