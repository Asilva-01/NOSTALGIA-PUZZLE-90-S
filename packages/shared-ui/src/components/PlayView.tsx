import { useEffect, useRef, useState } from 'react';
import {
  HELP_PRESETS,
  PuzzleRenderer,
  PuzzleSession,
  formatHelpLimit,
  remainingHelp,
  type AppSettings,
  type PersistStore,
  type SavedSession,
} from '@puzzle-universe/puzzle-engine';
import { formatElapsed } from '@puzzle-universe/shared-utils';
import type { PlayTarget, ProductConfig } from '../types.ts';

type Props = {
  config: ProductConfig;
  target: PlayTarget;
  persist: PersistStore;
  settings: AppSettings;
  saved: SavedSession | null;
  onExit: (session: SavedSession | null) => Promise<void>;
  onComplete: (payload: {
    stars: 1 | 2 | 3;
    score: number;
    elapsedMs: number;
    target: PlayTarget;
  }) => void;
  onSettings: (settings: AppSettings) => void;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Falha ao carregar ${url}`));
    image.src = url;
  });
}

export function PlayView({
  config,
  target,
  persist,
  settings,
  saved,
  onExit,
  onComplete,
  onSettings,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<PuzzleSession | null>(null);
  const rendererRef = useRef<PuzzleRenderer | null>(null);
  const [hud, setHud] = useState({
    elapsed: 0,
    score: 0,
    placed: 0,
    total: target.pieceCount as number,
    paused: false,
    remaining: HELP_PRESETS[settings.helpPreset],
  });
  const [peek, setPeek] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const savedOnMount = useRef(saved);

  useEffect(() => {
    sessionRef.current?.setTimerEnabled(settings.timerEnabled);
  }, [settings.timerEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cancelled = false;
    const imageUrl = config.assetUrl(target.puzzle.image.src);
    const initialSaved = savedOnMount.current;

    void (async () => {
      try {
        const image = await loadImage(imageUrl);
        if (cancelled) return;
        const session = new PuzzleSession(
          {
            appId: config.appId,
            puzzleId: target.puzzle.id,
            phaseId: target.phaseId,
            imageSrc: target.puzzle.image.src,
            imageWidth: target.puzzle.image.width,
            imageHeight: target.puzzle.image.height,
            pieceCount: target.pieceCount,
            seed: initialSaved?.seed ?? target.seed,
            helpPreset: settings.helpPreset,
            timerEnabled: settings.timerEnabled,
          },
          initialSaved ?? undefined,
        );
        sessionRef.current = session;
        const renderer = new PuzzleRenderer({
          canvas,
          session,
          image,
          persist: () => {
            void persist.saveSession(session.toSaved());
          },
          onChange: () => refresh(session),
          onComplete: () => {
            refresh(session);
            completeRef.current({
              stars: session.stars(),
              score: session.score,
              elapsedMs: session.elapsedMs,
              target,
            });
          },
        });
        rendererRef.current = renderer;
        renderer.start();
        refresh(session);
        setBusy(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao abrir o puzzle');
        setBusy(false);
      }
    })();

    const interval = window.setInterval(() => {
      const current = sessionRef.current;
      if (current) refresh(current);
    }, 250);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      rendererRef.current?.destroy();
      rendererRef.current = null;
      sessionRef.current = null;
    };
    // A partida só remonta se o desafio mudar, não se o cronômetro for ligado/desligado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.appId, persist, target.phaseId, target.pieceCount, target.puzzle, target.seed]);

  function refresh(session: PuzzleSession) {
    setHud({
      elapsed: session.elapsedMs,
      score: session.score,
      placed: session.pieces.filter((piece) => piece.placed).length,
      total: session.pieces.length,
      paused: session.paused && !session.completed,
      remaining: remainingHelp(session.helpLimits, session.helpUsed),
    });
  }

  const session = () => sessionRef.current;

  return (
    <div className="play-root">
      <header className="play-hud">
        <button
          type="button"
          className="icon-btn"
          aria-label="Voltar e salvar"
          onClick={() => void onExit(session()?.toSaved() ?? null)}
        >
          Voltar
        </button>
        <strong title={target.puzzle.name}>{target.puzzle.name}</strong>
        <span className="hud-stat">{target.pieceCount}p</span>
        {settings.timerEnabled ? (
          <span className="hud-stat" aria-live="polite">
            {formatElapsed(hud.elapsed)}
          </span>
        ) : (
          <span className="hud-stat">cronômetro off</span>
        )}
        <span className="hud-stat">
          {hud.placed}/{hud.total}
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            const current = session();
            if (!current) return;
            if (current.paused) current.resume();
            else current.pause();
            refresh(current);
            rendererRef.current?.markDirty();
          }}
        >
          {hud.paused ? 'Continuar' : 'Pausar'}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onSettings({ ...settings, timerEnabled: !settings.timerEnabled })}
        >
          Tempo
        </button>
      </header>
      <div className="board-wrap">
        <canvas ref={canvasRef} aria-label="Área do quebra-cabeça" />
        {busy ? <div className="overlay">Preparando peças…</div> : null}
        {error ? <div className="overlay">{error}</div> : null}
        {hud.paused ? (
          <div className="overlay">
            <div className="modal">
              <h2>Pausa</h2>
              <p>A partida está salva neste aparelho.</p>
              <button
                className="btn primary"
                type="button"
                onClick={() => {
                  session()?.resume();
                  const current = session();
                  if (current) refresh(current);
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <nav className="help-dock" aria-label="Ajuda">
        <button
          className="chip"
          type="button"
          disabled={hud.remaining.peekImage <= 0}
          onClick={() => {
            if (session()?.peekImage()) {
              setPeek(true);
              const current = session();
              if (current) refresh(current);
            }
          }}
        >
          Ver imagem ({formatHelpLimit(hud.remaining.peekImage)})
        </button>
        <button
          className="chip"
          type="button"
          disabled={hud.remaining.highlight <= 0}
          onClick={() => {
            session()?.highlightPiece(performance.now());
            const current = session();
            if (current) refresh(current);
            rendererRef.current?.markDirty();
          }}
        >
          Destacar ({formatHelpLimit(hud.remaining.highlight)})
        </button>
        <button
          className="chip"
          type="button"
          disabled={hud.remaining.separateEdges <= 0}
          onClick={() => {
            session()?.separateEdges();
            const current = session();
            if (current) refresh(current);
            rendererRef.current?.markDirty();
          }}
        >
          Bordas ({formatHelpLimit(hud.remaining.separateEdges)})
        </button>
        <button
          className="chip"
          type="button"
          disabled={hud.remaining.shuffle <= 0}
          onClick={() => {
            session()?.shuffle();
            const current = session();
            if (current) refresh(current);
            rendererRef.current?.markDirty();
          }}
        >
          Embaralhar ({formatHelpLimit(hud.remaining.shuffle)})
        </button>
        <button className="chip" type="button" onClick={() => rendererRef.current?.zoomBy(1.15)}>
          Zoom +
        </button>
        <button className="chip" type="button" onClick={() => rendererRef.current?.zoomBy(1 / 1.15)}>
          Zoom −
        </button>
        <button className="chip" type="button" onClick={() => rendererRef.current?.requestFit()}>
          Enquadrar
        </button>
      </nav>
      {peek ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Imagem completa">
          <div className="modal">
            <h2>Imagem completa</h2>
            <img src={config.assetUrl(target.puzzle.image.src)} alt={target.puzzle.name} />
            <button className="btn primary" type="button" onClick={() => setPeek(false)}>
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
