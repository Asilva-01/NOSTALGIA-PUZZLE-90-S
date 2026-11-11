import type { CatalogEntry } from '@puzzle-universe/content-manager';
import {
  isUnlocked,
  PHASE_BANDS,
  playSfx,
  practiceCounts,
  silenceAudio,
  unlockAudio,
  withSoundEnabled,
  type AppSettings,
  type PhaseDefinition,
  type PieceCount,
  type ProgressState,
  type SavedSession,
} from '@puzzle-universe/puzzle-engine';
import { formatElapsed } from '@puzzle-universe/shared-utils';
import type { ProductConfig } from '../types.ts';

type Props = {
  config: ProductConfig;
  progress: ProgressState;
  phases: PhaseDefinition[];
  settings: AppSettings;
  saved: SavedSession | null;
  onResume: () => void;
  onSettings: (settings: AppSettings) => void;
  onRandom: () => void;
  onSurprise: () => void;
  onPlayPhase: (phase: PhaseDefinition) => void;
  onPractice: (count: PieceCount) => void;
};

function puzzleById(config: ProductConfig, id: string): CatalogEntry | undefined {
  return config.catalog.puzzles.find((item) => item.id === id);
}

function difficultyLabel(value: CatalogEntry['difficulty']): string {
  if (value === 'easy') return 'fácil';
  if (value === 'medium') return 'médio';
  if (value === 'hard') return 'difícil';
  return 'especialista';
}

export function HomeView({
  config,
  progress,
  phases,
  settings,
  saved,
  onResume,
  onSettings,
  onRandom,
  onSurprise,
  onPlayPhase,
  onPractice,
}: Props) {
  const featured = config.catalog.puzzles[0];
  const featuredThumb = featured ? config.assetUrl(featured.image.thumbnail) : '';
  const featuredMedium = featured ? config.assetUrl(featured.image.srcMedium) : '';

  return (
    <div className="home">
      <header className="topbar">
        <div className="brand">
          <small>{config.shortName}</small>
          <strong>{config.name}</strong>
        </div>
      </header>
      <section className="hero">
        <div>
          <h1>{config.name}</h1>
          <p>{config.tagline}</p>
        </div>
        {featured ? (
          <div className="hero-art">
            <img
              src={featuredThumb}
              srcSet={`${featuredThumb} 320w, ${featuredMedium} 800w`}
              sizes="(min-width: 900px) 480px, 100vw"
              alt={featured.name}
              width={320}
              height={240}
            />
          </div>
        ) : null}
      </section>
      <div className="actions">
        {saved && !saved.completed ? (
          <button className="btn primary" type="button" onClick={onResume}>
            Continuar partida ({saved.pieceCount} peças, {formatElapsed(saved.elapsedMs)})
          </button>
        ) : null}
        <button className="btn primary" type="button" onClick={onRandom}>
          Desafio aleatório
        </button>
        <button
          className="btn"
          type="button"
          onClick={onSurprise}
          title="Imagem e dificuldade alinhadas ao seu nível, só itens desbloqueados"
        >
          Surpreenda-me
        </button>
      </div>
      {featured ? (
        <section className="panel">
          <h2>{featured.name}</h2>
          <p>{featured.description}</p>
          <p>
            Coleção {featured.collection} · {difficultyLabel(featured.difficulty)} ·
            licença {featured.license.license} ({featured.license.type})
          </p>
          {featured.story ? (
            <dl className="story">
              <dt>História</dt>
              <dd>{featured.story.summary}</dd>
              <dt>Referência</dt>
              <dd>{featured.story.reference}</dd>
              <dt>Mensagem</dt>
              <dd>{featured.story.message}</dd>
              <dt>Curiosidade</dt>
              <dd>{featured.story.curiosity}</dd>
            </dl>
          ) : null}
          <h3>Jogar agora</h3>
          <p>12, 24 e 48 peças estão jogáveis nesta entrega para validar o motor. A campanha segue a tabela de fases.</p>
          <div className="chip-row">
            {practiceCounts().map((count) => (
              <button key={count} className="chip" type="button" onClick={() => onPractice(count)}>
                {count} peças
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <section className="panel">
        <h2>Níveis</h2>
        <p>
          As fases 1 a 10 usam 12 peças; as fases 11 a 25 usam 24 peças. Cada uma destas{' '}
          {config.catalog.puzzles.length} artes originais é um desafio diferente. Depois a campanha reutiliza as artes
          com mais peças.
        </p>
        <ul className="level-grid">
          {config.catalog.puzzles.map((puzzle, index) => {
            const phase = phases[index];
            if (!phase) return null;
            const unlocked = isUnlocked(progress, phase.id);
            const stars = progress.stars[phase.id] ?? 0;
            const thumb = config.assetUrl(puzzle.image.thumbnail);
            return (
              <li key={puzzle.id}>
                <button
                  type="button"
                  className={`level-card${unlocked ? '' : ' locked'}`}
                  disabled={!unlocked}
                  onClick={() => onPlayPhase(phase)}
                  aria-label={`Fase ${phase.number}: ${puzzle.name}${unlocked ? '' : ', bloqueada'}`}
                >
                  <img src={thumb} alt="" width={320} height={240} loading="lazy" />
                  <span className="level-card-meta">
                    <strong>{puzzle.name}</strong>
                    <small>
                      Fase {phase.number} · {puzzle.collection}
                    </small>
                    {stars ? <small>{'★'.repeat(stars)}</small> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="panel">
        <h2>Campanha</h2>
        <p>Tabela da especificação: 1–10 com 12 peças, depois 24, 48, 72, 96, 150 e 200. Dá para repetir fase já aberta.</p>
        {PHASE_BANDS.map((band) => (
          <details key={band.from} className="band" open={band.from === 1}>
            <summary>
              Fases {band.from}–{band.to} · {band.pieceCount} peças
            </summary>
            <div className="phase-grid">
              {phases
                .filter((phase) => phase.number >= band.from && phase.number <= band.to)
                .map((phase) => {
                  const unlocked = isUnlocked(progress, phase.id);
                  const stars = progress.stars[phase.id] ?? 0;
                  const puzzle = puzzleById(config, phase.puzzleId);
                  const thumb = puzzle ? config.assetUrl(puzzle.image.thumbnail) : '';
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      className={`phase-cell with-art${unlocked ? '' : ' locked'}${stars ? ' done' : ''}`}
                      disabled={!unlocked}
                      onClick={() => onPlayPhase(phase)}
                      aria-label={`Fase ${phase.number}, ${puzzle?.name ?? phase.puzzleId}, ${phase.pieceCount} peças${unlocked ? '' : ', bloqueada'}`}
                    >
                      {thumb ? <img src={thumb} alt="" width={320} height={240} loading="lazy" /> : null}
                      <span className="phase-num">{unlocked ? phase.number : '•'}</span>
                      {stars ? <small>{'★'.repeat(stars)}</small> : null}
                    </button>
                  );
                })}
            </div>
          </details>
        ))}
      </section>
      <section className="panel">
        <h2>Ajuda, som e cronômetro</h2>
        <p>
          Presets de limite por partida (imagem, dica, prévia parcial, bordas, mistura). Casual é
          generoso e o cronômetro só conta para pontos e estrelas — não se perde por tempo. Desafio
          aperta as ajudas e tem countdown obrigatório: se o relógio zerar, a partida falha e você
          tenta de novo, sem perder desbloqueios.
        </p>
        <div className="chip-row">
          <button
            type="button"
            className="chip"
            aria-pressed={settings.helpPreset === 'casual'}
            onClick={() => onSettings({ ...settings, helpPreset: 'casual' })}
          >
            Casual
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={settings.helpPreset === 'desafio'}
            onClick={() => onSettings({ ...settings, helpPreset: 'desafio' })}
          >
            Desafio
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={settings.timerEnabled}
            onClick={() => onSettings({ ...settings, timerEnabled: !settings.timerEnabled })}
          >
            Cronômetro {settings.timerEnabled ? 'ligado' : 'desligado'}
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={settings.soundEnabled}
            onClick={() => {
              const enabled = !settings.soundEnabled;
              if (enabled) {
                unlockAudio();
                playSfx('help', true, config.theme);
              } else {
                silenceAudio();
              }
              onSettings(withSoundEnabled(settings, enabled));
            }}
          >
            Som {settings.soundEnabled ? 'ligado' : 'desligado'}
          </button>
        </div>
      </section>
    </div>
  );
}
