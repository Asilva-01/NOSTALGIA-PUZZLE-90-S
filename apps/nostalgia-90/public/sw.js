const SHELL = 'nostalgia-90-shell-v2';
const IMAGES = 'nostalgia-90-images-v1';

const PRECACHE = ['./', './index.html', './manifest.webmanifest'];

function isPuzzleImage(request) {
  if (request.destination === 'image') return true;
  try {
    const path = new URL(request.url).pathname;
    return /\.(webp|png|jpe?g)$/i.test(path) && !path.includes('/icons/');
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL, IMAGES]);
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  if (isPuzzleImage(request)) {
    event.respondWith(
      caches.open(IMAGES).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(SHELL).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
