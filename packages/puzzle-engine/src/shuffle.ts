import { mulberry32 } from '@puzzle-universe/shared-utils';
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

export function scatterPieces(
  pieces: readonly PieceGeometry[],
  board: Rect,
  seed: number,
): PieceRuntime[] {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const shuffled = fisherYates(pieces, seed);
  const area = {
    x: board.x - board.width * 0.04,
    y: board.y - board.height * 0.04,
    width: board.width * 1.08,
    height: board.height * 1.08,
  };

  return shuffled.map((piece, index) => {
    const minX = area.x;
    const minY = area.y;
    const maxX = area.x + area.width - piece.bounds.width;
    const maxY = area.y + area.height - piece.bounds.height;
    const spanX = Math.max(8, maxX - minX);
    const spanY = Math.max(8, maxY - minY);
    let x = minX + rng() * spanX;
    let y = minY + rng() * spanY;
    let guard = 0;
    while (
      Math.hypot(x - piece.bounds.x, y - piece.bounds.y) < Math.min(piece.cell.width, piece.cell.height) * 0.45 &&
      guard < 12
    ) {
      x = minX + rng() * spanX;
      y = minY + rng() * spanY;
      guard += 1;
    }
    return {
      ...piece,
      x,
      y,
      placed: false,
      zIndex: index + 1,
    };
  });
}

export function separateEdgePieces(
  pieces: PieceRuntime[],
  board: Rect,
): PieceRuntime[] {
  const edges = pieces.filter((piece) => !piece.placed && piece.isEdge);
  const inner = pieces.filter((piece) => !piece.placed && !piece.isEdge);
  const placed = pieces.filter((piece) => piece.placed);

  const layoutColumn = (group: PieceRuntime[], originX: number, originY: number) => {
    const gap = 10;
    group.forEach((piece, index) => {
      piece.x = originX;
      piece.y = originY + index * (Math.min(piece.bounds.height, 48) + gap);
      piece.zIndex = 100 + index;
    });
  };

  layoutColumn(edges, board.x - board.width * 0.34, board.y);
  layoutColumn(inner, board.x + board.width + board.width * 0.06, board.y);
  return [...placed, ...edges, ...inner];
}
