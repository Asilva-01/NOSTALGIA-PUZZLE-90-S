import { test } from '@playwright/test';
import { assemblePuzzle } from './assemble.ts';

test.describe('monta um puzzle de 24 peças', () => {
  test('arrasta todas as peças até concluir', async ({ page }) => {
    test.setTimeout(180_000);
    await assemblePuzzle(page, 24);
  });
});
