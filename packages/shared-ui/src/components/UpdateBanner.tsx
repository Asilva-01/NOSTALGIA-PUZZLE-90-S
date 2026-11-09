export function UpdateBanner({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="update-banner" role="status">
      <span>Nova versão disponível.</span>
      <button className="btn" type="button" onClick={onRefresh}>
        Atualizar
      </button>
    </div>
  );
}
