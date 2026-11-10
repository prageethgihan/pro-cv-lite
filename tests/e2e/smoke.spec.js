import { test, expect } from "@playwright/test";

test.describe("Pro CV Lite - Smoke & Authentication Tests", () => {
  test("Landing and Login page loads with all essential elements", async ({ page }) => {
    await page.goto("/");

    // Verify Title or Brand
    await expect(page).toHaveTitle(/ProCV Lite|Pro CV/i);

    // Wait for splash screen to clear and login view to render
    const welcomeHeader = page.getByRole("heading", { name: /Welcome back/i });
    await expect(welcomeHeader).toBeVisible({ timeout: 10000 });

    // Verify input fields
    const emailInput = page.locator("#login-email");
    const passwordInput = page.locator("#login-password");
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify Log In button and Google Auth button
    const loginBtn = page.getByRole("button", { name: /Log In/i, exact: true });
    await expect(loginBtn).toBeVisible();

    const googleBtn = page.getByRole("button", { name: /Continue with Google/i });
    await expect(googleBtn).toBeVisible();
  });

  test("User can switch between Login and Register views", async ({ page }) => {
    await page.goto("/");

    // Wait for the login screen
    const registerSwitchBtn = page.getByRole("button", { name: /Register/i });
    await expect(registerSwitchBtn).toBeVisible({ timeout: 10000 });

    // Click Register to switch view
    await registerSwitchBtn.click();

    // Verify Register form headers and fields
    const createAccountHeader = page.getByRole("heading", { name: /Create Account/i });
    await expect(createAccountHeader).toBeVisible();

    const fullNameInput = page.locator("#reg-name");
    await expect(fullNameInput).toBeVisible();

    // Switch back to Login
    const signInSwitchBtn = page.getByRole("button", { name: /^Log in$/i });
    await expect(signInSwitchBtn).toBeVisible();
    await signInSwitchBtn.click();

    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  });

  test("Protected route (/dashboard) redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");

    // Because user is not authenticated, ProtectedRoute should redirect or stay on login
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 10000 });
    expect(page.url()).not.toContain("/dashboard");
  });
});
