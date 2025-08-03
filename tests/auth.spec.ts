import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should display Sign In button when not authenticated', async ({ page }) => {
        await page.goto('/en');

        // Sign In button should be visible
        await expect(page.locator('a:has-text("Sign In")')).toBeVisible();
    });

    test('should navigate to login page when clicking Sign In', async ({ page }) => {
        await page.goto('/en');

        // Click Sign In button
        await page.click('a:has-text("Sign In")');

        // Should navigate to login page
        await expect(page).toHaveURL('/en/login');

        // Login form should be visible
        await expect(page.locator('h2:has-text("Welcome back!")')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test('should display login form in Thai', async ({ page }) => {
        await page.goto('/th/login');

        // Thai login form should be visible
        await expect(page.locator('h2:has-text("ยินดีต้อนรับกลับ!")')).toBeVisible();
        await expect(page.locator('label:has-text("อีเมล")')).toBeVisible();
        await expect(page.locator('label:has-text("รหัสผ่าน")')).toBeVisible();
        await expect(page.locator('button:has-text("เข้าสู่ระบบ")')).toBeVisible();
    });

    test('should toggle between Sign In and Sign Up forms', async ({ page }) => {
        await page.goto('/en/login');

        // Should start with Sign In form
        await expect(page.locator('h2:has-text("Welcome back!")')).toBeVisible();
        await expect(page.locator('button[type="submit"]:has-text("Sign In")')).toBeVisible();

        // Click "Don't have an account?" link
        await page.click('button:has-text("Don\'t have an account?")');

        // Should switch to Sign Up form
        await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
        await expect(page.locator('button[type="submit"]:has-text("Sign Up")')).toBeVisible();
        await expect(page.locator('label:has-text("Confirm Password")')).toBeVisible();

        // Click "Already have an account?" link
        await page.click('button:has-text("Already have an account?")');

        // Should switch back to Sign In form
        await expect(page.locator('h2:has-text("Welcome back!")')).toBeVisible();
        await expect(page.locator('button[type="submit"]:has-text("Sign In")')).toBeVisible();
    });

    test('should display OAuth buttons', async ({ page }) => {
        await page.goto('/en/login');

        // OAuth buttons should be visible
        await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible();
        await expect(page.locator('button:has-text("Sign in with GitHub")')).toBeVisible();
        await expect(page.locator('text=or')).toBeVisible();
    });

    test('should show validation error for empty form submission', async ({ page }) => {
        await page.goto('/en/login');

        // Try to submit empty form
        await page.click('button[type="submit"]:has-text("Sign In")');

        // Browser validation should prevent submission
        // Email field should be focused and show validation message
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toBeFocused();
    });

    test('should show password mismatch error in Sign Up form', async ({ page }) => {
        await page.goto('/en/login');

        // Switch to Sign Up form
        await page.click('button:has-text("Don\'t have an account?")');

        // Fill form with mismatched passwords
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.fill('input[name="confirmPassword"]', 'differentpassword');

        // Submit form
        await page.click('button[type="submit"]:has-text("Sign Up")');

        // Should show password mismatch error
        await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });
});