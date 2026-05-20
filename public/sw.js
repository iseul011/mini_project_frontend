/** 정적 아이콘만 캐시. HTML·/_next/ JS는 캐시하지 않음 (구버전 20초 녹화 번들 방지). */
const CACHE = 'chungsora-static-v3';
const PRECACHE = ['/manifest.json'];

function shouldBypassCache(url, request) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypassCache(url, event.request)) return;

  if (!url.pathname.startsWith('/icons/')) return;

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return res;
        }),
    ),
  );
});
