import { test, expect } from "@playwright/test";

/**
 * File Import E2E tests — button path
 *
 * Drag & drop via DataTransfer in Playwright requires constructing a DataTransfer
 * object inside page.evaluate (no native browser API exposure). This is complex and
 * flaky with Monaco's internal drag interception. Drag & drop coverage is provided
 * at the unit/integration level; E2E drag tests are marked as manual-only.
 */

test.describe("File import — button path (JSON playground)", () => {
  test("importing a valid .json file loads content into the editor", async ({ page }) => {
    await page.goto("/playground/json");

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "JSON", exact: true }) });

    // The hidden file input lives inside the input panel
    const fileInput = inputPanel.locator('input[type="file"]');

    const jsonContent = JSON.stringify({ hello: "world" }, null, 2);

    await fileInput.setInputFiles({
      name: "sample.json",
      mimeType: "application/json",
      buffer: Buffer.from(jsonContent),
    });

    // Success toast must appear
    await expect(page.getByText(/Archivo "sample\.json" cargado/)).toBeVisible();

    // Editor must contain the loaded content — wait for Monaco to update
    await expect(page.locator(".monaco-editor").first()).toContainText('"hello"');
  });

  test("importing a file with an invalid extension shows an error toast", async ({ page }) => {
    await page.goto("/playground/json");

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "JSON", exact: true }) });

    const fileInput = inputPanel.locator('input[type="file"]');

    // .css is not accepted in the JSON playground
    await fileInput.setInputFiles({
      name: "styles.css",
      mimeType: "text/css",
      buffer: Buffer.from(".body { color: red; }"),
    });

    // Error toast must appear
    await expect(page.getByText(/Archivo no válido/)).toBeVisible();

    // Editor must NOT contain the css content
    await expect(page.locator(".monaco-editor").first()).not.toContainText(".body");
  });

  test("Abrir button is visible in the JSON playground input panel", async ({ page }) => {
    await page.goto("/playground/json");

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "JSON", exact: true }) });

    await expect(inputPanel.getByRole("button", { name: /Importar archivo/i })).toBeVisible();
  });
});

test.describe("File import — button path (CSS playground)", () => {
  test("importing a valid .css file loads content into the editor", async ({ page }) => {
    await page.goto("/playground/css");

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "CSS", exact: true }) });

    const fileInput = inputPanel.locator('input[type="file"]');
    const cssContent = ".card { color: red; }";

    await fileInput.setInputFiles({
      name: "styles.css",
      mimeType: "text/css",
      buffer: Buffer.from(cssContent),
    });

    await expect(page.getByText(/Archivo "styles\.css" cargado/)).toBeVisible();
    await expect(page.locator(".monaco-editor").first()).toContainText(".card");
  });

  test("importing a file with invalid extension shows error toast", async ({ page }) => {
    await page.goto("/playground/css");

    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "CSS", exact: true }) });

    const fileInput = inputPanel.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "data.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"a":1}'),
    });

    await expect(page.getByText(/Archivo no válido/)).toBeVisible();
  });
});

test.describe("File import — expanded modal", () => {
  test("importing a file via Abrir button inside expanded modal loads content and keeps modal open", async ({
    page,
  }) => {
    await page.goto("/playground/json");

    // Open the expanded editor modal
    const inputPanel = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "JSON", exact: true }) });

    await inputPanel.getByRole("button", { name: /Expandir editor/i }).click();

    // Modal should be visible
    await expect(page.getByRole("dialog")).toBeVisible();

    // File input inside the modal
    const modalFileInput = page.getByRole("dialog").locator('input[type="file"]');

    const jsonContent = JSON.stringify({ expanded: true });

    await modalFileInput.setInputFiles({
      name: "modal.json",
      mimeType: "application/json",
      buffer: Buffer.from(jsonContent),
    });

    // Toast confirms import
    await expect(page.getByText(/Archivo "modal\.json" cargado/)).toBeVisible();

    // Modal must still be open
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
