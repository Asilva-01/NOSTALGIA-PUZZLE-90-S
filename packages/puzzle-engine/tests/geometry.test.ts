import { describe, expect, it } from 'vitest';
import {
  complementKind,
  edgeCommands,
  generatePuzzle,
  pieceAt,
} from '../src/geometry.ts';
import { PIECE_COUNTS } from '../src/types.ts';
import { gridForPieceCount } from '../src/grid.ts';
import { reverseCommands } from '../src/path.ts';
import { defined } from '@puzzle-universe/shared-utils';

function almost(a: number, b: number, eps = 0.05): boolean {
  return Math.abs(a - b) < eps;
}

describe('geometria das peças', () => {
  it('usa bordas lisas no contorno e abas complementares entre vizinhas', () => {
    const puzzle = generatePuzzle({
      width: 800,
      height: 600,
      pieceCount: 12,
      seed: 90,
    });

    for (const piece of puzzle.pieces) {
      if (piece.row === 0) expect(piece.edges.top).toBe('flat');
      if (piece.col === 0) expect(piece.edges.left).toBe('flat');
      if (piece.row === puzzle.rows - 1) expect(piece.edges.bottom).toBe('flat');
      if (piece.col === puzzle.cols - 1) expect(piece.edges.right).toBe('flat');
    }

    for (let r = 0; r < puzzle.rows; r += 1) {
      for (let c = 0; c < puzzle.cols - 1; c += 1) {
        const left = pieceAt(puzzle, r, c);
        const right = pieceAt(puzzle, r, c + 1);
        expect(left.edges.right).not.toBe('flat');
        expect(right.edges.left).toBe(complementKind(left.edges.right));
        expect(left.edgeIds.right).toBe(right.edgeIds.left);
      }
    }

    for (let r = 0; r < puzzle.rows - 1; r += 1) {
      for (let c = 0; c < puzzle.cols; c += 1) {
        const top = pieceAt(puzzle, r, c);
        const bottom = pieceAt(puzzle, r + 1, c);
        expect(top.edges.bottom).not.toBe('flat');
        expect(bottom.edges.top).toBe(complementKind(top.edges.bottom));
      }
    }
  });

  it('gera curvas Bézier nas abas internas', () => {
    const puzzle = generatePuzzle({
      width: 400,
      height: 300,
      pieceCount: 12,
      seed: 7,
    });
    const inner = defined(
      puzzle.edges.find((edge) => edge.kind === 'shaped'),
      'precisa haver aresta interna',
    );
    const cmds = edgeCommands(inner, false);
    expect(cmds.some((cmd) => cmd.type === 'C')).toBe(true);
    const reversed = reverseCommands(cmds);
    const last = reversed[reversed.length - 1];
    const first = cmds[0];
    expect(first && first.type !== 'Z').toBe(true);
    expect(last && last.type !== 'Z').toBe(true);
    if (first && first.type !== 'Z' && last && last.type !== 'Z') {
      expect(almost(last.x, first.x)).toBe(true);
      expect(almost(last.y, first.y)).toBe(true);
    }
  });

  it('varia o recorte de forma determinística por seed', () => {
    const a = generatePuzzle({ width: 640, height: 480, pieceCount: 24, seed: 1 });
    const b = generatePuzzle({ width: 640, height: 480, pieceCount: 24, seed: 1 });
    const c = generatePuzzle({ width: 640, height: 480, pieceCount: 24, seed: 2 });
    expect(a.edges.map((edge) => edge.sign)).toEqual(b.edges.map((edge) => edge.sign));
    expect(a.edges.map((edge) => edge.sign)).not.toEqual(c.edges.map((edge) => edge.sign));
  });
});

describe('grade para todas as contagens', () => {
  it.each(PIECE_COUNTS)('monta grade exata para %i peças', (count) => {
    const landscape = gridForPieceCount(count, 4 / 3);
    const portrait = gridForPieceCount(count, 3 / 4);
    expect(landscape.cols * landscape.rows).toBe(count);
    expect(portrait.cols * portrait.rows).toBe(count);
    const puzzle = generatePuzzle({
      width: 1200,
      height: 800,
      pieceCount: count,
      seed: 42,
    });
    expect(puzzle.pieces).toHaveLength(count);
    expect(puzzle.cols * puzzle.rows).toBe(count);
  });
});
