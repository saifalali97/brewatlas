// BrewAtlas service worker (PWA requirement 4/5).
//
// Bump CACHE_VERSION whenever the app-shell URL list below changes, or
// whenever you intentionally want to force every client to drop its
// runtime cache on the next visit. Hashed Next.js build assets
// (`/_next/static/...`) don't need a version bump to stay fresh -- a
// new build produces new hashed filenames, so old cache entries simply
// become unreferenced and get replaced by real network requests.
const CACHE_VERSION = "v1";
const APP_SHELL_CACHE = `brewatlas-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `brewatlas-runtime-${CACHE_VERSION}`;
const CURRENT_CACHES = [APP_SHELL_CACHE, RUNTIME_CACHE];

const OFFLINE_URL = "/offline";

// Minimal app shell precached at install time so the very first offline
// visit already has a shell + fallback to serve, before anything else
// has been visited online.
const APP_SHELL_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon.svg",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) =>
        Promise.all(
          APP_SHELL_URLS.map((url) =>
            cache.add(url).catch((error) => {
              // Never fail the whole install over one non-critical asset.
              console.warn(`[sw] failed to precache ${url}:`, error);
            }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isBuildAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GETs -- everything else (API calls, cross-origin
  // requests, POST/PUT mutations) goes straight to the network untouched.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isBuildAsset(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }
});

// HTML pages: always prefer a fresh network response so users get the
// latest content/build on every visit ("app updates"); fall back to
// whatever's cached, and finally to the offline page, only when the
// network is unreachable.
async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return Response.error();
  }
}

// Hashed static build assets: content-addressed by filename, so once
// cached they never go stale -- safe to serve straight from cache.
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Images: serve the cached copy instantly while refreshing it in the
// background, so repeat views are fast but still eventually consistent.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await networkFetch) || Response.error();
}
