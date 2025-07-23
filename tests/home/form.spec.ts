import { test, expect } from "@playwright/test";
import fs from "fs";

const BASE_URL = "/";

test("Submit contact form successfully", async ({ page }) => {
  await page.goto(BASE_URL);

  await expect(page.locator("#wpforms-form-22096")).toBeVisible();

  await page.fill("#wpforms-22096-field_5", "Test");
  await page.fill("#wpforms-22096-field_6", "User");
  await page.fill("#wpforms-22096-field_7", "123456789");
  await page.fill("#wpforms-22096-field_9", "test@gmail.com");
  await page.selectOption("#wpforms-22096-field_12", { label: "Brand Awareness" });
  await page.fill("#wpforms-22096-field_13", "Mensaje de prueba desde Playwright");

  const checkbox = page.locator("#wpforms-22096-field_14_1");
  if (await checkbox.count()) {
    await checkbox.check();
  }

  // Enviar formulario
  await page.click("#wpforms-submit-22096");

  // Espera un poco a que algo cambie (aunque no aparezca el mensaje)
  await page.waitForTimeout(8000);

  // Toma un screenshot
  await page.screenshot({ path: "form-debug.png", fullPage: true });

  // Guarda el HTML actual de la página
  const content = await page.content();
  fs.writeFileSync("form-debug.html", content);

  // Forzamos el fallo para inspección
  expect(false).toBe(true);
});
