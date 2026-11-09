import { formatElapsed } from '@puzzle-universe/shared-utils';
import type { ProductConfig } from '../types.ts';

type Props = {
  config: ProductConfig;
  stars: 1 | 2 | 3;
  score: number;
  elapsedMs: number;
  onHome: () => void;
  onReplay: () => void;
};

export function CompleteView({ config, stars, score, elapsedMs, onHome, onReplay }: Props) {
  return (
    <div className="complete">
      <header className="topbar">
        <div className="brand">
          <small>{config.shortName}</small>
          <strong>Puzzle montado</strong>
        </div>
      </header>
      <p className="stars" aria-label={`${stars} estrelas`}>
        {'★'.repeat(stars)}
        {'☆'.repeat(3 - stars)}
      </p>
      <h1>Que encaixe!</h1>
      <p>
        {score} pontos · {formatElapsed(elapsedMs)}
      </p>
      <div className="actions">
        <button className="btn primary" type="button" onClick={onReplay}>
          Jogar de novo
        </button>
        <button className="btn" type="button" onClick={onHome}>
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
