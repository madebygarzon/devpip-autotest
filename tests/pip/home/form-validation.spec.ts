import { test, expect } from "@playwright/test";

const BASE_URL = "/";

test("Contact form prevents submission when required fields are empty", async ({ page }) => {
  await page.goto(BASE_URL);

  // Wait for the contact form to be visible
  await expect(page.locator("#wpforms-form-22096")).toBeVisible();

  // Attempt to submit the form without filling any fields
  await page.click("#wpforms-submit-22096");

  // The form should be invalid due to HTML5 required attributes
  const isValid = await page.$eval(
    "#wpforms-form-22096",
    (form) => (form as HTMLFormElement).checkValidity()
  );
  expect(isValid).toBeFalsy();
});
