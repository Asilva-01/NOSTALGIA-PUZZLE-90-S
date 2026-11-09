import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from '@playwright/test';

function artifactDir(): string {
  for (const candidate of ['/opt/cursor/artifacts', resolve('artifacts')]) {
    try {
      mkdirSync(candidate, { recursive: true });
      return candidate;
    } catch {
      // tenta o próximo
    }
  }
  return resolve('test-results');
}

test('captura home, início, meio e conclusão', async ({ page }, testInfo) => {
  const dir = artifactDir();
  const app = testInfo.project.name.startsWith('bible') ? 'bible' : 'nostalgia';
  const vp = page.viewportSize();
  const size = vp ? `${vp.width}x${vp.height}` : 'unknown';

  await page.goto('/');
  await page.getByRole('heading').first().waitFor();
  await page.screenshot({
    path: `${dir}/${app}-home-${size}.png`,
    fullPage: true,
  });

  await page.goto('/?play=12');
  await page.waitForFunction(() => {
    const hook = window.__PUZZLE_TEST__;
    const pieces = hook?.getUnplaced() ?? [];
    return pieces.length === 12 && (pieces[0]?.screen.width ?? 0) > 8;
  });
  await page.screenshot({
    path: `${dir}/${app}-play-start-${size}.png`,
    fullPage: true,
  });

  await page.evaluate(() => {
    const hook = window.__PUZZLE_TEST__;
    if (!hook) return;
    const ids = hook.session.pieces.filter((piece) => !piece.placed).slice(0, 6).map((piece) => piece.id);
    for (const id of ids) hook.placePiece(id);
  });
  await page.waitForTimeout(200);
  await page.screenshot({
    path: `${dir}/${app}-play-mid-${size}.png`,
    fullPage: true,
  });

  await page.evaluate(() => {
    const hook = window.__PUZZLE_TEST__;
    if (!hook) return;
    for (const piece of hook.session.pieces) {
      if (!piece.placed) hook.placePiece(piece.id);
    }
  });
  await page.getByRole('heading', { name: 'Que encaixe!' }).waitFor();
  await page.screenshot({
    path: `${dir}/${app}-complete-${size}.png`,
    fullPage: true,
  });
});
