import { mulberry32 } from '@puzzle-universe/shared-utils';
import { layoutPlayfield } from './playfield.ts';
import type { PieceGeometry, PieceRuntime, Rect } from './types.ts';

export function fisherYates<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const current = result[i];
    const swap = result[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    result[i] = swap;
    result[j] = current;
  }
  return result;
}

export const DEFAULT_LAYOUT_VIEW = { width: 390, height: 688 };

export function scatterPieces(
  pieces: readonly PieceGeometry[],
  board: Rect,
  seed: number,
  view = DEFAULT_LAYOUT_VIEW,
): PieceRuntime[] {
  const sample = pieces[0];
  const cols = sample ? Math.round(board.width / sample.cell.width) : 1;
  const rows = sample ? Math.round(board.height / sample.cell.height) : 1;
  return layoutPlayfield({
    view,
    board,
    cols: Math.max(1, cols),
    rows: Math.max(1, rows),
    pieces,
    seed,
  }).pieces;
}

export function separateEdgePieces(
  pieces: PieceRuntime[],
  board: Rect,
  view = DEFAULT_LAYOUT_VIEW,
): PieceRuntime[] {
  const placed = pieces.filter((piece) => piece.placed);
  const loose = pieces.filter((piece) => !piece.placed);
  if (loose.length === 0) return pieces;
  const sample = loose[0];
  const cols = sample ? Math.round(board.width / sample.cell.width) : 1;
  const rows = sample ? Math.round(board.height / sample.cell.height) : 1;
  const laid = layoutPlayfield({
    view,
    board,
    cols: Math.max(1, cols),
    rows: Math.max(1, rows),
    pieces: loose,
    seed: 7,
    preferEdges: true,
  }).pieces;
  return [...placed, ...laid];
}
