import { describe, expect, it } from 'vitest';
import { generatePuzzle } from '../src/geometry.ts';
import { fisherYates, scatterPieces } from '../src/shuffle.ts';

describe('embaralhamento determinístico', () => {
  it('repete a ordem para a mesma seed e muda para outra', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    expect(fisherYates(ids, 11)).toEqual(fisherYates(ids, 11));
    expect(fisherYates(ids, 11)).not.toEqual(fisherYates(ids, 12));
  });

  it('espalha todas as peças sem marcar como colocadas', () => {
    const puzzle = generatePuzzle({
      width: 800,
      height: 600,
      pieceCount: 24,
      seed: 5,
    });
    const a = scatterPieces(puzzle.pieces, puzzle.board, 99);
    const b = scatterPieces(puzzle.pieces, puzzle.board, 99);
    expect(a.map((piece) => `${piece.id}:${piece.x}:${piece.y}`)).toEqual(
      b.map((piece) => `${piece.id}:${piece.x}:${piece.y}`),
    );
    expect(a.every((piece) => !piece.placed)).toBe(true);
    expect(new Set(a.map((piece) => piece.id)).size).toBe(24);
  });
});
