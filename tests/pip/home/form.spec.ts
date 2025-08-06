import { test, expect } from "@playwright/test";

const BASE_URL = "/";

test("Submit contact form successfully and validate success message", async ({ page }) => {
  await page.goto(BASE_URL);

  // Wait for the contact form to be visible
  await expect(page.locator("#wpforms-form-22096")).toBeVisible();

  // Fill the form fields
  await page.fill("#wpforms-22096-field_5", "Test");
  await page.fill("#wpforms-22096-field_6", "User");
  await page.fill("#wpforms-22096-field_7", "123456789");
  await page.fill("#wpforms-22096-field_9", "test@gmail.com");
  await page.selectOption("#wpforms-22096-field_12", { label: "Brand Awareness" });
  await page.fill("#wpforms-22096-field_13", "Test message from Playwright");

  // Check the terms checkbox if it exists
  const checkbox = page.locator("#wpforms-22096-field_14_1");
  if (await checkbox.count()) {
    await checkbox.check();
  }

  // Submit the form
  await page.click("#wpforms-submit-22096");

  // Wait for the confirmation message to appear
  const confirmationMessage = page.locator(
    "#wpforms-confirmation-22096 p"
  );
  await expect(confirmationMessage).toBeVisible({ timeout: 10000 });

  // Get the text of the confirmation message
  const messageText = await confirmationMessage.textContent();

  // Expected message
  const expectedMessage =
    "Thanks for contacting us! We will be in touch with you shortly.";

  // Validate the message exactly
  expect(messageText?.trim()).toBe(expectedMessage);
});
