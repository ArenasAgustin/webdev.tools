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
      page.getByRole("heading", { name: "Configuración de Herramientas JSON" }),
    ).toBeVisible();

    // Close modal with Escape key
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas JSON" }),
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
    await inputEditor.waitFor({ state: "visible", timeout: 10000 });
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
      page.getByRole("heading", { name: "Configuración de Herramientas JSON" }),
    ).toBeVisible();
  });

  test("Ctrl+Shift+D opens diff overlay and Escape closes it", async ({ page }) => {
    await page.goto("/playground/json");

    // Load example and format to get some output
    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();
    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();

    // Open diff overlay with keyboard shortcut
    await page.keyboard.press("Control+Shift+D");

    // Verify the diff modal is open — Container renders with title "Diferencias" and role="dialog"
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Diferencias")).toBeVisible();

    // Close with Escape
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("expand button opens editor modal with input value and Escape closes it", async ({
    page,
  }) => {
    await page.goto("/playground/json");

    // Load example so there's content in the editor
    await page.getByRole("button", { name: "Ejemplo" }).click();

    // The input panel has an "Expandir editor" button in InputActions
    // There are two such buttons (input + output panels); first one belongs to the input panel
    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "JSON", exact: true }) });
    await inputPanel.getByRole("button", { name: "Expandir editor" }).click();

    // Verify the expanded modal dialog appears
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // The expanded modal shows a code editor with the same content
    await expect(dialog.locator(".monaco-editor")).toBeVisible();

    // Close with Escape
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("Ctrl+' shows keyboard shortcuts modal", async ({ page }) => {
    await page.goto("/playground/json");

    // Click a button to ensure focus is not inside Monaco (contentEditable) or an input
    // (keyboard shortcuts are suppressed when focus is inside inputs/contentEditable)
    await page.getByRole("button", { name: "Ejemplo" }).click();

    // Open shortcuts modal with keyboard shortcut
    await page.keyboard.press("Control+'");

    // Verify the shortcuts modal is visible
    await expect(page.getByRole("heading", { name: "Atajos de teclado" })).toBeVisible();

    // Close modal with the close button
    await page.getByRole("button", { name: "Cerrar modal" }).click();
    await expect(page.getByRole("heading", { name: "Atajos de teclado" })).not.toBeVisible();
  });

  test("JSONPath history: delete entry removes it from list", async ({ page }) => {
    await page.goto("/playground/json");

    // Load example and apply a JSONPath query to create history entry
    await page.getByRole("button", { name: "Ejemplo" }).click();

    const jsonPathInput = page.getByLabel("Expresion JSONPath");
    await jsonPathInput.fill("$.users[*].name");
    await page.getByRole("button", { name: "Aplicar filtro JSONPath" }).click();

    // Wait for the result to be applied before opening history
    await expect(page.locator(".monaco-editor").last()).toBeVisible();
    await page.waitForTimeout(300);

    // Open history modal
    await page.getByRole("button", { name: "Historial de filtros" }).click();
    await expect(
      page.getByRole("heading", { name: "Historial de Filtros", exact: true }),
    ).toBeVisible();

    // Verify the entry is in the list
    await expect(page.getByText("$.users[*].name")).toBeVisible();

    // Click the delete button for this entry
    await page.getByRole("button", { name: "Borrar filtro" }).first().click();

    // Verify the entry is no longer in the list
    await expect(page.getByText("$.users[*].name")).not.toBeVisible();
  });
});
