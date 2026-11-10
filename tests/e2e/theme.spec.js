import { test, expect } from "@playwright/test";

test.describe("Pro CV Lite - Theme & Appearance Persistence", () => {
  test("Default theme initializes correctly on root element", async ({ page }) => {
    await page.goto("/");

    // By default, ThemeContext or index.html flash prevention sets data-theme attribute
    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveAttribute("data-theme", /dark|light/);
  });

  test("Respects light mode preference stored in localStorage", async ({ page }) => {
    // Pre-populate localStorage with light mode
    await page.addInitScript(() => {
      window.localStorage.setItem("procv_theme_preference", "light");
    });

    await page.goto("/");

    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveAttribute("data-theme", "light");
    await expect(htmlElement).toHaveClass(/light/);
  });

  test("Respects dark mode preference stored in localStorage", async ({ page }) => {
    // Pre-populate localStorage with dark mode
    await page.addInitScript(() => {
      window.localStorage.setItem("procv_theme_preference", "dark");
    });

    await page.goto("/");

    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveAttribute("data-theme", "dark");
    await expect(htmlElement).toHaveClass(/dark/);
  });
});

