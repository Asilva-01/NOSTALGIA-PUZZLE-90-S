import { expect, test } from '@playwright/test';

test('som começa ligado na casa e na partida', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Som ligado' })).toBeVisible();

  await page.goto('/?play=12');
  await page.waitForFunction(() => Boolean(window.__PUZZLE_TEST__));
  await expect(page.getByRole('button', { name: 'Som ligado' })).toBeVisible();
});
