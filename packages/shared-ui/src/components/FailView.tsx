import { formatElapsed } from '@puzzle-universe/shared-utils';
import type { ProductConfig } from '../types.ts';

type Props = {
  config: ProductConfig;
  elapsedMs: number;
  limitMs: number;
  onHome: () => void;
  onRetry: () => void;
};

export function FailView({ config, elapsedMs, limitMs, onHome, onRetry }: Props) {
  return (
    <div className="complete fail">
      <header className="topbar">
        <div className="brand">
          <small>{config.shortName}</small>
          <strong>Tempo esgotado</strong>
        </div>
      </header>
      <h1>Não deu tempo</h1>
      <p className="complete-meta">
        O relógio do Desafio zerou antes de montar o puzzle. Nada foi perdido: a campanha
        continua e os desbloqueios ficam como estavam.
      </p>
      <p className="complete-meta">
        {formatElapsed(elapsedMs)} de {formatElapsed(limitMs)}
      </p>
      <div className="actions">
        <button className="btn primary" type="button" onClick={onRetry}>
          Tentar de novo
        </button>
        <button className="btn" type="button" onClick={onHome}>
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
