import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should display correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en');
    
    // Check if elements are visible and properly arranged
    await expect(page.locator('img[alt="Next.js logo"]')).toBeVisible();
    await expect(page.locator('text=Get started by editing')).toBeVisible();
    
    // Language switcher should be visible on mobile
    await expect(page.locator('button:has-text("Language")')).toBeVisible();
    
    // Sign In button should be visible on mobile
    await expect(page.locator('a:has-text("Sign In")')).toBeVisible();
  });

  test('should display correctly on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/en');
    
    // Check if elements are visible
    await expect(page.locator('img[alt="Next.js logo"]')).toBeVisible();
    await expect(page.locator('text=Deploy now')).toBeVisible();
    await expect(page.locator('text=Read our docs')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en');
    
    // Check if all elements are visible
    await expect(page.locator('img[alt="Next.js logo"]')).toBeVisible();
    await expect(page.locator('text=Deploy now')).toBeVisible();
    await expect(page.locator('text=Read our docs')).toBeVisible();
    
    // Footer links should be visible
    await expect(page.locator('text=Learn')).toBeVisible();
    await expect(page.locator('text=Examples')).toBeVisible();
  });

  test('login form should be responsive', async ({ page }) => {
    // Test mobile login form
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/login');
    
    // Form should be visible and usable on mobile
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // OAuth buttons should stack properly on mobile
    await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in with GitHub")')).toBeVisible();
  });
});