import { dist } from '@puzzle-universe/shared-utils';
import type { PieceRuntime } from './types.ts';

export function areGridNeighbors(a: PieceRuntime, b: PieceRuntime): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export function alignmentError(a: PieceRuntime, b: PieceRuntime): number {
  const expectedX = a.bounds.x - b.bounds.x;
  const expectedY = a.bounds.y - b.bounds.y;
  const actualX = a.x - b.x;
  const actualY = a.y - b.y;
  return dist(actualX, actualY, expectedX, expectedY);
}

export function groupMembers(
  pieces: readonly PieceRuntime[],
  groupId: string,
): PieceRuntime[] {
  return pieces.filter((piece) => piece.groupId === groupId);
}

export function translateGroup(members: readonly PieceRuntime[], dx: number, dy: number): void {
  for (const piece of members) {
    if (piece.placed) continue;
    piece.x += dx;
    piece.y += dy;
  }
}

export function mergeGroupIds(
  pieces: PieceRuntime[],
  fromId: string,
  intoId: string,
): void {
  if (fromId === intoId) return;
  for (const piece of pieces) {
    if (piece.groupId === fromId) {
      piece.groupId = intoId;
    }
  }
}

export function alignGroupToNeighbor(
  moving: readonly PieceRuntime[],
  anchor: PieceRuntime,
  neighbor: PieceRuntime,
): void {
  const targetX = neighbor.x + (anchor.bounds.x - neighbor.bounds.x);
  const targetY = neighbor.y + (anchor.bounds.y - neighbor.bounds.y);
  translateGroup(moving, targetX - anchor.x, targetY - anchor.y);
}
