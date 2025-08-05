import { test, expect } from '@playwright/test';

// Test data
const testProfile = {
  fullName: 'John Doe Updated',
  bio: 'Updated biography for testing',
  website: 'https://johndoe.example.com',
  location: 'Bangkok, Thailand',
  phone: '+66123456789'
};

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you would need to authenticate first
    await page.goto('/en/profile');
  });

  test.describe('Profile Page Layout', () => {
    test('should display profile settings page', async ({ page }) => {
      // Check page title and description
      await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
      
      // Check main sections
      await expect(page.locator('text=Personal Information')).toBeVisible();
      await expect(page.locator('text=Contact Information')).toBeVisible();
      await expect(page.locator('text=Preferences')).toBeVisible();
    });

    test('should display profile form fields', async ({ page }) => {
      // Check all form fields are present
      await expect(page.locator('label:has-text("Email")')).toBeVisible();
      await expect(page.locator('label:has-text("Full Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Bio")')).toBeVisible();
      await expect(page.locator('label:has-text("Website")')).toBeVisible();
      await expect(page.locator('label:has-text("Location")')).toBeVisible();
      await expect(page.locator('label:has-text("Phone")')).toBeVisible();
      await expect(page.locator('label:has-text("Preferred Language")')).toBeVisible();
    });

    test('should show email as read-only', async ({ page }) => {
      // Email field should be disabled
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeDisabled();
      await expect(emailInput).toHaveClass(/bg-muted|disabled/);
    });

    test('should display avatar section', async ({ page }) => {
      // Check avatar section
      await expect(page.locator('text=Click to change avatar')).toBeVisible();
      
      // Avatar image or placeholder should be visible
      const avatar = page.locator('[data-testid="avatar"]');
      await expect(avatar).toBeVisible();
    });
  });

  test.describe('Profile Form Functionality', () => {
    test('should update profile with valid data', async ({ page }) => {
      // Fill form fields
      await page.fill('input[name="fullName"]', testProfile.fullName);
      await page.fill('textarea[name="bio"]', testProfile.bio);
      await page.fill('input[name="website"]', testProfile.website);
      await page.fill('input[name="location"]', testProfile.location);
      await page.fill('input[name="phone"]', testProfile.phone);
      
      // Submit form
      await page.click('button:has-text("Update Profile")');
      
      // Should show success message
      await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should validate website URL format', async ({ page }) => {
      // Enter invalid URL
      await page.fill('input[name="website"]', 'invalid-url');
      await page.click('button:has-text("Update Profile")');
      
      // Should show validation error
      const websiteInput = page.locator('input[name="website"]');
      await expect(websiteInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should validate phone number format', async ({ page }) => {
      // Enter invalid phone number
      await page.fill('input[name="phone"]', 'invalid-phone');
      await page.click('button:has-text("Update Profile")');
      
      // Should show validation error or prevent submission
      // Implementation depends on your validation strategy
    });

    test('should update language preference', async ({ page }) => {
      // Change language preference
      await page.selectOption('select[name="preferredLanguage"]', 'th');
      
      // Submit form
      await page.click('button:has-text("Update Profile")');
      
      // Should show success message
      await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 5000 });
      
      // Page should potentially reload with Thai interface
      // This depends on your implementation
    });

    test('should show loading state during update', async ({ page }) => {
      // Fill form
      await page.fill('input[name="fullName"]', testProfile.fullName);
      
      // Submit form
      await page.click('button:has-text("Update Profile")');
      
      // Should show loading state
      await expect(page.locator('button:has-text("Updating...")')).toBeVisible();
    });

    test('should handle update errors gracefully', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/profile/**', route => route.abort());
      
      // Try to update profile
      await page.fill('input[name="fullName"]', testProfile.fullName);
      await page.click('button:has-text("Update Profile")');
      
      // Should show error message
      await expect(page.locator('text=Error updating profile')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Avatar Management', () => {
    test('should show avatar upload area', async ({ page }) => {
      // Check avatar section
      await expect(page.locator('[data-testid="avatar-upload"]')).toBeVisible();
      await expect(page.locator('text=Click to change avatar')).toBeVisible();
    });

    test('should handle avatar upload', async ({ page }) => {
      // This test would require file upload functionality
      // Implementation depends on your avatar upload system
      
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Test file upload
        await fileInput.setInputFiles('tests/fixtures/test-avatar.jpg');
        
        // Should show upload progress or success
        await expect(page.locator('text=Uploading')).toBeVisible();
      }
    });
  });

  test.describe('Form Persistence', () => {
    test('should persist form data on page reload', async ({ page }) => {
      // Fill form
      await page.fill('input[name="fullName"]', testProfile.fullName);
      await page.fill('textarea[name="bio"]', testProfile.bio);
      
      // Reload page
      await page.reload();
      
      // Form should be populated with saved data
      await expect(page.locator('input[name="fullName"]')).toHaveValue(testProfile.fullName);
      await expect(page.locator('textarea[name="bio"]')).toHaveValue(testProfile.bio);
    });

    test('should show unsaved changes warning', async ({ page }) => {
      // Make changes to form
      await page.fill('input[name="fullName"]', 'Changed Name');
      
      // Try to navigate away
      await page.click('a:has-text("Dashboard")');
      
      // Should show confirmation dialog
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('unsaved changes');
        dialog.accept();
      });
    });
  });

  test.describe('Internationalization', () => {
    test('should display Thai interface', async ({ page }) => {
      await page.goto('/th/profile');
      
      // Check Thai text
      await expect(page.locator('h1:has-text("ตั้งค่าโปรไฟล์")')).toBeVisible();
      await expect(page.locator('label:has-text("อีเมล")')).toBeVisible();
      await expect(page.locator('label:has-text("ชื่อเต็ม")')).toBeVisible();
      await expect(page.locator('label:has-text("แนะนำตัว")')).toBeVisible();
      await expect(page.locator('label:has-text("เว็บไซต์")')).toBeVisible();
      await expect(page.locator('label:has-text("ที่อยู่")')).toBeVisible();
      await expect(page.locator('label:has-text("เบอร์โทรศัพท์")')).toBeVisible();
      await expect(page.locator('button:has-text("อัปเดตโปรไฟล์")')).toBeVisible();
    });

    test('should show Thai success messages', async ({ page }) => {
      await page.goto('/th/profile');
      
      // Update profile
      await page.fill('input[name="fullName"]', testProfile.fullName);
      await page.click('button:has-text("อัปเดตโปรไฟล์")');
      
      // Should show Thai success message
      await expect(page.locator('text=อัปเดตโปรไฟล์สำเร็จ')).toBeVisible({ timeout: 5000 });
    });

    test('should show Thai error messages', async ({ page }) => {
      await page.goto('/th/profile');
      
      // Simulate error
      await page.route('**/api/profile/**', route => route.abort());
      
      await page.fill('input[name="fullName"]', testProfile.fullName);
      await page.click('button:has-text("อัปเดตโปรไฟล์")');
      
      // Should show Thai error message
      await expect(page.locator('text=เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Form should be responsive
      await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
      await expect(page.locator('input[name="fullName"]')).toBeVisible();
      await expect(page.locator('button:has-text("Update Profile")')).toBeVisible();
      
      // Form fields should stack vertically
      const formContainer = page.locator('form');
      await expect(formContainer).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Should display properly on tablet
      await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
      await expect(page.locator('[data-testid="avatar"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      // All form inputs should have associated labels
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        if (id) {
          await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
        }
      }
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      // Form should have proper ARIA attributes
      const form = page.locator('form');
      await expect(form).toHaveAttribute('role', 'form');
      
      // Required fields should be marked
      const requiredInputs = page.locator('input[required]');
      const requiredCount = await requiredInputs.count();
      
      for (let i = 0; i < requiredCount; i++) {
        await expect(requiredInputs.nth(i)).toHaveAttribute('aria-required', 'true');
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Should be able to navigate form with keyboard
      await page.keyboard.press('Tab');
      
      // First focusable element should be focused
      const firstInput = page.locator('input:not([disabled])').first();
      await expect(firstInput).toBeFocused();
      
      // Should be able to tab through all form elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Submit button should eventually be reachable
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const submitButton = page.locator('button:has-text("Update Profile")');
      await expect(submitButton).toBeFocused();
    });
  });
});