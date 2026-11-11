import { mulberry32 } from '@puzzle-universe/shared-utils';
import type { PhaseDefinition, PieceCount, ProgressState } from './types.ts';
import { isUnlocked } from './progression.ts';

export type RandomPick = {
  phase: PhaseDefinition;
  reason: 'only-option' | 'avoided-repeat' | 'picked';
};

export function eligiblePhases(
  phases: PhaseDefinition[],
  progress: ProgressState,
  validPuzzleIds: Set<string>,
): PhaseDefinition[] {
  return phases.filter(
    (phase) => isUnlocked(progress, phase.id) && validPuzzleIds.has(phase.puzzleId),
  );
}

export function pickRandomChallenge(
  phases: PhaseDefinition[],
  progress: ProgressState,
  validPuzzleIds: Set<string>,
  seed = Date.now(),
): RandomPick | null {
  const eligible = eligiblePhases(phases, progress, validPuzzleIds);
  if (eligible.length === 0) {
    return null;
  }
  const last = progress.lastRandomId;
  const withoutLast =
    last && eligible.length > 1
      ? eligible.filter((phase) => phase.id !== last)
      : eligible;
  const pool = withoutLast.length > 0 ? withoutLast : eligible;
  const rng = mulberry32(seed >>> 0);
  const index = Math.floor(rng() * pool.length);
  const phase = pool[index];
  if (!phase) {
    return null;
  }
  let reason: RandomPick['reason'] = 'picked';
  if (eligible.length === 1) {
    reason = 'only-option';
  } else if (last && phase.id !== last) {
    reason = 'avoided-repeat';
  }
  return { phase, reason };
}

export type SurpriseMeta = {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  recommendedLevel: number;
};

export function currentPlayerLevel(progress: ProgressState): number {
  const nums = progress.unlockedPhaseIds
    .map((id) => Number.parseInt(id.replace('phase-', ''), 10))
    .filter((value) => Number.isFinite(value) && value > 0);
  return nums.length === 0 ? 1 : Math.max(...nums);
}

export function difficultyForPieceCount(
  count: PieceCount,
): SurpriseMeta['difficulty'] {
  if (count <= 12) return 'easy';
  if (count <= 24) return 'medium';
  if (count <= 48) return 'hard';
  return 'expert';
}

/**
 * Escolhe imagem + dificuldade perto do nível atual, só desbloqueadas,
 * sem repetir o último sorteio quando há alternativa.
 */
export function pickSurpriseChallenge(
  phases: PhaseDefinition[],
  progress: ProgressState,
  validPuzzleIds: Set<string>,
  puzzles: readonly SurpriseMeta[],
  seed = Date.now(),
): RandomPick | null {
  const eligible = eligiblePhases(phases, progress, validPuzzleIds);
  if (eligible.length === 0) {
    return null;
  }
  const level = currentPlayerLevel(progress);
  const current = phases.find((phase) => phase.number === level) ?? eligible[0];
  const targetCount = current?.pieceCount ?? 12;
  const targetDiff = difficultyForPieceCount(targetCount);
  const byId = new Map(puzzles.map((puzzle) => [puzzle.id, puzzle]));
  const last = progress.lastRandomId;

  const ranked = eligible.map((phase) => {
    const puzzle = byId.get(phase.puzzleId);
    let score = 0;
    if (phase.pieceCount === targetCount) score += 5;
    else if (Math.abs(phase.pieceCount - targetCount) <= 12) score += 1;
    if (puzzle?.difficulty === targetDiff) score += 4;
    if (puzzle && Math.abs(puzzle.recommendedLevel - level) <= 4) score += 3;
    if (Math.abs(phase.number - level) <= 8) score += 2;
    if (last && phase.id === last && eligible.length > 1) score -= 50;
    return { phase, score };
  });
  const best = ranked.reduce((max, item) => Math.max(max, item.score), Number.NEGATIVE_INFINITY);
  const pool = ranked.filter((item) => item.score >= best - 2);
  const rng = mulberry32(seed >>> 0);
  const choice = pool[Math.floor(rng() * pool.length)] ?? ranked[0];
  if (!choice) {
    return null;
  }
  let reason: RandomPick['reason'] = 'picked';
  if (eligible.length === 1) {
    reason = 'only-option';
  } else if (last && choice.phase.id !== last) {
    reason = 'avoided-repeat';
  }
  return { phase: choice.phase, reason };
}

export function rememberRandom(progress: ProgressState, phaseId: string): ProgressState {
  const history = [...progress.randomHistory, phaseId].slice(-40);
  return {
    ...progress,
    lastRandomId: phaseId,
    randomHistory: history,
  };
}
