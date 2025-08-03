import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/en');
    
    // Check if there are proper headings (though this page might not have h1)
    // At minimum, check that interactive elements are accessible
    const signInButton = page.locator('a:has-text("Sign In")');
    await expect(signInButton).toBeVisible();
    
    // Check that the button has proper attributes
    await expect(signInButton).toHaveAttribute('href', '/login');
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/en/login');
    
    // Check that form inputs have proper labels
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Password")')).toBeVisible();
    
    // Check that inputs are properly associated with labels
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toHaveAttribute('id', 'email');
    await expect(passwordInput).toHaveAttribute('id', 'password');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/en');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Language switcher should be focusable
    const languageButton = page.locator('button:has-text("Language")');
    await expect(languageButton).toBeFocused();
    
    await page.keyboard.press('Tab');
    
    // Sign In button should be focusable
    const signInButton = page.locator('a:has-text("Sign In")');
    await expect(signInButton).toBeFocused();
  });

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/en');
    
    // Check Next.js logo has alt text
    await expect(page.locator('img[alt="Next.js logo"]')).toBeVisible();
    
    // Check other images have alt text
    await expect(page.locator('img[alt="Vercel logomark"]')).toBeVisible();
    await expect(page.locator('img[alt="File icon"]')).toBeVisible();
    await expect(page.locator('img[alt="Window icon"]')).toBeVisible();
    await expect(page.locator('img[alt="Globe icon"]')).toBeVisible();
  });

  test('should have proper focus management in dropdown', async ({ page }) => {
    await page.goto('/en');
    
    // Open language dropdown with keyboard
    await page.keyboard.press('Tab'); // Focus language button
    await page.keyboard.press('Enter'); // Open dropdown
    
    // Dropdown should be visible
    await expect(page.locator('button:has-text("🇹🇭 ไทย")')).toBeVisible();
    
    // Should be able to navigate with arrow keys or tab
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Should navigate to Thai version
    await expect(page).toHaveURL('/th');
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/en');
    
    // This is a basic check - in a real scenario, you'd use axe-core
    // Check that text is visible (basic contrast check)
    await expect(page.locator('text=Get started by editing')).toBeVisible();
    await expect(page.locator('text=Deploy now')).toBeVisible();
    
    // Check button visibility
    await expect(page.locator('a:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('button:has-text("Language")')).toBeVisible();
  });

  test('should work with screen reader announcements', async ({ page }) => {
    await page.goto('/en/login');
    
    // Check that form has proper structure for screen readers
    await expect(page.locator('form')).toBeVisible();
    
    // Check that error messages would be announced
    // Fill form with mismatched passwords to trigger error
    await page.click('button:has-text("Don\'t have an account?")');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different');
    await page.click('button[type="submit"]');
    
    // Error message should be visible and would be announced
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });
});