import { test, expect } from "@playwright/test";

test.describe("Error handling & Edge cases", () => {
  test("large input shows graceful size limit handling", async ({ page }) => {
    const hugeJson = `{"data":"${"x".repeat(600_000)}"}`;

    await page.addInitScript((value) => {
      window.localStorage.setItem("lastJson", value);
    }, hugeJson);

    await page.goto("/playground/json");
    await page.getByRole("button", { name: "Formatear" }).click();

    await expect(
      page.getByText("El contenido supera 500 KB. Reduce el tamano para procesarlo."),
    ).toBeVisible();
  });

  test("suspicious JS loop is handled without freezing the UI", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lastJs", "for(;;){}");
    });

    await page.goto("/playground/js");
    await page.getByRole("button", { name: /Ejecutar/i }).click({ noWaitAfter: true });
    await expect(page.getByRole("main").getByText(/5 segundos|cancelad|ejecuci[oó]n/i)).toBeVisible(
      {
        timeout: 12000,
      },
    );

    await page.getByRole("button", { name: /Open sidebar/i }).click();
    await expect(page.getByRole("link", { name: /JSON Tools/i })).toBeVisible();
  });

  test("localStorage full fallback remains functional", async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem.bind(window.localStorage);
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key === "lastJson" || key === "toolsConfig" || key === "jsToolsConfig") {
          throw new DOMException("Quota exceeded", "QuotaExceededError");
        }
        return originalSetItem(key, value);
      };
    });

    await page.goto("/playground/json");
    await page.getByRole("button", { name: "Ejemplo" }).click();
    await page.getByRole("button", { name: "Formatear" }).click();

    await expect(page.getByText("JSON formateado correctamente")).toBeVisible();
  });

  test("offline mode keeps core local tools working", async ({ page }) => {
    await page.goto("/playground/json");

    await page.getByRole("button", { name: "Ejemplo" }).click();
    await expect(page.getByText("JSON válido")).toBeVisible();

    await page.context().setOffline(true);

    await page.getByRole("button", { name: "Minificar" }).click();

    await expect(page.getByText("JSON minificado correctamente")).toBeVisible();

    await page.context().setOffline(false);
  });
});
