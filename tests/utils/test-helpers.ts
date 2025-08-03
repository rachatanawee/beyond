import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  async switchLanguage(targetLanguage: 'en' | 'th') {
    const buttonText = targetLanguage === 'en' ? 'Language' : 'ภาษา';
    const optionText = targetLanguage === 'en' ? '🇺🇸 English' : '🇹🇭 ไทย';
    
    await this.page.click(`button:has-text("${buttonText}")`);
    await this.page.click(`button:has-text("${optionText}")`);
    
    const expectedUrl = `/${targetLanguage}`;
    await expect(this.page).toHaveURL(new RegExp(expectedUrl));
  }

  async navigateToLogin() {
    const currentUrl = this.page.url();
    const isThaiLocale = currentUrl.includes('/th');
    const buttonText = isThaiLocale ? 'เข้าสู่ระบบ' : 'Sign In';
    
    await this.page.click(`a:has-text("${buttonText}")`);
  }

  async fillLoginForm(email: string, password: string, confirmPassword?: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[name="password"]', password);
    
    if (confirmPassword) {
      await this.page.fill('input[name="confirmPassword"]', confirmPassword);
    }
  }

  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  async toggleAuthMode() {
    // Look for either "Don't have an account?" or "Already have an account?"
    const signUpToggle = this.page.locator('button:has-text("Don\'t have an account?")');
    const signInToggle = this.page.locator('button:has-text("Already have an account?")');
    
    if (await signUpToggle.isVisible()) {
      await signUpToggle.click();
    } else if (await signInToggle.isVisible()) {
      await signInToggle.click();
    }
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }

  async expectPageTitle(title: string) {
    await expect(this.page.locator(`h2:has-text("${title}")`)).toBeVisible();
  }

  async expectButtonText(text: string) {
    await expect(this.page.locator(`button:has-text("${text}")`)).toBeVisible();
  }

  async waitForNavigation(expectedUrl: string | RegExp) {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async checkResponsiveElement(selector: string, shouldBeVisible: boolean = true) {
    const element = this.page.locator(selector);
    if (shouldBeVisible) {
      await expect(element).toBeVisible();
    } else {
      await expect(element).not.toBeVisible();
    }
  }
}