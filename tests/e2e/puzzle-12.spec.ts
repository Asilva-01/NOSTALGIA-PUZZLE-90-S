import { test } from '@playwright/test';
import { assemblePuzzle } from './assemble.ts';

test.describe('monta um puzzle de 12 peças', () => {
  test('arrasta todas as peças até concluir', async ({ page }) => {
    await assemblePuzzle(page, 12);
  });
});
