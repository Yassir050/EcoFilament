
const CACHE_VERSION = "ecofilament-v2";
const CACHE_NAME = `${CACHE_VERSION}-static`;

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/ai-presenter.css",
  "./css/ai-chat.css",
  "./js/script.js",
  "./js/ai-presenter.js",
  "./js/ai-chat.js",
  "./js/scene3d.js",
  "./vendor/three/build/three.module.js",
  "./vendor/three/build/three.core.js",
  "./vendor/three/examples/jsm/controls/OrbitControls.js"
];

// Install: cache all required local assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove previous EcoFilament caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("ecofilament-") &&
                key !== CACHE_NAME
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: serve cached local assets
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept external services or AI API
  if (url.origin !== self.location.origin) return;

  // Navigation: network first, cached page as fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put("./index.html", copy);
            });
          }
          return response;
        })
        .catch(async () => {
          return (
            await caches.match("./index.html")
          ) || Response.error();
        })
    );
    return;
  }

  // Only cache static resources
  if (!["script", "style", "image", "font"].includes(request.destination)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        if (!response.ok || response.type !== "basic") {
          return response;
        }

        const copy = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, copy);
        });

        return response;
      });
    })
  );
});
