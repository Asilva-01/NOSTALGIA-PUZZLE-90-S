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

test('captura home e partida em andamento', async ({ page }, testInfo) => {
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
  await page.waitForFunction(() => Boolean(window.__PUZZLE_TEST__?.getUnplaced().length));
  await page.screenshot({
    path: `${dir}/${app}-play-${size}.png`,
    fullPage: true,
  });
});
