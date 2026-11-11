import { expect, test } from '@playwright/test';

test('no Desafio o countdown aparece mesmo com o cronômetro desligado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Desafio', exact: true }).click();
  await page.getByRole('button', { name: 'Cronômetro ligado' }).click();
  await expect(page.getByRole('button', { name: 'Cronômetro desligado' })).toBeVisible();
  await page.getByRole('button', { name: '12 peças', exact: true }).click();
  await page.waitForFunction(() => Boolean(window.__PUZZLE_TEST__));
  await expect(page.locator('[aria-label="Tempo restante"]')).toBeVisible();
  await expect(page.getByText(/resta \d{2}:\d{2}/)).toBeVisible();
  await expect(page.getByText('sem tempo')).toHaveCount(0);
});

test('se o tempo acaba no Desafio, a partida falha e dá para tentar de novo', async ({ page }) => {
  await page.goto('/?play=12&preset=desafio');
  await page.waitForFunction(() => Boolean(window.__PUZZLE_TEST__));
  await expect(page.locator('[aria-label="Tempo restante"]')).toBeVisible();

  await page.evaluate(() => {
    const session = window.__PUZZLE_TEST__?.session;
    if (!session) throw new Error('sessão ausente');
    session.elapsedMs = 12 * 9000;
    session.tick(performance.now() + 1);
  });

  await expect(page.getByRole('heading', { name: 'Não deu tempo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
  await expect(page.getByText(/nada foi perdido/i)).toBeVisible();

  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  await page.waitForFunction(() => Boolean(window.__PUZZLE_TEST__));
  await expect(page.getByLabel('Área do quebra-cabeça')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Não deu tempo' })).toHaveCount(0);
  const failed = await page.evaluate(() => window.__PUZZLE_TEST__?.session.failed === true);
  expect(failed).toBe(false);
});
