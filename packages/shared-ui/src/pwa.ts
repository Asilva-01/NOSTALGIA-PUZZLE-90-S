export function registerPwa(onUpdate: () => void): () => void {
  if (!('serviceWorker' in navigator)) {
    return () => undefined;
  }
  const url = `${import.meta.env.BASE_URL}sw.js`;
  let registration: ServiceWorkerRegistration | undefined;
  void navigator.serviceWorker.register(url).then((reg) => {
    registration = reg;
    if (reg.waiting) {
      onUpdate();
    }
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdate();
        }
      });
    });
  });
  return () => {
    void registration?.unregister();
  };
}

export async function applyUpdate(): Promise<void> {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
  const reg = await navigator.serviceWorker.getRegistration();
  reg?.waiting?.postMessage('skipWaiting');
}
