import type { PieceCount, PhaseDefinition, ProgressState } from './types.ts';
import { emptyProgress } from './persist.ts';

export const PHASE_BANDS: Array<{
  from: number;
  to: number;
  pieceCount: PieceCount;
}> = [
  { from: 1, to: 10, pieceCount: 12 },
  { from: 11, to: 25, pieceCount: 24 },
  { from: 26, to: 50, pieceCount: 48 },
  { from: 51, to: 80, pieceCount: 72 },
  { from: 81, to: 120, pieceCount: 96 },
  { from: 121, to: 160, pieceCount: 150 },
  { from: 161, to: 200, pieceCount: 200 },
];

export const PLAYABLE_COUNTS: PieceCount[] = [12, 24, 48];

export function pieceCountForPhase(phaseNumber: number): PieceCount {
  const band = PHASE_BANDS.find(
    (item) => phaseNumber >= item.from && phaseNumber <= item.to,
  );
  if (!band) {
    throw new Error(`Fase fora da tabela: ${phaseNumber}`);
  }
  return band.pieceCount;
}

export function buildPhaseTable(puzzleIds: string[]): PhaseDefinition[] {
  if (puzzleIds.length === 0) {
    throw new Error('Catálogo vazio: não é possível montar a tabela de fases');
  }
  const phases: PhaseDefinition[] = [];
  for (let number = 1; number <= 200; number += 1) {
    const puzzleId = puzzleIds[(number - 1) % puzzleIds.length];
    if (!puzzleId) {
      throw new Error('Id de puzzle ausente na tabela de fases');
    }
    phases.push({
      id: `phase-${number}`,
      number,
      pieceCount: pieceCountForPhase(number),
      puzzleId,
    });
  }
  return phases;
}

export function isUnlocked(progress: ProgressState, phaseId: string): boolean {
  return progress.unlockedPhaseIds.includes(phaseId);
}

export function applyCompletion(
  progress: ProgressState,
  phase: PhaseDefinition,
  stars: number,
  score: number,
  elapsedMs: number,
): ProgressState {
  const completed = new Set(progress.completedPhaseIds);
  completed.add(phase.id);
  const unlocked = new Set(progress.unlockedPhaseIds);
  unlocked.add(phase.id);
  if (phase.number < 200) {
    unlocked.add(`phase-${phase.number + 1}`);
  }
  const previousStars = progress.stars[phase.id] ?? 0;
  const previousScore = progress.bestScores[phase.id] ?? 0;
  return {
    ...progress,
    completedPhaseIds: [...completed],
    unlockedPhaseIds: [...unlocked],
    stars: {
      ...progress.stars,
      [phase.id]: Math.max(previousStars, stars),
    },
    bestScores: {
      ...progress.bestScores,
      [phase.id]: Math.max(previousScore, score),
    },
    stats: {
      completedGames: progress.stats.completedGames + 1,
      totalTimeMs: progress.stats.totalTimeMs + elapsedMs,
    },
  };
}

export function ensureProgress(appId: string, current?: ProgressState | null): ProgressState {
  if (!current) {
    return emptyProgress(appId);
  }
  if (!current.unlockedPhaseIds.includes('phase-1')) {
    return { ...current, unlockedPhaseIds: ['phase-1', ...current.unlockedPhaseIds] };
  }
  return current;
}

export function phaseById(
  phases: PhaseDefinition[],
  phaseId: string,
): PhaseDefinition | undefined {
  return phases.find((phase) => phase.id === phaseId);
}

export function canPlayPieceCount(count: PieceCount, progress: ProgressState): boolean {
  if (count === 12) return true;
  if (count === 24) {
    return progress.unlockedPhaseIds.includes('phase-11') || progress.completedPhaseIds.length >= 10;
  }
  if (count === 48) {
    return progress.unlockedPhaseIds.includes('phase-26') || progress.completedPhaseIds.length >= 25;
  }
  const band = PHASE_BANDS.find((item) => item.pieceCount === count);
  if (!band) return false;
  return progress.unlockedPhaseIds.includes(`phase-${band.from}`);
}

/**
 * Na primeira entrega, 12 e 24 (e 48 se o motor estiver pronto) ficam
 * jogáveis no item do catálogo sem exigir 10/25 fases — o motor precisa
 * ser testável. A campanha continua fase a fase.
 */
export function practiceCounts(): PieceCount[] {
  return PLAYABLE_COUNTS;
}
