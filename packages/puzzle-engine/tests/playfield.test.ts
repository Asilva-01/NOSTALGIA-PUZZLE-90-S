import { describe, expect, it } from 'vitest';
import { generatePuzzle } from '../src/geometry.ts';
import {
  MAX_START_OVERLAP,
  layoutPlayfield,
  pieceScreenRect,
  rectsOverlapRatio,
} from '../src/playfield.ts';
import type { PieceCount } from '../src/types.ts';

const VIEWS = [
  { width: 360, height: 520 },
  { width: 390, height: 688 },
  { width: 768, height: 860 },
  { width: 1280, height: 700 },
] as const;

const COUNTS: PieceCount[] = [12, 24, 48];

describe('layout inicial da bandeja', () => {
  for (const view of VIEWS) {
    for (const pieceCount of COUNTS) {
      it(`${pieceCount} peças em ${view.width}x${view.height} cabem sem empilhar`, () => {
        const puzzle = generatePuzzle({
          width: 800,
          height: 600,
          pieceCount,
          seed: 2026,
        });
        const laid = layoutPlayfield({
          view,
          board: puzzle.board,
          cols: puzzle.cols,
          rows: puzzle.rows,
          pieces: puzzle.pieces,
          seed: 2026,
        });
        expect(laid.pieces).toHaveLength(pieceCount);

        const screens = laid.pieces.map((piece) => pieceScreenRect(piece, laid.camera));
        const mustFitAll = pieceCount <= 24;
        if (mustFitAll) {
          for (const rect of screens) {
            expect(rect.x).toBeGreaterThanOrEqual(-2);
            expect(rect.y).toBeGreaterThanOrEqual(-2);
            expect(rect.x + rect.width).toBeLessThanOrEqual(view.width + 2);
            expect(rect.y + rect.height).toBeLessThanOrEqual(view.height + 2);
          }
        } else {
          expect(laid.cellScreen).toBeGreaterThanOrEqual(40);
        }

        const boxes = mustFitAll
          ? screens
          : laid.pieces.map((piece) => ({
              x: piece.x,
              y: piece.y,
              width: piece.bounds.width,
              height: piece.bounds.height,
            }));
        let worst = 0;
        for (let i = 0; i < boxes.length; i += 1) {
          const a = boxes[i];
          if (!a) continue;
          for (let j = i + 1; j < boxes.length; j += 1) {
            const b = boxes[j];
            if (!b) continue;
            worst = Math.max(worst, rectsOverlapRatio(a, b));
          }
        }
        expect(worst).toBeLessThanOrEqual(MAX_START_OVERLAP);

        if (pieceCount === 12 && view.width === 390) {
          const minW = Math.min(...screens.map((rect) => rect.width));
          expect(minW).toBeGreaterThan(44);
        }
        if (pieceCount === 48 && view.width <= 390) {
          expect(laid.cellScreen).toBeGreaterThanOrEqual(40);
        }
      });
    }
  }
});
