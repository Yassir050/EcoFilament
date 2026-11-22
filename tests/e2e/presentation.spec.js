
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads the presentation and exposes all twelve slides', async ({ page }) => {
  await expect(page).toHaveTitle(/EcoFilament/i);
  await expect(page.locator('.slide')).toHaveCount(12);
  await expect(page.locator('.slide.active')).toHaveCount(1);
  await expect(page.locator('#slideCount')).toHaveText('1 / 12');
});

test('switches between English LTR and Arabic RTL', async ({ page }) => {
  await page.locator('#langBtn').click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#langBtn')).toHaveAttribute('aria-pressed', 'true');

  await page.locator('#langBtn').click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#langBtn')).toHaveAttribute('aria-pressed', 'false');
});

test('navigates to the quiz and restarts it', async ({ page }) => {
  await page.getByRole('button', { name: 'Go to Quiz' }).click();

  await expect(page.locator('#slideCount')).toHaveText('12 / 12');
  await expect(page.locator('#quizStartButton')).toBeVisible();

  // Start the quiz before selecting an answer.
  await page.locator('#quizStartButton').click();

  await expect(page.locator('#quizPanel')).toBeVisible();
  await expect(page.locator('#qCount')).toContainText('Question 1');
  await expect(page.locator('#options button')).toHaveCount(4);

  // The last option is intentionally incorrect.
  await page.locator('#options button').last().click();
  await expect(page.locator('#nextQuestion')).toBeEnabled();

  for (let question = 1; question < 5; question += 1) {
    await page.locator('#nextQuestion').click();
    await page.locator('#options button').last().click();
  }

  await page.locator('#nextQuestion').click();

  await expect(page.locator('#resultPanel')).toBeVisible();
  await expect(page.locator('#finalScore')).toHaveText('0/5');

  await page.locator('[data-action="restart-quiz"]').click();

  await expect(page.locator('#quizPanel')).toBeVisible();
  await expect(page.locator('#qCount')).toContainText('Question 1');
});

test('supports the mobile viewport without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth
  }));

  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
  await expect(page.locator('#presentation')).toBeVisible();
});

test('keeps the 3D scene mount point available', async ({ page }) => {
  await expect(page.locator('#plastic-scene')).toBeAttached();
  await expect(page.locator('#plastic-scene')).toHaveAttribute('role', 'region');
});
