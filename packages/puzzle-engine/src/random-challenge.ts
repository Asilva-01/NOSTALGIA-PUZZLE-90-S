import { mulberry32 } from '@puzzle-universe/shared-utils';
import type { PhaseDefinition, ProgressState } from './types.ts';
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

export function rememberRandom(progress: ProgressState, phaseId: string): ProgressState {
  const history = [...progress.randomHistory, phaseId].slice(-40);
  return {
    ...progress,
    lastRandomId: phaseId,
    randomHistory: history,
  };
}
