import { defined } from '@puzzle-universe/shared-utils';
import { PIECE_COUNTS, type PieceCount } from './types.ts';

export const GRID_OPTIONS: Record<PieceCount, Array<[number, number]>> = {
  12: [
    [4, 3],
    [3, 4],
  ],
  24: [
    [6, 4],
    [4, 6],
    [8, 3],
  ],
  48: [
    [8, 6],
    [6, 8],
  ],
  72: [
    [9, 8],
    [8, 9],
    [12, 6],
  ],
  96: [
    [12, 8],
    [8, 12],
  ],
  150: [
    [15, 10],
    [10, 15],
  ],
  200: [
    [20, 10],
    [10, 20],
    [16, 13],
  ],
};

export function isPieceCount(value: number): value is PieceCount {
  return (PIECE_COUNTS as readonly number[]).includes(value);
}

export function gridForPieceCount(
  pieceCount: PieceCount,
  imageAspect: number,
): { cols: number; rows: number } {
  const options = defined(GRID_OPTIONS[pieceCount], `Contagem sem grade: ${pieceCount}`);
  let best = defined(options[0], 'Grade vazia');
  let bestScore = Number.POSITIVE_INFINITY;
  for (const option of options) {
    const [cols, rows] = option;
    if (cols * rows !== pieceCount) {
      continue;
    }
    const gridAspect = cols / rows;
    const score = Math.abs(Math.log(gridAspect) - Math.log(imageAspect));
    if (score < bestScore) {
      best = option;
      bestScore = score;
    }
  }
  return { cols: best[0], rows: best[1] };
}

export function assertValidGrid(cols: number, rows: number, pieceCount: PieceCount): void {
  if (cols * rows !== pieceCount) {
    throw new Error(`Grade ${cols}x${rows} não soma ${pieceCount} peças`);
  }
}
