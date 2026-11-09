import { describe, expect, it } from 'vitest';
import { PuzzleSession } from '../src/session.ts';
import { defined } from '@puzzle-universe/shared-utils';

function makeSession(pieceCount: 12 | 24 | 48 = 12): PuzzleSession {
  return new PuzzleSession({
    appId: 'test',
    puzzleId: 'arcade',
    phaseId: 'phase-1',
    imageSrc: '/puzzles/test.png',
    imageWidth: 800,
    imageHeight: 600,
    pieceCount,
    seed: 21,
    timerEnabled: false,
  });
}

describe('snap e conclusão', () => {
  it('encaixa por proximidade e rejeita peça longe', () => {
    const session = makeSession(12);
    const piece = defined(session.pieces[0], 'peça');
    const far = session.movePiece(piece.id, piece.bounds.x + 400, piece.bounds.y + 400);
    expect(far).toBe(false);
    expect(session.pieceById(piece.id).placed).toBe(false);

    const near = session.movePiece(
      piece.id,
      piece.bounds.x + session.snapThreshold * 0.4,
      piece.bounds.y + session.snapThreshold * 0.4,
    );
    expect(near).toBe(true);
    expect(session.pieceById(piece.id).placed).toBe(true);
    expect(session.pieceById(piece.id).x).toBe(piece.bounds.x);
    expect(session.pieceById(piece.id).y).toBe(piece.bounds.y);
  });

  it('conclui o quebra-cabeça de 12 peças quando todas encaixam', () => {
    const session = makeSession(12);
    expect(session.completed).toBe(false);
    for (const piece of [...session.pieces]) {
      session.placePieceById(piece.id);
    }
    expect(session.unplacedPieces()).toHaveLength(0);
    expect(session.completed).toBe(true);
    expect(session.score).toBeGreaterThan(0);
  });

  it('conclui um quebra-cabeça de 24 e de 48 peças', () => {
    for (const count of [24, 48] as const) {
      const session = makeSession(count);
      for (const piece of [...session.pieces]) {
        session.placePieceById(piece.id);
      }
      expect(session.completed).toBe(true);
      expect(session.pieces).toHaveLength(count);
    }
  });
});
