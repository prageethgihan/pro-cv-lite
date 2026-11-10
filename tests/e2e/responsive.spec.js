import { test, expect } from "@playwright/test";

test.describe("Pro CV Lite - Responsive & Mobile Layout Tests", () => {
  test("Mobile Viewport (iPhone 13 - 390x844): Auth view renders cleanly", async ({ page }) => {
    // Set viewport to mobile phone
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    // Verify main welcome title or brand is rendered
    const welcomeHeader = page.getByRole("heading", { name: /Welcome back/i });
    await expect(welcomeHeader).toBeVisible({ timeout: 10000 });

    // Ensure form inputs fit and are interactive on mobile
    const emailInput = page.locator("#login-email");
    const passwordInput = page.locator("#login-password");
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill("mobile.user@test.com");
    await expect(emailInput).toHaveValue("mobile.user@test.com");

    // Check register switch button on mobile
    const registerBtn = page.getByRole("button", { name: /Register/i });
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();

    // Verify full name field on register view
    await expect(page.locator("#reg-name")).toBeVisible();
  });

  test("Tablet Viewport (iPad - 768x1024): Layout preserves structure", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // Check that login header and inputs exist and are aligned
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
  });
});

