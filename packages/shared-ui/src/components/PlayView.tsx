import { useEffect, useRef, useState } from 'react';
import { catalogPlaySrc } from '@puzzle-universe/content-manager';
import {
  HELP_PRESETS,
  PuzzleRenderer,
  PuzzleSession,
  formatHelpBadge,
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

function HelpIcon({ name }: { name: 'image' | 'hint' | 'edge' | 'shuffle' | 'plus' | 'minus' | 'fit' | 'sound' }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (name === 'image') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 16l-5-5-8 8" />
      </svg>
    );
  }
  if (name === 'hint') {
    return (
      <svg {...common}>
        <path d="M12 3l2.1 6.3H21l-5.4 3.9 2.1 6.3L12 15.6 6.3 19.5l2.1-6.3L3 9.3h6.9z" />
      </svg>
    );
  }
  if (name === 'edge') {
    return (
      <svg {...common}>
        <path d="M4 8h10v12H4z" />
        <path d="M14 4h6v10h-6" />
      </svg>
    );
  }
  if (name === 'shuffle') {
    return (
      <svg {...common}>
        <path d="M4 7h4l10 10h2" />
        <path d="M18 7h2M4 17h4l3-3" />
        <path d="M17 5l3 2-3 2" />
        <path d="M17 15l3 2-3 2" />
      </svg>
    );
  }
  if (name === 'plus') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }
  if (name === 'minus') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M8 12h8" />
      </svg>
    );
  }
  if (name === 'fit') {
    return (
      <svg {...common}>
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M11 5v14" />
      <path d="M11 5c4 2 6 4 6 7s-2 5-6 7" />
      <path d="M16 9.5c1.2.8 2 2 2 2.5s-.8 1.7-2 2.5" />
    </svg>
  );
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
  const completedRef = useRef(false);
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
    rendererRef.current?.setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cancelled = false;
    const imageUrl = config.assetUrl(catalogPlaySrc(target.puzzle.image, window.innerWidth));
    const initialSaved = savedOnMount.current;
    completedRef.current = Boolean(initialSaved?.completed);

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
          soundEnabled: settings.soundEnabled,
          reducedMotion: settings.reducedMotion,
          persist: () => {
            void persist.saveSession(session.toSaved());
          },
          onChange: () => refresh(session),
          onComplete: () => fireComplete(session),
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

  function fireComplete(session: PuzzleSession) {
    if (completedRef.current) return;
    completedRef.current = true;
    completeRef.current({
      stars: session.stars(),
      score: session.score,
      elapsedMs: session.elapsedMs,
      target,
    });
  }

  function refresh(session: PuzzleSession) {
    setHud({
      elapsed: session.elapsedMs,
      score: session.score,
      placed: session.pieces.filter((piece) => piece.placed).length,
      total: session.pieces.length,
      paused: session.paused && !session.completed,
      remaining: remainingHelp(session.helpLimits, session.helpUsed),
    });
    if (session.completed) {
      fireComplete(session);
    }
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
        <div className="hud-center">
          <strong title={target.puzzle.name}>{target.puzzle.name}</strong>
          <div className="hud-meta">
            <span className="hud-stat" aria-label="Peças encaixadas">
              {hud.placed}/{hud.total}
            </span>
            <span className="hud-stat">{target.pieceCount}p</span>
            {settings.timerEnabled ? (
              <span className="hud-stat" aria-live="polite">
                {formatElapsed(hud.elapsed)}
              </span>
            ) : (
              <span className="hud-stat">sem tempo</span>
            )}
          </div>
        </div>
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
      </header>
      <div className="board-bezel">
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
      </div>
      <nav className="help-dock" aria-label="Ajuda">
        <button
          className="help-btn"
          type="button"
          disabled={hud.remaining.peekImage <= 0}
          aria-label={`Ver imagem (${formatHelpLimit(hud.remaining.peekImage)})`}
          onClick={() => {
            if (session()?.peekImage()) {
              setPeek(true);
              const current = session();
              if (current) refresh(current);
            }
          }}
        >
          <HelpIcon name="image" />
          <span>Imagem</span>
          <b className="help-badge">{formatHelpBadge(hud.remaining.peekImage)}</b>
        </button>
        <button
          className="help-btn"
          type="button"
          disabled={hud.remaining.highlight <= 0}
          aria-label={`Destacar (${formatHelpLimit(hud.remaining.highlight)})`}
          onClick={() => {
            session()?.highlightPiece(performance.now());
            const current = session();
            if (current) refresh(current);
            rendererRef.current?.markDirty();
          }}
        >
          <HelpIcon name="hint" />
          <span>Dica</span>
          <b className="help-badge">{formatHelpBadge(hud.remaining.highlight)}</b>
        </button>
        <button
          className="help-btn"
          type="button"
          disabled={hud.remaining.separateEdges <= 0}
          aria-label={`Bordas (${formatHelpLimit(hud.remaining.separateEdges)})`}
          onClick={() => {
            session()?.separateEdges();
            const current = session();
            if (current) refresh(current);
            rendererRef.current?.requestFit();
            rendererRef.current?.markDirty();
          }}
        >
          <HelpIcon name="edge" />
          <span>Bordas</span>
          <b className="help-badge">{formatHelpBadge(hud.remaining.separateEdges)}</b>
        </button>
        <button
          className="help-btn"
          type="button"
          disabled={hud.remaining.shuffle <= 0}
          aria-label={`Embaralhar (${formatHelpLimit(hud.remaining.shuffle)})`}
          onClick={() => {
            session()?.shuffle();
            const current = session();
            if (current) refresh(current);
            rendererRef.current?.requestFit();
            rendererRef.current?.markDirty();
          }}
        >
          <HelpIcon name="shuffle" />
          <span>Mistura</span>
          <b className="help-badge">{formatHelpBadge(hud.remaining.shuffle)}</b>
        </button>
        <button
          className="help-btn"
          type="button"
          aria-label="Aumentar zoom"
          onClick={() => rendererRef.current?.zoomBy(1.15)}
        >
          <HelpIcon name="plus" />
          <span>Zoom+</span>
        </button>
        <button
          className="help-btn"
          type="button"
          aria-label="Diminuir zoom"
          onClick={() => rendererRef.current?.zoomBy(1 / 1.15)}
        >
          <HelpIcon name="minus" />
          <span>Zoom−</span>
        </button>
        <button
          className="help-btn"
          type="button"
          aria-label="Enquadrar tabuleiro"
          onClick={() => rendererRef.current?.requestFit()}
        >
          <HelpIcon name="fit" />
          <span>Ver</span>
        </button>
        <button
          className="help-btn"
          type="button"
          aria-pressed={settings.soundEnabled}
          aria-label={settings.soundEnabled ? 'Som ligado' : 'Som desligado'}
          onClick={() => onSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
        >
          <HelpIcon name="sound" />
          <span>Som</span>
          <b className="help-badge">{settings.soundEnabled ? 'on' : 'off'}</b>
        </button>
      </nav>
      {peek ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Imagem completa">
          <div className="modal">
            <h2>Imagem completa</h2>
            <img
              src={config.assetUrl(catalogPlaySrc(target.puzzle.image, window.innerWidth))}
              alt={target.puzzle.name}
            />
            <button className="btn primary" type="button" onClick={() => setPeek(false)}>
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
