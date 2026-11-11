import { describe, expect, it } from 'vitest';
import { computeScore, computeStars } from '../src/score.ts';
import { emptyHelpUsage } from '../src/help.ts';

describe('pontuação', () => {
  it('bonifica tempo e penaliza dicas', () => {
    const clean = computeScore({
      pieceCount: 12,
      elapsedMs: 10_000,
      helpUsed: emptyHelpUsage(),
    });
    const hinted = computeScore({
      pieceCount: 12,
      elapsedMs: 10_000,
      helpUsed: { ...emptyHelpUsage(), peekImage: 2, highlight: 1, shuffle: 3 },
    });
    expect(clean).toBeGreaterThan(hinted);
    expect(clean).toBeGreaterThan(12 * 50);
  });

  it('atribui 3, 2 ou 1 estrela', () => {
    expect(
      computeStars({
        pieceCount: 12,
        elapsedMs: 20_000,
        helpUsed: emptyHelpUsage(),
      }),
    ).toBe(3);
    expect(
      computeStars({
        pieceCount: 12,
        elapsedMs: 90_000,
        helpUsed: { ...emptyHelpUsage(), peekImage: 1, highlight: 1 },
      }),
    ).toBe(2);
    expect(
      computeStars({
        pieceCount: 12,
        elapsedMs: 90_000,
        helpUsed: { ...emptyHelpUsage(), peekImage: 2, highlight: 2, separateEdges: 1, shuffle: 4 },
      }),
    ).toBe(1);
  });
});
