import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you would need to authenticate first
    await page.goto('/en/dashboard');
  });

  test.describe('Dashboard Navigation', () => {
    test('should display dashboard navigation', async ({ page }) => {
      // Check if dashboard navigation is visible
      await expect(page.locator('nav[data-testid="dashboard-nav"]')).toBeVisible();
      
      // Check navigation items
      await expect(page.locator('a:has-text("Dashboard")')).toBeVisible();
      await expect(page.locator('a:has-text("Profile")')).toBeVisible();
      await expect(page.locator('a:has-text("Analytics")')).toBeVisible();
      await expect(page.locator('a:has-text("Reports")')).toBeVisible();
      await expect(page.locator('a:has-text("Notifications")')).toBeVisible();
    });

    test('should show admin navigation for admin users', async ({ page }) => {
      // This test would require admin authentication
      // Check if admin navigation items are visible
      await expect(page.locator('a:has-text("Admin")')).toBeVisible();
      await expect(page.locator('a:has-text("User Management")')).toBeVisible();
    });

    test('should highlight active navigation item', async ({ page }) => {
      // Dashboard should be active by default
      const dashboardLink = page.locator('a:has-text("Dashboard")');
      await expect(dashboardLink).toHaveClass(/active|bg-primary/);
    });
  });

  test.describe('Dashboard Content', () => {
    test('should display welcome message with time-based greeting', async ({ page }) => {
      // Check for greeting (time-dependent)
      const greetings = ['Good morning', 'Good afternoon', 'Good evening'];
      const hasGreeting = await Promise.all(
        greetings.map(greeting => 
          page.locator(`text=${greeting}`).isVisible().catch(() => false)
        )
      );
      
      expect(hasGreeting.some(visible => visible)).toBe(true);
      
      // Check welcome message
      await expect(page.locator('text=Welcome back to your dashboard')).toBeVisible();
    });

    test('should display account status card', async ({ page }) => {
      // Check account status section
      await expect(page.locator('text=Account Status')).toBeVisible();
      await expect(page.locator('text=Member Since')).toBeVisible();
      await expect(page.locator('text=Role')).toBeVisible();
    });

    test('should display quick actions', async ({ page }) => {
      // Check quick actions section
      await expect(page.locator('text=Quick Actions')).toBeVisible();
      
      // Check action cards
      await expect(page.locator('text=Edit Profile')).toBeVisible();
      await expect(page.locator('text=Update your information')).toBeVisible();
      await expect(page.locator('text=Analytics')).toBeVisible();
      await expect(page.locator('text=View your statistics')).toBeVisible();
      await expect(page.locator('text=Notifications')).toBeVisible();
      await expect(page.locator('text=Manage your alerts')).toBeVisible();
    });

    test('should display recent activity', async ({ page }) => {
      // Check recent activity section
      await expect(page.locator('text=Recent Activity')).toBeVisible();
      
      // Should show activity items or empty state
      const hasActivity = await page.locator('[data-testid="activity-item"]').count();
      if (hasActivity === 0) {
        await expect(page.locator('text=No recent activity')).toBeVisible();
      } else {
        await expect(page.locator('[data-testid="activity-item"]').first()).toBeVisible();
      }
    });
  });

  test.describe('Quick Actions', () => {
    test('should navigate to profile when clicking Edit Profile', async ({ page }) => {
      await page.click('text=Edit Profile');
      await expect(page).toHaveURL('/en/profile');
    });

    test('should navigate to analytics when clicking Analytics', async ({ page }) => {
      await page.click('text=Analytics');
      await expect(page).toHaveURL('/en/dashboard/analytics');
    });

    test('should navigate to notifications when clicking Notifications', async ({ page }) => {
      await page.click('text=Notifications');
      await expect(page).toHaveURL('/en/dashboard/notifications');
    });

    test('should navigate to admin panel for admin users', async ({ page }) => {
      // This test requires admin authentication
      const adminPanelCard = page.locator('text=Admin Panel');
      if (await adminPanelCard.isVisible()) {
        await adminPanelCard.click();
        await expect(page).toHaveURL('/en/admin');
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigation should be responsive (possibly collapsed)
      await expect(page.locator('nav')).toBeVisible();
      
      // Main content should be visible
      await expect(page.locator('text=Welcome back')).toBeVisible();
      await expect(page.locator('text=Quick Actions')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Should display properly on tablet
      await expect(page.locator('nav[data-testid="dashboard-nav"]')).toBeVisible();
      await expect(page.locator('text=Account Status')).toBeVisible();
    });
  });

  test.describe('Internationalization', () => {
    test('should display Thai interface', async ({ page }) => {
      await page.goto('/th/dashboard');
      
      // Check Thai text
      await expect(page.locator('text=ยินดีต้อนรับกลับสู่แดชบอร์ดของคุณ')).toBeVisible();
      await expect(page.locator('text=สถานะบัญชี')).toBeVisible();
      await expect(page.locator('text=การกระทำด่วน')).toBeVisible();
      await expect(page.locator('text=แก้ไขโปรไฟล์')).toBeVisible();
    });

    test('should show Thai time-based greetings', async ({ page }) => {
      await page.goto('/th/dashboard');
      
      // Check for Thai greetings
      const thaiGreetings = ['สวัสดีตอนเช้า', 'สวัสดีตอนบ่าย', 'สวัสดีตอนเย็น'];
      const hasThaiGreeting = await Promise.all(
        thaiGreetings.map(greeting => 
          page.locator(`text=${greeting}`).isVisible().catch(() => false)
        )
      );
      
      expect(hasThaiGreeting.some(visible => visible)).toBe(true);
    });
  });
});

test.describe('Dashboard Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard/analytics');
  });

  test('should display analytics page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Analytics")')).toBeVisible();
    
    // Check for analytics content
    // This would depend on your analytics implementation
    await expect(page.locator('text=Coming soon')).toBeVisible();
  });
});

test.describe('Dashboard Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard/reports');
  });

  test('should display reports page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Reports")')).toBeVisible();
    
    // Check for reports content
    await expect(page.locator('text=Coming soon')).toBeVisible();
  });
});

test.describe('Dashboard Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard/notifications');
  });

  test('should display notifications page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Notifications")')).toBeVisible();
    
    // Check for notifications content
    await expect(page.locator('text=Coming soon')).toBeVisible();
  });

  test('should work in Thai', async ({ page }) => {
    await page.goto('/th/dashboard/notifications');
    await expect(page.locator('h1:has-text("การแจ้งเตือน")')).toBeVisible();
  });
});