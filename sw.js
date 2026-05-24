const CACHE_NAME = "void-client-cache-v1";
const URLS = [
  "./",
  "./index.html",
  "./launcher.html",
  "./docs.html",
  "./status.html",
  "./legal.html",
  "./support.html",
  "./css/styles.css",
  "./js/common.js",
  "./js/launcher.js",
  "./site-config.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});