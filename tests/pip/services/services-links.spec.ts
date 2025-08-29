import { test, expect } from "@playwright/test";

test("Service page links load successfully", async ({ page, context }) => {
  await page.goto("/services/");

  const links = await page.$$eval("a", (elements) =>
    Array.from(new Set(
      elements
        .map((el) => el.getAttribute("href"))
        .filter(
          (href): href is string =>
            typeof href === "string" &&
            href.startsWith("https://partnerinpublishing.com/services/") &&
            href !== "https://partnerinpublishing.com/services/"
        )
    ))
  );

  for (const href of links) {
    const newPage = await context.newPage();
    const response = await newPage.goto(href, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    expect(response?.status(), `${href} returned an unexpected status`).toBeLessThan(400);
    await expect(newPage.locator("body")).toBeVisible();
    await newPage.close();
  }
});
