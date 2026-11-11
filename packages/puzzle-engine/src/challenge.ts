import type { PieceCount } from './types.ts';

/** Par das 3 estrelas em `computeStars`: pieceCount * 6000 ms. */
export const STAR_PAR_MS_PER_PIECE = 6_000;

/**
 * Tempo limite do preset Desafio: 9 segundos por peça.
 *
 * Mais folgado que o par das 3 estrelas (6 s/peça), na faixa pedida de 8–10 s.
 * 9 s = 1,5× o par: desafio de verdade, não armadilha.
 *
 * - 12 peças → 1:48 (3★ em 1:12)
 * - 24 peças → 3:36 (3★ em 2:24)
 * - 48 peças → 7:12 (3★ em 4:48)
 */
export const CHALLENGE_LIMIT_MS_PER_PIECE = 9_000;

export function challengeTimeLimitMs(pieceCount: PieceCount): number {
  return pieceCount * CHALLENGE_LIMIT_MS_PER_PIECE;
}

export function remainingChallengeMs(elapsedMs: number, pieceCount: PieceCount): number {
  return Math.max(0, challengeTimeLimitMs(pieceCount) - elapsedMs);
}

export function isChallengeTimedOut(elapsedMs: number, pieceCount: PieceCount): boolean {
  return elapsedMs >= challengeTimeLimitMs(pieceCount);
}
