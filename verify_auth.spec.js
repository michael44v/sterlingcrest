import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:4173';

test('capture auth pages', async ({ page }) => {
  // Login Page
  await page.goto(`${baseUrl}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'auth_login.png', fullPage: true });

  // Register Page
  await page.goto(`${baseUrl}/register`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'auth_register.png', fullPage: true });

  // Verify Email Page
  await page.goto(`${baseUrl}/verify-email`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'auth_verify_email.png', fullPage: true });

  // Forgot Password Page
  await page.goto(`${baseUrl}/forgot-password`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'auth_forgot_password.png', fullPage: true });
});
