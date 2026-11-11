import { describe, expect, it } from 'vitest';
import {
  CHALLENGE_LIMIT_MS_PER_PIECE,
  STAR_PAR_MS_PER_PIECE,
  challengeTimeLimitMs,
  isChallengeTimedOut,
  remainingChallengeMs,
} from '../src/challenge.ts';
import { emptyProgress } from '../src/persist.ts';
import { applyCompletion, buildPhaseTable } from '../src/progression.ts';
import { PuzzleSession } from '../src/session.ts';
import type { PieceCount } from '../src/types.ts';

function makeSession(
  preset: 'casual' | 'desafio',
  pieceCount: PieceCount = 12,
  timerEnabled = true,
): PuzzleSession {
  return new PuzzleSession({
    appId: 'test',
    puzzleId: 'arcade',
    phaseId: 'phase-1',
    imageSrc: '/puzzles/test.png',
    imageWidth: 800,
    imageHeight: 600,
    pieceCount,
    seed: 21,
    helpPreset: preset,
    timerEnabled,
  });
}

describe('tempo limite do Desafio', () => {
  it('usa 9 s por peça, mais folgado que o par das 3 estrelas', () => {
    expect(CHALLENGE_LIMIT_MS_PER_PIECE).toBe(9_000);
    expect(CHALLENGE_LIMIT_MS_PER_PIECE).toBeGreaterThan(STAR_PAR_MS_PER_PIECE);
    expect(CHALLENGE_LIMIT_MS_PER_PIECE).toBeGreaterThanOrEqual(8_000);
    expect(CHALLENGE_LIMIT_MS_PER_PIECE).toBeLessThanOrEqual(10_000);

    const counts: PieceCount[] = [12, 24, 48];
    for (const pieceCount of counts) {
      const limit = challengeTimeLimitMs(pieceCount);
      const starPar = pieceCount * STAR_PAR_MS_PER_PIECE;
      expect(limit).toBe(pieceCount * 9_000);
      expect(limit).toBeGreaterThan(starPar);
      expect(limit / pieceCount).toBeGreaterThanOrEqual(8_000);
      expect(limit / pieceCount).toBeLessThanOrEqual(10_000);
    }

    expect(challengeTimeLimitMs(12)).toBe(108_000);
    expect(challengeTimeLimitMs(24)).toBe(216_000);
    expect(challengeTimeLimitMs(48)).toBe(432_000);
    expect(remainingChallengeMs(8_000, 12)).toBe(100_000);
    expect(isChallengeTimedOut(107_999, 12)).toBe(false);
    expect(isChallengeTimedOut(108_000, 12)).toBe(true);
  });

  it('falha a partida no Desafio quando o tempo acaba e permite retry sem concluir a fase', () => {
    const session = makeSession('desafio', 12, false);
    expect(session.timeLimitMs).toBe(108_000);
    expect(session.tracksElapsedTime()).toBe(true);

    session.tick(1_000);
    session.tick(1_000 + 108_000);
    expect(session.failed).toBe(true);
    expect(session.completed).toBe(false);
    expect(session.paused).toBe(true);
    expect(session.score).toBe(0);

    const placed = session.pieces.filter((piece) => piece.placed).length;
    session.resume();
    expect(session.paused).toBe(true);
    expect(session.failed).toBe(true);
    expect(session.pieces.filter((piece) => piece.placed).length).toBe(placed);

    const progress = emptyProgress('test');
    expect(progress.completedPhaseIds).toEqual([]);
    expect(progress.unlockedPhaseIds).toEqual(['phase-1']);
  });

  it('no Casual não perde por tempo, mesmo com o cronômetro ligado e muito elapsed', () => {
    const session = makeSession('casual', 12, true);
    expect(session.timeLimitMs).toBeNull();
    session.tick(10);
    session.elapsedMs = 999_999;
    session.tick(20);
    expect(session.failed).toBe(false);
    expect(session.completed).toBe(false);
  });

  it('concluir no Desafio antes do limite não marca derrota', () => {
    const session = makeSession('desafio', 12, true);
    session.elapsedMs = 20_000;
    for (const piece of [...session.pieces]) {
      session.placePieceById(piece.id);
    }
    expect(session.completed).toBe(true);
    expect(session.failed).toBe(false);
    expect(session.score).toBeGreaterThan(0);

    const phases = buildPhaseTable(['arcade']);
    const phase = phases[0];
    if (!phase) throw new Error('fase');
    const progress = applyCompletion(emptyProgress('test'), phase, 3, session.score, session.elapsedMs);
    expect(progress.completedPhaseIds).toContain('phase-1');
  });

  it('desligar o cronômetro no Desafio não desliga a derrota por tempo', () => {
    const session = makeSession('desafio', 12, true);
    session.setTimerEnabled(false);
    expect(session.timerEnabled).toBe(false);
    expect(session.tracksElapsedTime()).toBe(true);
    session.tick(5);
    session.elapsedMs = challengeTimeLimitMs(12);
    session.tick(25);
    expect(session.failed).toBe(true);
    expect(session.completed).toBe(false);
  });
});
