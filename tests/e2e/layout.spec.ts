import { expect, test } from '@playwright/test';

const MAX_OVERLAP = 0.22;

test('peças iniciais cabem na tela sem transbordar a ajuda', async ({ page }) => {
  await page.goto('/?play=12');
  await page.waitForFunction(() => {
    const hook = window.__PUZZLE_TEST__;
    if (!hook) return false;
    const pieces = hook.getUnplaced();
    return pieces.length > 0 && pieces.every((piece) => piece.screen.width > 8);
  });

  const report = await page.evaluate((maxOverlap) => {
    const hook = window.__PUZZLE_TEST__;
    const help = document.querySelector<HTMLElement>('[aria-label="Ajuda"]');
    if (!hook || !help) {
      return { ok: false, reason: 'hook ou ajuda ausente' };
    }
    const canvas = hook.canvasRect();
    const pieces = hook.getUnplaced();
    const boxes = pieces.map((piece) => ({
      x: piece.screen.x - piece.screen.width / 2,
      y: piece.screen.y - piece.screen.height / 2,
      width: piece.screen.width,
      height: piece.screen.height,
    }));
    const pad = 10;
    const outside = boxes.filter(
      (box) =>
        box.x < canvas.left - pad ||
        box.y < canvas.top - pad ||
        box.x + box.width > canvas.right + pad ||
        box.y + box.height > canvas.bottom + pad,
    );
    let worst = 0;
    for (let i = 0; i < boxes.length; i += 1) {
      const a = boxes[i];
      if (!a) continue;
      for (let j = i + 1; j < boxes.length; j += 1) {
        const b = boxes[j];
        if (!b) continue;
        const x = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const y = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        const inter = x * y;
        const smaller = Math.min(a.width * a.height, b.width * b.height);
        worst = Math.max(worst, smaller <= 0 ? 0 : inter / smaller);
      }
    }
    const helpBox = help.getBoundingClientRect();
    return {
      ok: true,
      count: pieces.length,
      outside: outside.length,
      worst,
      minWidth: Math.min(...boxes.map((box) => box.width)),
      helpOverflow: help.scrollWidth - help.clientWidth,
      helpRight: helpBox.right,
      viewWidth: window.innerWidth,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      maxOverlap,
    };
  }, MAX_OVERLAP);

  expect(report.ok).toBe(true);
  expect(report.count).toBe(12);
  expect(report.outside).toBe(0);
  expect(report.worst).toBeLessThanOrEqual(MAX_OVERLAP);
  expect(report.helpOverflow).toBeLessThanOrEqual(1);
  expect(report.helpRight).toBeLessThanOrEqual((report.viewWidth ?? 0) + 1);
  expect(report.pageOverflow).toBeLessThanOrEqual(2);
  await expect(page.getByRole('button', { name: /Embaralhar/ })).toBeInViewport();

  const vp = page.viewportSize();
  if (vp && vp.width === 390) {
    expect(report.minWidth).toBeGreaterThan(44);
  }
});
