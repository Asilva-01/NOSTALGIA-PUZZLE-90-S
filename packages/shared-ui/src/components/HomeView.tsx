import type { AppSettings, PhaseDefinition, ProgressState, SavedSession } from '@puzzle-universe/puzzle-engine';
import { isUnlocked, PHASE_BANDS, practiceCounts } from '@puzzle-universe/puzzle-engine';
import { formatElapsed } from '@puzzle-universe/shared-utils';
import type { PieceCount } from '@puzzle-universe/puzzle-engine';
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
  onPlayPhase: (phase: PhaseDefinition) => void;
  onPractice: (count: PieceCount) => void;
};

export function HomeView({
  config,
  progress,
  phases,
  settings,
  saved,
  onResume,
  onSettings,
  onRandom,
  onPlayPhase,
  onPractice,
}: Props) {
  const featured = config.catalog.puzzles[0];
  const thumb = featured ? config.assetUrl(featured.image.thumbnail) : '';

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
            <img src={thumb} alt={featured.name} width={featured.image.width} height={featured.image.height} />
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
        <button className="btn" type="button" disabled title="Em breve">
          Surpreenda-me <span className="soon">em breve</span>
        </button>
      </div>
      {featured ? (
        <section className="panel">
          <h2>{featured.name}</h2>
          <p>{featured.description}</p>
          <p>
            Coleção {featured.collection} · {featured.difficulty === 'easy' ? 'fácil' : featured.difficulty} ·
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
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      className={`phase-cell${unlocked ? '' : ' locked'}${stars ? ' done' : ''}`}
                      disabled={!unlocked}
                      onClick={() => onPlayPhase(phase)}
                      aria-label={`Fase ${phase.number}, ${phase.pieceCount} peças${unlocked ? '' : ', bloqueada'}`}
                    >
                      {unlocked ? phase.number : '•'}
                      {stars ? <small>{'★'.repeat(stars)}</small> : null}
                    </button>
                  );
                })}
            </div>
          </details>
        ))}
      </section>
      <section className="panel">
        <h2>Ajuda e cronômetro</h2>
        <p>Presets de limite. Casual é generoso; desafio é curto.</p>
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
            onClick={() => onSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
          >
            Som {settings.soundEnabled ? 'ligado' : 'desligado'}
          </button>
        </div>
      </section>
    </div>
  );
}
