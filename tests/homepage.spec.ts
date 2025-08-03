import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display homepage in English by default', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to /en
    await expect(page).toHaveURL('/en');
    
    // Check if Next.js logo is visible
    await expect(page.locator('img[alt="Next.js logo"]')).toBeVisible();
    
    // Check English content
    await expect(page.locator('text=Get started by editing')).toBeVisible();
    await expect(page.locator('text=Save and see your changes instantly')).toBeVisible();
    await expect(page.locator('text=Deploy now')).toBeVisible();
    await expect(page.locator('text=Read our docs')).toBeVisible();
  });

  test('should display homepage in Thai when navigating to /th', async ({ page }) => {
    await page.goto('/th');
    
    // Check Thai content
    await expect(page.locator('text=เริ่มต้นโดยการแก้ไข')).toBeVisible();
    await expect(page.locator('text=บันทึกและดูการเปลี่ยนแปลงทันที')).toBeVisible();
    await expect(page.locator('text=เผยแพร่ตอนนี้')).toBeVisible();
    await expect(page.locator('text=อ่านเอกสาร')).toBeVisible();
  });

  test('should have working footer links', async ({ page }) => {
    await page.goto('/en');
    
    // Check footer links are present
    await expect(page.locator('text=Learn')).toBeVisible();
    await expect(page.locator('text=Examples')).toBeVisible();
    await expect(page.locator('text=Go to nextjs.org →')).toBeVisible();
  });
});