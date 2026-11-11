import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogEntry } from '@puzzle-universe/content-manager';
import {
  PersistStore,
  PLAYABLE_COUNTS,
  applyCompletion,
  buildPhaseTable,
  emptyProgress,
  ensureProgress,
  nextPlayablePhase,
  nextPracticeCount,
  pickRandomChallenge,
  pickSurpriseChallenge,
  practiceCounts,
  rememberRandom,
  type AppSettings,
  type PieceCount,
  type ProgressState,
  type SavedSession,
} from '@puzzle-universe/puzzle-engine';
import { CompleteView } from './components/CompleteView.tsx';
import { HomeView } from './components/HomeView.tsx';
import { PlayView } from './components/PlayView.tsx';
import { UpdateBanner } from './components/UpdateBanner.tsx';
import { applyUpdate, registerPwa } from './pwa.ts';
import type { PlayTarget, ProductConfig } from './types.ts';

type Route =
  | { name: 'home' }
  | { name: 'play'; target: PlayTarget }
  | {
      name: 'complete';
      stars: 1 | 2 | 3;
      score: number;
      elapsedMs: number;
      target: PlayTarget;
      next: PlayTarget | null;
    };

export function AppRoot({ config }: { config: ProductConfig }) {
  const persist = useMemo(() => new PersistStore(config.appId), [config.appId]);
  const phases = useMemo(
    () => buildPhaseTable(config.catalog.puzzles.map((item) => item.id)),
    [config.catalog.puzzles],
  );
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [progress, setProgress] = useState<ProgressState>(() => emptyProgress(config.appId));
  const [settings, setSettings] = useState<AppSettings>({
    helpPreset: 'casual',
    timerEnabled: true,
    reducedMotion: false,
    soundEnabled: false,
  });
  const [saved, setSaved] = useState<SavedSession | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [ready, setReady] = useState(false);
  const bootedQuery = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.theme = config.theme;
  }, [config.theme]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [nextProgress, nextSettings, nextSaved] = await Promise.all([
        persist.loadProgress(),
        persist.loadSettings(),
        persist.loadSession(),
      ]);
      if (!alive) return;
      setProgress(ensureProgress(config.appId, nextProgress));
      setSettings(nextSettings);
      setSaved(nextSaved);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [config.appId, persist]);

  useEffect(() => {
    if (navigator.webdriver) {
      return undefined;
    }
    return registerPwa(() => setUpdateReady(true));
  }, []);

  useEffect(() => {
    if (!ready || bootedQuery.current) return;
    const play = new URLSearchParams(window.location.search).get('play');
    if (play !== '12' && play !== '24' && play !== '48') return;
    const puzzle = config.catalog.puzzles[0];
    if (!puzzle) return;
    bootedQuery.current = true;
    setRoute({
      name: 'play',
      target: {
        puzzle,
        pieceCount: Number(play) as PieceCount,
        phaseId: null,
        seed: 2026,
      },
    });
  }, [config.catalog.puzzles, ready]);

  const puzzleById = useCallback(
    (id: string): CatalogEntry => {
      const found = config.catalog.puzzles.find((item) => item.id === id);
      if (!found) {
        throw new Error(`Puzzle ${id} não está no catálogo`);
      }
      return found;
    },
    [config.catalog.puzzles],
  );

  const startPlay = useCallback(
    async (target: PlayTarget) => {
      if (saved && !(saved.puzzleId === target.puzzle.id && saved.pieceCount === target.pieceCount && saved.phaseId === target.phaseId)) {
        // Preserva a partida interrompida: não apaga; a nova vira a corrente após confirmação implícita de troca.
        // A anterior já está no IndexedDB até ser substituída — gravamos só ao iniciar de fato.
      }
      setRoute({ name: 'play', target });
    },
    [saved],
  );

  const onRandom = useCallback(async () => {
    const valid = new Set(config.catalog.puzzles.map((item) => item.id));
    const pick = pickRandomChallenge(phases, progress, valid);
    if (!pick) return;
    const next = rememberRandom(progress, pick.phase.id);
    setProgress(next);
    await persist.saveProgress(next);
    await startPlay({
      puzzle: puzzleById(pick.phase.puzzleId),
      pieceCount: pick.phase.pieceCount,
      phaseId: pick.phase.id,
      seed: Date.now() % 1_000_000,
    });
  }, [config.catalog.puzzles, persist, phases, progress, puzzleById, startPlay]);

  const onSurprise = useCallback(async () => {
    const valid = new Set(config.catalog.puzzles.map((item) => item.id));
    const pick = pickSurpriseChallenge(
      phases,
      progress,
      valid,
      config.catalog.puzzles.map((item) => ({
        id: item.id,
        difficulty: item.difficulty,
        recommendedLevel: item.recommendedLevel,
      })),
    );
    if (!pick) return;
    const next = rememberRandom(progress, pick.phase.id);
    setProgress(next);
    await persist.saveProgress(next);
    await startPlay({
      puzzle: puzzleById(pick.phase.puzzleId),
      pieceCount: pick.phase.pieceCount,
      phaseId: pick.phase.id,
      seed: Date.now() % 1_000_000,
    });
  }, [config.catalog.puzzles, persist, phases, progress, puzzleById, startPlay]);

  const resolveNextTarget = useCallback(
    (target: PlayTarget): PlayTarget | null => {
      if (target.phaseId) {
        const phase = phases.find((item) => item.id === target.phaseId);
        if (!phase) return null;
        const nextPhase = nextPlayablePhase(phase, phases);
        if (!nextPhase) return null;
        return {
          puzzle: puzzleById(nextPhase.puzzleId),
          pieceCount: nextPhase.pieceCount,
          phaseId: nextPhase.id,
          seed: Date.now() % 1_000_000,
        };
      }
      const nextCount = nextPracticeCount(target.pieceCount);
      if (!nextCount) return null;
      return {
        puzzle: target.puzzle,
        pieceCount: nextCount,
        phaseId: null,
        seed: Date.now() % 1_000_000,
      };
    },
    [phases, puzzleById],
  );

  const onComplete = useCallback(
    async (payload: { stars: 1 | 2 | 3; score: number; elapsedMs: number; target: PlayTarget }) => {
      let next = progress;
      if (payload.target.phaseId) {
        const phase = phases.find((item) => item.id === payload.target.phaseId);
        if (phase) {
          next = applyCompletion(progress, phase, payload.stars, payload.score, payload.elapsedMs);
          setProgress(next);
          await persist.saveProgress(next);
        }
      }
      await persist.clearSession();
      setSaved(null);
      setRoute({ name: 'complete', ...payload, next: resolveNextTarget(payload.target) });
    },
    [persist, phases, progress, resolveNextTarget],
  );

  const resume = useCallback(() => {
    if (!saved) return;
    startPlay({
      puzzle: puzzleById(saved.puzzleId),
      pieceCount: saved.pieceCount,
      phaseId: saved.phaseId,
      seed: saved.seed,
    });
  }, [puzzleById, saved, startPlay]);

  const saveSettings = async (next: AppSettings) => {
    setSettings(next);
    await persist.saveSettings(next);
  };

  if (!ready) {
    return (
      <div className="app-shell">
        <p className="hud-stat" style={{ padding: '2rem' }}>
          Carregando…
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      {updateReady ? <UpdateBanner onRefresh={() => void applyUpdate()} /> : null}
      <main id="conteudo">
        {route.name === 'home' ? (
          <HomeView
            config={config}
            progress={progress}
            phases={phases}
            settings={settings}
            saved={saved}
            onResume={resume}
            onSettings={saveSettings}
            onRandom={() => void onRandom()}
            onSurprise={() => void onSurprise()}
            onPlayPhase={(phase) =>
              void startPlay({
                puzzle: puzzleById(phase.puzzleId),
                pieceCount: phase.pieceCount,
                phaseId: phase.id,
                seed: Date.now() % 1_000_000,
              })
            }
            onPractice={(pieceCount: PieceCount) => {
              const puzzle = config.catalog.puzzles[0];
              if (!puzzle) return;
              void startPlay({
                puzzle,
                pieceCount,
                phaseId: null,
                seed: Date.now() % 1_000_000,
              });
            }}
          />
        ) : null}
        {route.name === 'play' ? (
          <PlayView
            config={config}
            target={route.target}
            persist={persist}
            settings={settings}
            saved={
              saved &&
              saved.puzzleId === route.target.puzzle.id &&
              saved.pieceCount === route.target.pieceCount &&
              saved.phaseId === route.target.phaseId
                ? saved
                : null
            }
            onExit={async (session) => {
              if (session && !session.completed) {
                await persist.saveSession(session);
                setSaved(session);
              }
              setRoute({ name: 'home' });
            }}
            onComplete={onComplete}
            onSettings={saveSettings}
          />
        ) : null}
        {route.name === 'complete' ? (
          <CompleteView
            config={config}
            stars={route.stars}
            score={route.score}
            elapsedMs={route.elapsedMs}
            onHome={() => setRoute({ name: 'home' })}
            onReplay={() => void startPlay(route.target)}
            onNext={route.next ? () => void startPlay(route.next as PlayTarget) : undefined}
          />
        ) : null}
      </main>
    </div>
  );
}

export { PLAYABLE_COUNTS, practiceCounts };
