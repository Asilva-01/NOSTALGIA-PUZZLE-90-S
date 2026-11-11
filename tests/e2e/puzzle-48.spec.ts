import { expect, test } from '@playwright/test';

test.describe('48 peças no celular', () => {
  test('abre com peças usáveis, zoom e prévia parcial', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/?play=48');
    await page.waitForFunction(() => {
      const pieces = window.__PUZZLE_TEST__?.getUnplaced() ?? [];
      return pieces.length === 48;
    });

    const report = await page.evaluate(() => {
      const hook = window.__PUZZLE_TEST__;
      if (!hook) return { ok: false, count: 0, minCell: 0, scale: 0 };
      const pieces = hook.session.pieces;
      const camera = hook.camera();
      const cell = pieces[0]?.cell;
      const cellScreen = cell ? Math.min(cell.width, cell.height) * camera.scale : 0;
      return {
        ok: true,
        count: pieces.length,
        minCell: cellScreen,
        scale: camera.scale,
      };
    });

    expect(report.ok).toBe(true);
    expect(report.count).toBe(48);
    expect(report.minCell).toBeGreaterThanOrEqual(36);

    await expect(page.getByRole('button', { name: /Prévia parcial/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aumentar zoom' })).toBeVisible();
    await page.getByRole('button', { name: 'Aumentar zoom' }).click();
    await page.getByRole('button', { name: /Prévia parcial/ }).click();
    await expect(page.getByText('Prévia parcial da imagem')).toBeVisible();

    await page.evaluate(() => {
      const hook = window.__PUZZLE_TEST__;
      if (!hook) return;
      for (const piece of hook.session.pieces) {
        if (!piece.placed) hook.placePiece(piece.id);
      }
    });
    await expect(page.getByRole('heading', { name: 'Que encaixe!' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
