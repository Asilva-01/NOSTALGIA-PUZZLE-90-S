import { expect, test } from '@playwright/test';

test('Bible Puzzle abre a casa com identidade própria', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bible Puzzle Adventures' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desafio aleatório' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Criação / Éden' })).toBeVisible();
  await expect(page.getByText('Gênesis 1–3')).toBeVisible();
  await expect(page.getByRole('button', { name: /Surpreenda-me/ })).toBeEnabled();
  await expect(page.locator('.level-card img')).toHaveCount(10);
});
