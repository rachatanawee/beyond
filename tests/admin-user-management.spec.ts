import { test, expect } from '@playwright/test';

// Test data
const testAdmin = {
  email: 'admin@test.com',
  password: 'admin123',
  fullName: 'Test Admin'
};

const testUser = {
  email: 'testuser@example.com',
  password: 'user123',
  fullName: 'Test User',
  bio: 'Test user biography',
  website: 'https://example.com',
  location: 'Bangkok, Thailand',
  phone: '+66123456789'
};

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you would need to set up test data
    // and authenticate as an admin user before each test
    await page.goto('/en/admin/users');
  });

  test.describe('User List and Navigation', () => {
    test('should display user management page', async ({ page }) => {
      // Check page title and description
      await expect(page.locator('h1:has-text("User Maintenance")')).toBeVisible();
      await expect(page.locator('text=Manage user accounts, roles, and permissions')).toBeVisible();
      
      // Check main sections
      await expect(page.locator('text=Filters')).toBeVisible();
      await expect(page.locator('text=Search Users')).toBeVisible();
      await expect(page.locator('text=Users (')).toBeVisible();
    });

    test('should display user list with proper columns', async ({ page }) => {
      // Wait for users to load
      await page.waitForSelector('[data-testid="user-list"]', { timeout: 10000 });
      
      // Check if user cards are displayed
      const userCards = page.locator('[data-testid="user-card"]');
      await expect(userCards.first()).toBeVisible();
      
      // Check user card content structure
      await expect(userCards.first().locator('text=@')).toBeVisible(); // Email
      await expect(userCards.first().locator('text=Joined')).toBeVisible(); // Join date
      await expect(userCards.first().locator('text=Logins:')).toBeVisible(); // Login count
    });

    test('should have working search functionality', async ({ page }) => {
      // Wait for page to load
      await page.waitForSelector('input[placeholder*="Search"]');
      
      // Search for a user
      await page.fill('input[placeholder*="Search"]', 'test');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Results should be filtered
      const userCards = page.locator('[data-testid="user-card"]');
      const count = await userCards.count();
      
      // Should have some results or show "No users found"
      if (count === 0) {
        await expect(page.locator('text=No users found')).toBeVisible();
      } else {
        await expect(userCards.first()).toBeVisible();
      }
    });

    test('should have working filter functionality', async ({ page }) => {
      // Test status filter
      await page.click('select[data-testid="status-filter"]');
      await page.selectOption('select[data-testid="status-filter"]', 'active');
      
      // Test role filter
      await page.click('select[data-testid="role-filter"]');
      await page.selectOption('select[data-testid="role-filter"]', 'user');
      
      // Results should be filtered
      await page.waitForTimeout(1000);
      const resultsText = page.locator('text=users found');
      await expect(resultsText).toBeVisible();
    });
  });

  test.describe('Create User', () => {
    test('should open create user dialog', async ({ page }) => {
      // Click Create User button
      await page.click('button:has-text("Create User")');
      
      // Dialog should open
      await expect(page.locator('h2:has-text("Create New User")')).toBeVisible();
      await expect(page.locator('text=Enter the details for the new user')).toBeVisible();
      
      // Form fields should be visible
      await expect(page.locator('label:has-text("Email")')).toBeVisible();
      await expect(page.locator('label:has-text("Password")')).toBeVisible();
      await expect(page.locator('label:has-text("Full Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Role")')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Open create dialog
      await page.click('button:has-text("Create User")');
      
      // Try to submit empty form
      await page.click('button:has-text("Create User")');
      
      // Should show validation error
      await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
    });

    test('should create user with valid data', async ({ page }) => {
      // Open create dialog
      await page.click('button:has-text("Create User")');
      
      // Fill form
      await page.fill('input[id="new-email"]', testUser.email);
      await page.fill('input[id="new-password"]', testUser.password);
      await page.fill('input[id="new-fullname"]', testUser.fullName);
      await page.selectOption('select[id="new-role"]', 'user');
      
      // Submit form
      await page.click('button:has-text("Create User")');
      
      // Should show success message or close dialog
      await expect(page.locator('h2:has-text("Create New User")')).not.toBeVisible({ timeout: 10000 });
      
      // Should show success message
      await expect(page.locator('text=User created successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should handle duplicate email error', async ({ page }) => {
      // Open create dialog
      await page.click('button:has-text("Create User")');
      
      // Fill form with existing email
      await page.fill('input[id="new-email"]', 'existing@example.com');
      await page.fill('input[id="new-password"]', testUser.password);
      await page.fill('input[id="new-fullname"]', testUser.fullName);
      
      // Submit form
      await page.click('button:has-text("Create User")');
      
      // Should show error in dialog
      await expect(page.locator('text=already in use')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Edit User', () => {
    test('should open edit user dialog', async ({ page }) => {
      // Wait for user list to load
      await page.waitForSelector('[data-testid="user-card"]');
      
      // Click edit button on first user
      await page.click('[data-testid="user-card"] button[aria-label="Edit user"]');
      
      // Dialog should open
      await expect(page.locator('h2:has-text("Edit User Profile")')).toBeVisible();
      await expect(page.locator('text=Update user information and settings')).toBeVisible();
      
      // Form fields should be visible and pre-filled
      await expect(page.locator('input[id="edit-fullname"]')).toBeVisible();
      await expect(page.locator('input[id="edit-email"]')).toBeVisible();
      await expect(page.locator('input[id="edit-email"]')).toBeDisabled(); // Email should be read-only
    });

    test('should update user profile', async ({ page }) => {
      // Wait for user list and click edit
      await page.waitForSelector('[data-testid="user-card"]');
      await page.click('[data-testid="user-card"] button[aria-label="Edit user"]');
      
      // Update form fields
      await page.fill('input[id="edit-fullname"]', 'Updated Name');
      await page.fill('input[id="edit-phone"]', testUser.phone);
      await page.fill('input[id="edit-location"]', testUser.location);
      await page.fill('input[id="edit-website"]', testUser.website);
      await page.fill('textarea[id="edit-bio"]', testUser.bio);
      
      // Submit form
      await page.click('button:has-text("Update User")');
      
      // Should close dialog and show success
      await expect(page.locator('h2:has-text("Edit User Profile")')).not.toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=User updated successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should update user role and status', async ({ page }) => {
      // Wait for user list and click edit
      await page.waitForSelector('[data-testid="user-card"]');
      await page.click('[data-testid="user-card"] button[aria-label="Edit user"]');
      
      // Change role and status
      await page.selectOption('select[id="edit-role"]', 'moderator');
      await page.selectOption('select[id="edit-status"]', 'suspended');
      await page.selectOption('select[id="edit-language"]', 'th');
      
      // Submit form
      await page.click('button:has-text("Update User")');
      
      // Should show success
      await expect(page.locator('text=User updated successfully')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('User Actions', () => {
    test('should suspend user', async ({ page }) => {
      // Wait for user list
      await page.waitForSelector('[data-testid="user-card"]');
      
      // Click suspend button
      await page.click('[data-testid="user-card"] button[aria-label="Suspend user"]');
      
      // Suspend dialog should open
      await expect(page.locator('h2:has-text("Suspend User")')).toBeVisible();
      
      // Fill suspend form
      await page.fill('input[type="date"]', '2024-12-31');
      await page.fill('textarea', 'Test suspension reason');
      
      // Submit
      await page.click('button:has-text("Suspend User")');
      
      // Should show success
      await expect(page.locator('text=User suspended successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should delete user with confirmation', async ({ page }) => {
      // Wait for user list
      await page.waitForSelector('[data-testid="user-card"]');
      
      // Click delete button
      await page.click('[data-testid="user-card"] button[aria-label="Delete user"]');
      
      // Delete confirmation dialog should open
      await expect(page.locator('h2:has-text("Delete User")')).toBeVisible();
      await expect(page.locator('text=Are you sure you want to permanently delete')).toBeVisible();
      
      // Confirm deletion
      await page.click('button:has-text("Delete User")');
      
      // Should show success or handle the deletion
      // Note: In real tests, you might want to verify the user is removed from the list
    });

    test('should change user role via dropdown', async ({ page }) => {
      // Wait for user list
      await page.waitForSelector('[data-testid="user-card"]');
      
      // Find role dropdown and change it
      const roleSelect = page.locator('[data-testid="user-card"] select').first();
      await roleSelect.selectOption('admin');
      
      // Should show success message
      await expect(page.locator('text=User role updated successfully')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Export Functionality', () => {
    test('should export users as CSV', async ({ page }) => {
      // Click export CSV button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export CSV")');
      
      // Should trigger download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should export users as JSON', async ({ page }) => {
      // Click export JSON button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export JSON")');
      
      // Should trigger download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.json');
    });
  });

  test.describe('Internationalization', () => {
    test('should display Thai interface', async ({ page }) => {
      await page.goto('/th/admin/users');
      
      // Check Thai text
      await expect(page.locator('text=จัดการผู้ใช้')).toBeVisible();
      await expect(page.locator('text=ค้นหาผู้ใช้')).toBeVisible();
      await expect(page.locator('text=สร้างผู้ใช้')).toBeVisible();
    });

    test('should show Thai error messages', async ({ page }) => {
      await page.goto('/th/admin/users');
      
      // Open create dialog
      await page.click('button:has-text("สร้างผู้ใช้")');
      
      // Try to submit empty form
      await page.click('button:has-text("สร้างผู้ใช้")');
      
      // Should show Thai error message
      await expect(page.locator('text=กรุณากรอก')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/en/admin/users');
      
      // Should still display main elements
      await expect(page.locator('h1:has-text("User Maintenance")')).toBeVisible();
      await expect(page.locator('button:has-text("Create User")')).toBeVisible();
      
      // User cards should be responsive
      await page.waitForSelector('[data-testid="user-card"]');
      await expect(page.locator('[data-testid="user-card"]').first()).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/en/admin/users');
      
      // Should display properly
      await expect(page.locator('h1:has-text("User Maintenance")')).toBeVisible();
      await expect(page.locator('text=Filters')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/admin/**', route => route.abort());
      
      await page.goto('/en/admin/users');
      
      // Should show error state or loading state
      // Note: Specific error handling depends on implementation
    });

    test('should handle unauthorized access', async ({ page }) => {
      // Test accessing admin page without proper permissions
      // This would require setting up a non-admin user session
      
      // Should redirect or show access denied
      // Implementation depends on your auth flow
    });
  });
});

// Helper functions for test setup
test.describe('Test Utilities', () => {
  test.skip('Setup test data', async ({ page }) => {
    // This would be used to set up test data before running tests
    // Create test admin user, test regular users, etc.
  });

  test.skip('Cleanup test data', async ({ page }) => {
    // This would be used to clean up test data after running tests
    // Remove test users, reset database state, etc.
  });
});