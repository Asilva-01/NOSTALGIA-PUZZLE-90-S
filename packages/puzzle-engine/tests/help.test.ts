import { describe, expect, it } from 'vitest';
import { HELP_PRESETS, canUseHelp, remainingHelp } from '../src/help.ts';
import { PuzzleSession } from '../src/session.ts';

function makeSession(preset: 'casual' | 'desafio' = 'casual'): PuzzleSession {
  return new PuzzleSession({
    appId: 'test',
    puzzleId: 'arcade',
    phaseId: 'phase-1',
    imageSrc: '/puzzles/test.png',
    imageWidth: 800,
    imageHeight: 600,
    pieceCount: 12,
    seed: 9,
    helpPreset: preset,
    timerEnabled: false,
  });
}

describe('prévia parcial', () => {
  it('revela um recorte de peças e respeita o limite casual', () => {
    const session = makeSession('casual');
    const ids = session.peekPartial(1_000);
    expect(ids.length).toBeGreaterThanOrEqual(2);
    expect(session.partialPeek?.pieceIds).toEqual(ids);
    expect(ids.every((id) => session.generation.pieces.some((piece) => piece.id === id))).toBe(
      true,
    );
    expect(session.helpUsed.partialPeek).toBe(1);
    expect(remainingHelp(session.helpLimits, session.helpUsed).partialPeek).toBe(
      HELP_PRESETS.casual.partialPeek - 1,
    );

    session.tick(1_000 + 5_000);
    expect(session.partialPeek).toBeNull();
  });

  it('no preset desafio só permite uma prévia', () => {
    const session = makeSession('desafio');
    expect(session.peekPartial(10).length).toBeGreaterThan(0);
    expect(session.peekPartial(20)).toEqual([]);
    expect(canUseHelp(session.helpLimits, session.helpUsed, 'partialPeek')).toBe(false);
  });

  it('não revela prévia com a partida pausada ou concluída', () => {
    const session = makeSession('casual');
    session.pause();
    expect(session.peekPartial(1)).toEqual([]);
    session.resume();
    for (const piece of [...session.pieces]) {
      session.placePieceById(piece.id);
    }
    expect(session.completed).toBe(true);
    expect(session.peekPartial(2)).toEqual([]);
  });
});
