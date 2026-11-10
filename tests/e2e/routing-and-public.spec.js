import { test, expect } from "@playwright/test";

test.describe("Pro CV Lite - Routing & Security Guards", () => {
  const protectedRoutes = [
    "/dashboard",
    "/builder",
    "/templates",
    "/my-cvs",
    "/settings",
    "/ai-writer",
    "/ats-analyzer",
    "/insights",
  ];

  for (const route of protectedRoutes) {
    test(`Unauthenticated access to "${route}" safely redirects to login`, async ({ page }) => {
      await page.goto(route);

      // Should be redirected away from protected route to login
      await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 10000 });
      expect(page.url()).not.toContain(route);
    });
  }

  test("Public CV route gracefully handles non-existent CV", async ({ page }) => {
    // Navigate to a non-existent public CV
    await page.goto("/cv/test-non-existent-id-12345");

    // Expect graceful error view or missing data state without React unhandled crash
    const backBtn = page.getByRole("link", { name: /Back to Home/i });
    await expect(backBtn).toBeVisible({ timeout: 15000 });

    // Click back to home
    await backBtn.click();
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 10000 });
  });
});

