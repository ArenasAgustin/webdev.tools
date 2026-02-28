import { test, expect } from "@playwright/test";

test.describe("Responsive & Mobile", () => {
  const getEditorGridColumns = async (page: import("@playwright/test").Page) => {
    await expect(page.getByRole("heading", { name: "JSON Tools" })).toBeVisible({ timeout: 15000 });

    const editorGrid = page.locator("main.grid").first();
    await expect(editorGrid).toBeVisible({ timeout: 15000 });

    const columns = await editorGrid.evaluate((element) => {
      const template = window.getComputedStyle(element).gridTemplateColumns;
      return template.split(" ").filter(Boolean).length;
    });

    return columns;
  };

  test("mobile viewport (375px) stacks editor panels", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/playground/json");

    const columns = await getEditorGridColumns(page);
    expect(columns).toBe(1);
  });

  test("tablet viewport (768px) keeps stacked layout", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/playground/json");

    const columns = await getEditorGridColumns(page);
    expect(columns).toBe(1);
  });

  test("desktop viewport (1920px) shows side-by-side panels", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/playground/json");

    const columns = await getEditorGridColumns(page);
    expect(columns).toBe(2);
  });

  test("touch interactions open and close sidebar on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/playground/json");

    const overlay = page.getByRole("button", { name: /Close sidebar overlay/i });

    await page.getByRole("button", { name: /Open sidebar/i }).click();
    await expect(page.getByRole("button", { name: "Close sidebar", exact: true })).toBeVisible();
    await expect(overlay).toBeVisible();

    await page.getByRole("button", { name: "Close sidebar", exact: true }).click();
    await expect(overlay).not.toBeVisible();
  });

  test("mobile config modal supports dialog accessibility and escape close", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Configurar herramientas" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(
      page.getByRole("heading", { name: "Configuración de Herramientas" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
