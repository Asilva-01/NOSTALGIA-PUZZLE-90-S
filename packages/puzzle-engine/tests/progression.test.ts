import { describe, expect, it } from 'vitest';
import {
  applyCompletion,
  buildPhaseTable,
  isUnlocked,
  pieceCountForPhase,
} from '../src/progression.ts';
import { emptyProgress } from '../src/persist.ts';

describe('progressão', () => {
  it('segue a tabela de fases da especificação', () => {
    expect(pieceCountForPhase(1)).toBe(12);
    expect(pieceCountForPhase(10)).toBe(12);
    expect(pieceCountForPhase(11)).toBe(24);
    expect(pieceCountForPhase(25)).toBe(24);
    expect(pieceCountForPhase(26)).toBe(48);
    expect(pieceCountForPhase(51)).toBe(72);
    expect(pieceCountForPhase(81)).toBe(96);
    expect(pieceCountForPhase(121)).toBe(150);
    expect(pieceCountForPhase(161)).toBe(200);
    expect(pieceCountForPhase(200)).toBe(200);
  });

  it('desbloqueia a próxima fase, guarda estrelas e permite voltar', () => {
    const phases = buildPhaseTable(['ark', 'arcade']);
    expect(phases).toHaveLength(200);
    expect(phases[0]?.puzzleId).toBe('ark');
    expect(phases[1]?.puzzleId).toBe('arcade');

    let progress = emptyProgress('bible');
    expect(isUnlocked(progress, 'phase-1')).toBe(true);
    expect(isUnlocked(progress, 'phase-2')).toBe(false);

    const phase1 = phases[0];
    if (!phase1) throw new Error('fase 1');
    progress = applyCompletion(progress, phase1, 3, 800, 12_000);
    expect(isUnlocked(progress, 'phase-2')).toBe(true);
    expect(progress.stars['phase-1']).toBe(3);
    expect(isUnlocked(progress, 'phase-1')).toBe(true);

    progress = applyCompletion(progress, phase1, 1, 100, 40_000);
    expect(progress.stars['phase-1']).toBe(3);
    expect(progress.bestScores['phase-1']).toBe(800);
  });
});
