import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for common operations
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Login as admin user (mock implementation)
   */
  async loginAsAdmin() {
    // This would be implemented based on your auth system
    // For now, we'll assume the user is already authenticated
    await this.page.goto('/en/admin');
    
    // Wait for admin page to load
    await this.waitForPageLoad();
    
    // Verify admin access
    await expect(this.page.locator('h1:has-text("Admin Dashboard")')).toBeVisible({ timeout: 10000 });
  }

  /**
   * Login as regular user (mock implementation)
   */
  async loginAsUser() {
    await this.page.goto('/en/dashboard');
    await this.waitForPageLoad();
    await expect(this.page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    const inputs = this.page.locator('input:not([type="hidden"]):not([disabled])');
    const textareas = this.page.locator('textarea:not([disabled])');
    
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      await inputs.nth(i).clear();
    }
    
    const textareaCount = await textareas.count();
    for (let i = 0; i < textareaCount; i++) {
      await textareas.nth(i).clear();
    }
  }

  /**
   * Fill user creation form
   */
  async fillCreateUserForm(userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) {
    await this.page.fill('input[id="new-email"]', userData.email);
    await this.page.fill('input[id="new-password"]', userData.password);
    await this.page.fill('input[id="new-fullname"]', userData.fullName);
    
    if (userData.role) {
      await this.page.selectOption('select[id="new-role"]', userData.role);
    }
  }

  /**
   * Fill profile form
   */
  async fillProfileForm(profileData: {
    fullName?: string;
    bio?: string;
    website?: string;
    location?: string;
    phone?: string;
  }) {
    if (profileData.fullName) {
      await this.page.fill('input[name="fullName"]', profileData.fullName);
    }
    if (profileData.bio) {
      await this.page.fill('textarea[name="bio"]', profileData.bio);
    }
    if (profileData.website) {
      await this.page.fill('input[name="website"]', profileData.website);
    }
    if (profileData.location) {
      await this.page.fill('input[name="location"]', profileData.location);
    }
    if (profileData.phone) {
      await this.page.fill('input[name="phone"]', profileData.phone);
    }
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage(message?: string) {
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible({ timeout: 10000 });
    } else {
      await expect(this.page.locator('text=successfully')).toBeVisible({ timeout: 10000 });
    }
  }

  /**
   * Wait for error message
   */
  async waitForErrorMessage(message?: string) {
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible({ timeout: 10000 });
    } else {
      await expect(this.page.locator('[role="alert"], .alert-destructive')).toBeVisible({ timeout: 10000 });
    }
  }

  /**
   * Check if element is visible with retry
   */
  async isVisibleWithRetry(selector: string, maxRetries = 3): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        return await this.page.locator(selector).isVisible();
      } catch {
        if (i === maxRetries - 1) return false;
        await this.page.waitForTimeout(1000);
      }
    }
    return false;
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Simulate network error
   */
  async simulateNetworkError(urlPattern: string) {
    await this.page.route(urlPattern, route => route.abort());
  }

  /**
   * Mock API response
   */
  async mockApiResponse(urlPattern: string, response: any) {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Check accessibility violations
   */
  async checkAccessibility() {
    // This would integrate with axe-core or similar tool
    // For now, we'll do basic checks
    
    // Check for missing alt text
    const images = this.page.locator('img:not([alt])');
    const imageCount = await images.count();
    if (imageCount > 0) {
      console.warn(`Found ${imageCount} images without alt text`);
    }
    
    // Check for missing form labels
    const inputs = this.page.locator('input:not([aria-label]):not([aria-labelledby])');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = this.page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        if (!hasLabel) {
          console.warn(`Input with id "${id}" has no associated label`);
        }
      }
    }
  }

  /**
   * Generate random test data
   */
  generateTestData() {
    const timestamp = Date.now();
    return {
      email: `test${timestamp}@example.com`,
      fullName: `Test User ${timestamp}`,
      password: 'TestPassword123!',
      bio: `Test biography ${timestamp}`,
      website: `https://test${timestamp}.example.com`,
      location: 'Test City, Test Country',
      phone: `+1234567${timestamp.toString().slice(-3)}`
    };
  }

  /**
   * Wait for dialog to open
   */
  async waitForDialog(title: string) {
    await expect(this.page.locator(`h2:has-text("${title}")`)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Close dialog
   */
  async closeDialog() {
    // Try different ways to close dialog
    const closeButton = this.page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]');
    if (await closeButton.count() > 0) {
      await closeButton.first().click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  /**
   * Switch language
   */
  async switchLanguage(language: 'en' | 'th') {
    const currentUrl = this.page.url();
    const newUrl = currentUrl.replace(/\/(en|th)\//, `/${language}/`);
    await this.page.goto(newUrl);
    await this.waitForPageLoad();
  }

  /**
   * Check responsive design
   */
  async checkResponsiveDesign() {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(500); // Allow layout to settle
      
      // Take screenshot for visual comparison
      await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
      
      // Basic visibility checks
      const mainContent = this.page.locator('main, [role="main"], .main-content');
      await expect(mainContent).toBeVisible();
    }
  }
}

/**
 * Test data generators
 */
export const TestData = {
  user: {
    admin: {
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      fullName: 'Test Admin',
      role: 'admin'
    },
    regular: {
      email: 'user@test.com',
      password: 'UserPassword123!',
      fullName: 'Test User',
      role: 'user'
    },
    moderator: {
      email: 'moderator@test.com',
      password: 'ModeratorPassword123!',
      fullName: 'Test Moderator',
      role: 'moderator'
    }
  },
  
  profile: {
    complete: {
      fullName: 'John Doe',
      bio: 'Software developer with 5+ years of experience',
      website: 'https://johndoe.dev',
      location: 'San Francisco, CA',
      phone: '+1-555-0123'
    },
    minimal: {
      fullName: 'Jane Smith'
    }
  }
};

/**
 * Common test patterns
 */
export const TestPatterns = {
  /**
   * Test form validation
   */
  async testFormValidation(page: Page, formSelector: string, requiredFields: string[]) {
    const helpers = new TestHelpers(page);
    
    // Try to submit empty form
    await page.click(`${formSelector} button[type="submit"]`);
    
    // Check that validation prevents submission
    for (const field of requiredFields) {
      const input = page.locator(`${formSelector} ${field}`);
      const isInvalid = await input.getAttribute('aria-invalid');
      expect(isInvalid).toBe('true');
    }
  },

  /**
   * Test CRUD operations
   */
  async testCrudOperations(page: Page, entityName: string) {
    const helpers = new TestHelpers(page);
    const testData = helpers.generateTestData();
    
    // Create
    await page.click(`button:has-text("Create ${entityName}")`);
    // ... fill form and submit
    await helpers.waitForSuccessMessage(`${entityName} created successfully`);
    
    // Read/List
    await expect(page.locator(`text=${testData.fullName}`)).toBeVisible();
    
    // Update
    await page.click('[aria-label="Edit"]');
    // ... update form and submit
    await helpers.waitForSuccessMessage(`${entityName} updated successfully`);
    
    // Delete
    await page.click('[aria-label="Delete"]');
    await page.click('button:has-text("Confirm")');
    await helpers.waitForSuccessMessage(`${entityName} deleted successfully`);
  }
};