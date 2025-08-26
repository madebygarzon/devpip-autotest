import { test, expect } from "@playwright/test";

test("team members load with valid image, name, title and bio link", async ({ page }) => {
  // 1. Go to the About page
  await page.goto("/about/");

  // 2. Scroll to force lazy-render
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  );
  await page.waitForTimeout(2000);

  // 3. Locate cards
  const members = page.locator(".jet-listing-grid__item");
  const count = await members.count();
  expect(count).toBeGreaterThanOrEqual(8);

  for (let i = 0; i < count; i++) {
    const card = members.nth(i);

    //----------------------------------------------------------
    // IMAGE
    //----------------------------------------------------------
    const image = card.locator("img.jet-listing-dynamic-image__img");
    await expect(image).toBeVisible();
    let src = await image.getAttribute("src");

    // If it's a placeholder (data:image), wait and re-check once
    if (src?.startsWith("data:image")) {
      await page.waitForTimeout(1500);
      src = await image.getAttribute("src");
      if (src?.startsWith("data:image")) {
        throw new Error("La tarjeta tiene un placeholder en vez de una imagen real");
      }
    }

    // Should be a real remote image now
    expect(src).toMatch(/^https?:\/\//);

    // Ensure it fully loaded
    const isLoaded = await image.evaluate(
      (img: HTMLImageElement) => img.naturalWidth > 0
    );
    expect(isLoaded).toBe(true);

    //----------------------------------------------------------
    // NAME
    //----------------------------------------------------------
    const name = card.locator(".brxe-anhjux .jet-listing-dynamic-field__content");
    await expect(name).toBeVisible();
    const nameText = (await name.innerText()).trim();
    expect(nameText.length).toBeGreaterThan(0);
    expect(nameText.split(/\s+/).length).toBeGreaterThanOrEqual(2);

    //----------------------------------------------------------
    // ROLE
    //----------------------------------------------------------
    const role = card.locator(".brxe-tdatip .jet-listing-dynamic-field__content");
    await expect(role).toBeVisible();
    const roleText = (await role.innerText()).trim();
    expect(roleText.length).toBeGreaterThan(0);

    //----------------------------------------------------------
    // VIEW BIO link
    //----------------------------------------------------------
    const link = card.locator("a.jet-listing-dynamic-link__link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /^https:\/\/(www\.)?linkedin\.com/);
    await expect(link).toHaveAttribute("target", "_blank");
  }
});
