import { expect, type Page } from '@playwright/test';

export async function assemblePuzzle(page: Page, pieceCount: 12 | 24): Promise<void> {
  await page.goto(`/?play=${pieceCount}`);
  await page.waitForFunction(() => Boolean(window.__PUZZLE_TEST__?.getUnplaced().length));
  const total = await page.evaluate(() => window.__PUZZLE_TEST__?.getUnplaced().length ?? 0);
  expect(total).toBe(pieceCount);

  for (let i = 0; i < pieceCount; i += 1) {
    const remaining = await page.evaluate(() => window.__PUZZLE_TEST__?.getUnplaced() ?? []);
    const piece = remaining[0];
    expect(piece).toBeTruthy();
    if (!piece) break;
    await page.mouse.move(Math.round(piece.screen.x), Math.round(piece.screen.y));
    await page.mouse.down();
    await page.mouse.move(Math.round(piece.target.x), Math.round(piece.target.y), { steps: 12 });
    await page.mouse.up();
    await page.waitForFunction(
      (id) => window.__PUZZLE_TEST__?.session.pieceById(id).placed === true,
      piece.id,
      { timeout: 5_000 },
    );
  }

  await expect(page.getByRole('heading', { name: 'Que encaixe!' })).toBeVisible({
    timeout: 15_000,
  });
}
