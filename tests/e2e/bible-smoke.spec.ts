import { expect, test } from '@playwright/test';

test('Bible Puzzle abre a casa com identidade própria', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bible Puzzle Adventures' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desafio aleatório' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Noé e a arca' })).toBeVisible();
  await expect(page.getByText('Gênesis 6–9')).toBeVisible();
});
