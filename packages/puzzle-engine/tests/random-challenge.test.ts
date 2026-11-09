import { describe, expect, it } from 'vitest';
import { emptyProgress } from '../src/persist.ts';
import { applyCompletion, buildPhaseTable } from '../src/progression.ts';
import { pickRandomChallenge, rememberRandom } from '../src/random-challenge.ts';

describe('modo aleatório', () => {
  it('sorteia só fases desbloqueadas e válidas, evitando repetição imediata', () => {
    const phases = buildPhaseTable(['ok', 'broken']);
    const valid = new Set(['ok']);
    let progress = emptyProgress('n');
    const first = pickRandomChallenge(phases, progress, valid, 1);
    expect(first?.phase.id).toBe('phase-1');
    expect(first?.phase.puzzleId).toBe('ok');

    const phase1 = phases[0];
    const phase2 = phases[1];
    if (!phase1 || !phase2) throw new Error('fases');
    progress = applyCompletion(progress, phase1, 2, 10, 1000);
    progress = rememberRandom(progress, 'phase-1');

    const next = pickRandomChallenge(phases, progress, valid, 99);
    expect(next).not.toBeNull();
    expect(valid.has(next?.phase.puzzleId ?? '')).toBe(true);
    expect(next?.phase.id).not.toBe('phase-2');
    if (next && ['phase-1', 'phase-3'].includes(next.phase.id) === false) {
      // phase-3 still locked; only phase-1 is valid+unlocked besides locked ones
    }
    expect(next?.phase.id).toBe('phase-1');
  });

  it('evita o último id quando há alternativa desbloqueada e válida', () => {
    const phases = buildPhaseTable(['ok']);
    let progress = emptyProgress('n');
    const p1 = phases[0];
    const p2 = phases[1];
    if (!p1 || !p2) throw new Error('fases');
    progress = applyCompletion(progress, p1, 2, 10, 1);
    progress = rememberRandom(progress, 'phase-1');
    const pick = pickRandomChallenge(phases, progress, new Set(['ok']), 3);
    expect(pick?.phase.id).toBe('phase-2');
    expect(pick?.reason).toBe('avoided-repeat');
  });
});
