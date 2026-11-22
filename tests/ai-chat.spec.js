
import { test, expect } from '@playwright/test';

const API_URL = '**/api/chat';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    sessionStorage.clear();
  });
  await page.reload();
});

test('opens and closes the AI Chat window', async ({ page }) => {
  const chat = page.locator('#aiChatWindow');

  await expect(chat).toBeHidden();

  await page.locator('#aiChatToggle').click();
  await expect(chat).toBeVisible();
  await expect(page.locator('#aiChatToggle'))
    .toHaveAttribute('aria-expanded', 'true');

  await page.locator('#aiChatClose').click();
  await expect(chat).toBeHidden();
  await expect(page.locator('#aiChatToggle'))
    .toHaveAttribute('aria-expanded', 'false');
});

test('sends a message and displays the AI reply', async ({ page }) => {
  await page.route(API_URL, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        reply: 'PET is commonly used for plastic bottles.'
      })
    });
  });

  await page.locator('#aiChatToggle').click();
  await page.locator('#aiChatInput').fill('What is PET?');
  await page.locator('#aiChatSend').click();

  await expect(page.locator('.ai-chat-message--user'))
    .toContainText('What is PET?');

  await expect(page.locator('.ai-chat-message--assistant'))
    .toContainText('PET is commonly used for plastic bottles.');

  await expect(page.locator('#aiChatStatus')).toBeEmpty();
});

test('supports Arabic and English language switching', async ({ page }) => {
  await page.locator('#aiChatToggle').click();

  await page.locator('#langBtn').click();

  await expect(page.locator('#aiChatWindow'))
    .toHaveAttribute('lang', 'ar');

  await expect(page.locator('#aiChatWindow'))
    .toHaveAttribute('dir', 'rtl');

  await expect(page.locator('#aiChatInput'))
    .toHaveAttribute('placeholder', 'اسألني عن EcoFilament...');

  await page.locator('#langBtn').click();

  await expect(page.locator('#aiChatWindow'))
    .toHaveAttribute('lang', 'en');

  await expect(page.locator('#aiChatWindow'))
    .toHaveAttribute('dir', 'ltr');
});

test('preserves conversation during the current session', async ({ page }) => {
  await page.route(API_URL, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        reply: 'This is a test reply.'
      })
    });
  });

  await page.locator('#aiChatToggle').click();
  await page.locator('#aiChatInput').fill('Remember this test message');
  await page.locator('#aiChatSend').click();

  await expect(page.locator('.ai-chat-message--assistant'))
    .toContainText('This is a test reply.');

  await page.reload();
  await page.locator('#aiChatToggle').click();

  await expect(page.locator('.ai-chat-message--user'))
    .toContainText('Remember this test message');

  await expect(page.locator('.ai-chat-message--assistant'))
    .toContainText('This is a test reply.');
});

test('clears conversation and session storage', async ({ page }) => {
  await page.route(API_URL, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        reply: 'Test response.'
      })
    });
  });

  await page.locator('#aiChatToggle').click();
  await page.locator('#aiChatInput').fill('Test message');
  await page.locator('#aiChatSend').click();

  await expect(page.locator('.ai-chat-message--user'))
    .toContainText('Test message');

  await page.locator('#aiChatClear').click();

  await expect(page.locator('.ai-chat-message--user'))
    .toHaveCount(0);

  await expect(page.locator('#aiChatMessages'))
    .toContainText("Hello! I'm the EcoFilament AI assistant.");

  const storage = await page.evaluate(() =>
    sessionStorage.getItem('ecofilament_ai_chat_v1')
  );

  expect(storage).toBeNull();
});

test('shows a network error when the API is unavailable', async ({ page }) => {
  await page.route(API_URL, route => route.abort());

  await page.locator('#aiChatToggle').click();
  await page.locator('#aiChatInput').fill('Test connection');
  await page.locator('#aiChatSend').click();

  await expect(page.locator('#aiChatStatus'))
    .toContainText('Unable to connect to the server.');

  await expect(page.locator('#aiChatInput')).toBeEnabled();
});

test('keeps Chat and Presenter launchers separated on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const chat = page.locator('#aiChatToggle');
  const presenter = page.locator('#aiPresenterLauncher');

  await expect(chat).toBeVisible();
  await expect(presenter).toBeVisible();

  const chatBox = await chat.boundingBox();
  const presenterBox = await presenter.boundingBox();

  expect(chatBox).not.toBeNull();
  expect(presenterBox).not.toBeNull();

  const separated =
    chatBox.x + chatBox.width <= presenterBox.x ||
    presenterBox.x + presenterBox.width <= chatBox.x;

  expect(separated).toBe(true);
});
