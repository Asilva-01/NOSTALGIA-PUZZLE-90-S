import { STAR_PAR_MS_PER_PIECE } from './challenge.ts';
import { countHintUses } from './help.ts';
import type { HelpUsage, PieceCount } from './types.ts';

export type ScoreInput = {
  pieceCount: PieceCount;
  elapsedMs: number;
  helpUsed: HelpUsage;
};

export function computeScore(input: ScoreInput): number {
  const base = input.pieceCount * 50;
  const parMs = input.pieceCount * 4000;
  const timeBonus = Math.max(0, Math.round((parMs - input.elapsedMs) / 100));
  const hintPenalty = countHintUses(input.helpUsed) * 40;
  const shufflePenalty = input.helpUsed.shuffle * 15;
  return Math.max(0, base + timeBonus - hintPenalty - shufflePenalty);
}

export function computeStars(input: ScoreInput): 1 | 2 | 3 {
  const hintUses = countHintUses(input.helpUsed);
  const parMs = input.pieceCount * STAR_PAR_MS_PER_PIECE;
  if (hintUses === 0 && input.elapsedMs <= parMs) {
    return 3;
  }
  if (hintUses <= 2) {
    return 2;
  }
  return 1;
}
