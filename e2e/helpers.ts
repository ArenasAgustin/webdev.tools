import type { Page } from "@playwright/test";

/**
 * Opens the toolbar if it's currently collapsed.
 * The toolbar starts hidden by default — call this after page.goto()
 * in any test that needs to interact with toolbar action buttons.
 */
export async function openToolbar(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Mostrar herramientas" }).click();
}
