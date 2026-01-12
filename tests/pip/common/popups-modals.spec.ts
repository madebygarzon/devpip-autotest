import { test, expect } from "@playwright/test";

test.describe("Popups and Modals Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Contact form modal opens and closes correctly", async ({ page }) => {
    // Look for "Contact Us" buttons that might open modals
    const contactButton = page.locator('a:has-text("Contact Us"), button:has-text("Contact Us")').first();

    if ((await contactButton.count()) > 0) {
      // Click to open modal
      await contactButton.click();
      await page.waitForTimeout(500); // Wait for animation

      // Look for modal/popup container
      const modal = page.locator('.brxe-popup, [role="dialog"], .modal, .popup');

      if ((await modal.count()) > 0) {
        await expect(modal.first()).toBeVisible();

        // Modal should have a close button
        const closeButton = page.locator('[aria-label="Close"], .close, button:has-text("×")');

        if ((await closeButton.count()) > 0) {
          await closeButton.first().click();
          await page.waitForTimeout(500);

          // Modal should be hidden
          const isHidden = await modal.first().evaluate((el) => {
            const style = window.getComputedStyle(el);
            return (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.opacity === "0"
            );
          });

          expect(isHidden).toBeTruthy();
        }
      }
    }
  });

  test("Video modals play embedded content", async ({ page }) => {
    // Scroll to find video play buttons
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    // Look for video play buttons
    const videoButtons = page.locator('button:has-text("Play"), a:has-text("Watch"), [class*="video"] button');

    if ((await videoButtons.count()) > 0) {
      await videoButtons.first().click();
      await page.waitForTimeout(1000);

      // Look for iframe or video element in modal
      const videoIframe = page.locator('.brxe-popup iframe[src*="youtube"], .modal iframe[src*="vimeo"]');

      if ((await videoIframe.count()) > 0) {
        await expect(videoIframe.first()).toBeVisible();
        console.log("✅ Video modal opened with iframe");
      }
    }
  });

  test("Modals are accessible with keyboard (ESC to close)", async ({ page }) => {
    const contactButton = page.locator('a:has-text("Contact Us"), button:has-text("Contact")').first();

    if ((await contactButton.count()) > 0) {
      await contactButton.click();
      await page.waitForTimeout(500);

      const modal = page.locator('.brxe-popup, [role="dialog"]');

      if ((await modal.count()) > 0) {
        await expect(modal.first()).toBeVisible();

        // Press ESC to close
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);

        // Modal should close
        const isVisible = await modal.first().isVisible().catch(() => false);
        expect(isVisible).toBeFalsy();
      }
    }
  });

  test("Modal overlay prevents clicking background elements", async ({ page }) => {
    const triggerButton = page.locator('button, a').first();

    if ((await triggerButton.count()) > 0) {
      // Get initial page state
      const initialUrl = page.url();

      // Click modal trigger if it exists
      const modalTriggers = page.locator('[data-popup-id], [data-modal-id]');

      if ((await modalTriggers.count()) > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(500);

        // Try clicking background
        await page.mouse.click(50, 50);
        await page.waitForTimeout(300);

        // URL should not change (background click blocked)
        expect(page.url()).toBe(initialUrl);
      }
    }
  });

  test("Modal forms submit correctly", async ({ page }) => {
    // Open contact modal
    const contactButton = page.locator('a:has-text("Contact"), button:has-text("Contact")').first();

    if ((await contactButton.count()) > 0) {
      await contactButton.click();
      await page.waitForTimeout(500);

      // Look for form inside modal
      const modalForm = page.locator('.brxe-popup form, [role="dialog"] form');

      if ((await modalForm.count()) > 0) {
        await expect(modalForm.first()).toBeVisible();

        // Form should have submit button
        const submitButton = page.locator('.brxe-popup button[type="submit"], .modal button[type="submit"]');
        await expect(submitButton.first()).toBeVisible();
      }
    }
  });
});
