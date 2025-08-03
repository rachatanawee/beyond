import { test, expect } from '@playwright/test';

test.describe('Language Switcher', () => {
  test('should display language switcher button', async ({ page }) => {
    await page.goto('/en');
    
    // Language switcher should be visible
    await expect(page.locator('button:has-text("Language")')).toBeVisible();
  });

  test('should switch from English to Thai', async ({ page }) => {
    await page.goto('/en');
    
    // Click language switcher
    await page.click('button:has-text("Language")');
    
    // Should show dropdown with Thai option
    await expect(page.locator('button:has-text("🇹🇭 ไทย")')).toBeVisible();
    
    // Click Thai option
    await page.click('button:has-text("🇹🇭 ไทย")');
    
    // Should redirect to Thai version
    await expect(page).toHaveURL('/th');
    
    // Content should be in Thai
    await expect(page.locator('text=เริ่มต้นโดยการแก้ไข')).toBeVisible();
    
    // Language button should now show "ภาษา"
    await expect(page.locator('button:has-text("ภาษา")')).toBeVisible();
  });

  test('should switch from Thai to English', async ({ page }) => {
    await page.goto('/th');
    
    // Click language switcher
    await page.click('button:has-text("ภาษา")');
    
    // Should show dropdown with English option
    await expect(page.locator('button:has-text("🇺🇸 English")')).toBeVisible();
    
    // Click English option
    await page.click('button:has-text("🇺🇸 English")');
    
    // Should redirect to English version
    await expect(page).toHaveURL('/en');
    
    // Content should be in English
    await expect(page.locator('text=Get started by editing')).toBeVisible();
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    await page.goto('/en');
    
    // Click language switcher to open dropdown
    await page.click('button:has-text("Language")');
    
    // Dropdown should be visible
    await expect(page.locator('button:has-text("🇹🇭 ไทย")')).toBeVisible();
    
    // Click outside the dropdown
    await page.click('body');
    
    // Dropdown should be hidden
    await expect(page.locator('button:has-text("🇹🇭 ไทย")')).not.toBeVisible();
  });
});