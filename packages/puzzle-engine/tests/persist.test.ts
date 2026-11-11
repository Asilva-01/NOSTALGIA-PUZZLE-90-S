import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, normalizeSettings, PersistStore } from '../src/persist.ts';
import { PuzzleSession } from '../src/session.ts';
import { applyCompletion, buildPhaseTable } from '../src/progression.ts';

describe('salvar e recuperar', () => {
  it('grava a partida e restaura posições, tempo e ajuda', async () => {
    const store = new PersistStore('nostalgia-90');
    const session = new PuzzleSession({
      appId: 'nostalgia-90',
      puzzleId: 'arcade-neon',
      phaseId: 'phase-1',
      imageSrc: '/puzzles/arcade.png',
      imageWidth: 800,
      imageHeight: 600,
      pieceCount: 12,
      seed: 33,
    });
    const piece = session.pieces[3];
    if (!piece) throw new Error('peça');
    session.placePieceById(piece.id);
    const neighbor = session.pieces.find(
      (item) => item.id !== piece.id && Math.abs(item.row - piece.row) + Math.abs(item.col - piece.col) === 1,
    );
    if (neighbor) {
      session.movePiece(
        neighbor.id,
        neighbor.bounds.x + 400,
        neighbor.bounds.y + 280,
      );
    }
    session.elapsedMs = 12_500;
    session.helpUsed.highlight = 1;
    session.helpUsed.partialPeek = 1;
    await store.saveSession(session.toSaved());

    const loaded = await store.loadSession();
    expect(loaded).not.toBeNull();
    const restored = new PuzzleSession(
      {
        appId: 'nostalgia-90',
        puzzleId: 'arcade-neon',
        phaseId: 'phase-1',
        imageSrc: '/puzzles/arcade.png',
        imageWidth: 800,
        imageHeight: 600,
        pieceCount: 12,
        seed: 33,
      },
      loaded ?? undefined,
    );
    expect(restored.pieceById(piece.id).placed).toBe(true);
    expect(restored.elapsedMs).toBe(12_500);
    expect(restored.helpUsed.highlight).toBe(1);
    expect(restored.helpUsed.partialPeek).toBe(1);
    expect(restored.unplacedPieces()).toHaveLength(11);
    expect(restored.pieceById(piece.id).groupId).toBe(piece.id);
  });

  it('persiste progresso da campanha', async () => {
    const store = new PersistStore('bible-puzzle');
    const phases = buildPhaseTable(['ark']);
    const phase = phases[0];
    if (!phase) throw new Error('fase');
    const progress = applyCompletion(await store.loadProgress(), phase, 3, 900, 8000);
    await store.saveProgress(progress);
    const again = await store.loadProgress();
    expect(again.unlockedPhaseIds).toContain('phase-2');
    expect(again.stars['phase-1']).toBe(3);
  });

  it('liga o som por padrão e migra o default antigo mudo', () => {
    expect(DEFAULT_SETTINGS.soundEnabled).toBe(true);
    expect(normalizeSettings().soundEnabled).toBe(true);
    expect(
      normalizeSettings({
        helpPreset: 'casual',
        timerEnabled: true,
        reducedMotion: false,
        soundEnabled: false,
      }).soundEnabled,
    ).toBe(true);
    expect(
      normalizeSettings({
        helpPreset: 'casual',
        timerEnabled: true,
        reducedMotion: false,
        soundEnabled: false,
        soundChoiceMade: true,
      }).soundEnabled,
    ).toBe(false);
  });

  it('grava a escolha explícita de som', async () => {
    const store = new PersistStore('nostalgia-90');
    await store.saveSettings({
      ...DEFAULT_SETTINGS,
      soundEnabled: false,
      soundChoiceMade: true,
    });
    const loaded = await store.loadSettings();
    expect(loaded.soundEnabled).toBe(false);
    expect(loaded.soundChoiceMade).toBe(true);
  });
});
