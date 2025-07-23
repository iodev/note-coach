import { test, expect } from '@playwright/test';

test.describe('Note Coach Application', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Navigate to application', async () => {
      await page.goto('http://localhost:3000');
      await expect(page).toHaveURL('http://localhost:3000');
    });
  });

  test('should allow voice input for notes', async ({ page }) => {
    await test.step('Focus on textarea and simulate voice input', async () => {
      await page.focus('textarea');
      await page.keyboard.press('Meta+Shift+S'); // Simulate voice input activation
      await page.keyboard.type('Test note using voice input');
      await page.keyboard.press('Enter');
      await expect(page.locator('textarea')).toHaveText('Test note using voice input', { timeout: 10000 });
    });
  });

  test('should save and categorize notes', async ({ page }) => {
    await test.step('Fill textarea and save note', async () => {
      await page.fill('textarea', 'This is a test note for categorization');
      await page.keyboard.press('Enter');
      await page.click('button:has-text("Save & Analyze Note")', { timeout: 30000 });
      await expect(page.locator('text=Note categorized successfully')).toBeVisible({ timeout: 30000 });
    });
  });

  test('should sync notes with Google Drive', async ({ page }) => {
    // Assuming Google Drive sync is triggered automatically after saving a note
    await test.step('Fill textarea and save note', async () => {
      await page.fill('textarea', 'This is a test note for Google Drive sync');
      await page.keyboard.press('Enter');
      await page.click('button:has-text("Save & Analyze Note")', { timeout: 30000 });
      await expect(page.locator('text=Note synced with Google Drive')).toBeVisible({ timeout: 30000 });
    });
  });

  test('should provide Socratic coaching', async ({ page }) => {
    await test.step('Fill textarea and save note', async () => {
      await page.fill('textarea', 'This is a test note for Socratic coaching');
      await page.keyboard.press('Enter');
      await page.click('button:has-text("Save & Analyze Note")', { timeout: 30000 });
    });
    await test.step('Start coaching session', async () => {
      await page.click('button:has-text("Coach Me")', { timeout: 30000 });
      await expect(page.locator('text=Coaching questions based on your note')).toBeVisible({ timeout: 30000 });
    });
  });
});
