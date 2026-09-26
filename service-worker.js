// MW Translate Service Worker v2.1.0
// Handles: app shell cache + external API bypass
const CACHE_NAME = 'mw-translate-v2';
const APP_SHELL  = ['/index.html', '/manifest.json'];

// ── Install ──
self.addEventListener('install', event => {
    console.log('[SW] MW Translate v2.1.0 installing');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

// ── Activate: clean old caches ──
self.addEventListener('activate', event => {
    console.log('[SW] Activating');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ── External API domains (always network, never cache) ──
const BYPASS_HOSTS = [
    'translate.googleapis.com',   // Google Translate free
    'api.mymemory.translated.net',// MyMemory free
    'api.anthropic.com',          // Claude API (if ever used)
    'lingva.ml',
];

// ── Fetch strategy ──
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    let url;
    try { url = new URL(event.request.url); } catch { return; }

    // Bypass: external API → network only, no cache
    if (BYPASS_HOSTS.some(h => url.hostname.includes(h))) {
        event.respondWith(
            fetch(event.request).catch(() =>
                new Response(JSON.stringify({ error: 'offline' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                })
            )
        );
        return;
    }

    // App shell → cache first, network fallback, then index.html
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(resp => {
                if (resp && resp.status === 200 && resp.type !== 'error') {
                    caches.open(CACHE_NAME).then(c => c.put(event.request, resp.clone()));
                }
                return resp;
            }).catch(() =>
                caches.match('/index.html').then(fb => fb ||
                    new Response('Offline', { status: 503 })
                )
            );
        })
    );
});

// ── Message ──
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
