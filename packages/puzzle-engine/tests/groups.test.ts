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

function pieceAt(session: PuzzleSession, row: number, col: number) {
  return defined(
    session.pieces.find((piece) => piece.row === row && piece.col === col),
    `peça ${row},${col}`,
  );
}

function alignedPosition(anchor: { x: number; y: number; bounds: { x: number; y: number } }, other: {
  bounds: { x: number; y: number };
}) {
  return {
    x: anchor.x - (anchor.bounds.x - other.bounds.x),
    y: anchor.y - (anchor.bounds.y - other.bounds.y),
  };
}

describe('grupos de peças', () => {
  it('une vizinhas alinhadas e arrasta o grupo inteiro', () => {
    const session = makeSession(12);
    const a = pieceAt(session, 0, 0);
    const b = pieceAt(session, 0, 1);
    session.movePiece(a.id, a.bounds.x + 420, a.bounds.y + 280);
    const movedA = session.pieceById(a.id);
    const target = alignedPosition(movedA, b);
    const joined = session.movePiece(b.id, target.x, target.y);

    expect(joined).toBe(false);
    expect(session.pieceById(a.id).groupId).toBe(session.pieceById(b.id).groupId);
    expect(session.pieceById(a.id).placed).toBe(false);

    const beforeB = { x: session.pieceById(b.id).x, y: session.pieceById(b.id).y };
    const lead = session.pieceById(a.id);
    session.beginDrag(a.id, lead.x + 4, lead.y + 4);
    session.dragTo(lead.x + 84, lead.y + 64);
    session.endDrag();

    expect(session.pieceById(b.id).x).toBeCloseTo(beforeB.x + 80, 5);
    expect(session.pieceById(b.id).y).toBeCloseTo(beforeB.y + 60, 5);
    expect(session.pieceById(a.id).groupId).toBe(session.pieceById(b.id).groupId);
  });

  it('encaixa o grupo no tabuleiro quando o conjunto chega perto do lugar certo', () => {
    const session = makeSession(12);
    const a = pieceAt(session, 1, 1);
    const b = pieceAt(session, 1, 2);
    session.movePiece(a.id, a.bounds.x + 300, a.bounds.y + 220);
    const movedA = session.pieceById(a.id);
    const joinAt = alignedPosition(movedA, b);
    session.movePiece(b.id, joinAt.x, joinAt.y);
    expect(session.pieceById(a.id).groupId).toBe(session.pieceById(b.id).groupId);

    const placed = session.movePiece(
      a.id,
      a.bounds.x + session.snapThreshold * 0.3,
      a.bounds.y + session.snapThreshold * 0.3,
    );
    expect(placed).toBe(true);
    expect(session.pieceById(a.id).placed).toBe(true);
    expect(session.pieceById(b.id).placed).toBe(true);
    expect(session.pieceById(a.id).x).toBe(a.bounds.x);
    expect(session.pieceById(b.id).x).toBe(b.bounds.x);
  });

  it('não une peças que não são vizinhas mesmo com o deslocamento certo', () => {
    const session = makeSession(12);
    const a = pieceAt(session, 0, 0);
    const far = pieceAt(session, 2, 3);
    session.movePiece(a.id, a.bounds.x + 380, a.bounds.y + 240);
    const movedA = session.pieceById(a.id);
    const joinAt = alignedPosition(movedA, far);
    session.movePiece(far.id, joinAt.x, joinAt.y);
    expect(session.pieceById(a.id).groupId).not.toBe(session.pieceById(far.id).groupId);
  });

  it('prende o grupo a uma vizinha já travada no tabuleiro', () => {
    const session = makeSession(12);
    const a = pieceAt(session, 0, 0);
    const b = pieceAt(session, 0, 1);
    session.placePieceById(a.id);
    const placed = session.movePiece(
      b.id,
      b.bounds.x + session.snapThreshold * 0.25,
      b.bounds.y + session.snapThreshold * 0.25,
    );
    expect(placed).toBe(true);
    expect(session.pieceById(b.id).placed).toBe(true);
  });
});
