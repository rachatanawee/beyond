import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should redirect root path to default locale', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to /en (default locale)
    await expect(page).toHaveURL('/en');
  });

  test('should maintain locale when navigating', async ({ page }) => {
    await page.goto('/th');
    
    // Navigate to login page
    await page.click('a:has-text("เข้าสู่ระบบ")');
    
    // Should maintain Thai locale
    await expect(page).toHaveURL('/th/login');
    
    // Content should be in Thai
    await expect(page.locator('h2:has-text("ยินดีต้อนรับกลับ!")')).toBeVisible();
  });

  test('should handle invalid locale gracefully', async ({ page }) => {
    // Try to navigate to invalid locale
    const response = await page.goto('/invalid-locale');
    
    // Should return 404 or redirect to valid locale
    expect(response?.status()).toBe(404);
  });

  test('should preserve query parameters when switching languages', async ({ page }) => {
    await page.goto('/en?test=123');
    
    // Switch to Thai
    await page.click('button:has-text("Language")');
    await page.click('button:has-text("🇹🇭 ไทย")');
    
    // Should preserve query parameters
    await expect(page).toHaveURL('/th?test=123');
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Start at English homepage
    await page.goto('/en');
    await expect(page.locator('text=Get started by editing')).toBeVisible();
    
    // Navigate to Thai
    await page.click('button:has-text("Language")');
    await page.click('button:has-text("🇹🇭 ไทย")');
    await expect(page).toHaveURL('/th');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/en');
    await expect(page.locator('text=Get started by editing')).toBeVisible();
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/th');
    await expect(page.locator('text=เริ่มต้นโดยการแก้ไข')).toBeVisible();
  });

  test('should handle direct URL access to localized pages', async ({ page }) => {
    // Direct access to Thai login page
    await page.goto('/th/login');
    
    // Should display Thai content
    await expect(page.locator('h2:has-text("ยินดีต้อนรับกลับ!")')).toBeVisible();
    await expect(page.locator('button:has-text("เข้าสู่ระบบ")')).toBeVisible();
    
    // Language switcher should show Thai as selected
    await expect(page.locator('button:has-text("ภาษา")')).toBeVisible();
  });
});