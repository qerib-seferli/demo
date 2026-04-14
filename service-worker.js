const CACHE_NAME = "elit-avto-777-v1";

const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./admin.html",
  "./elan.html",
  "./login.html",
  "./mesajlar.html",
  "./profile.html",
  "./reset-password.html",
  "./sevimliler.html",
  "./style.css",
  "./app.js",
  "./site.webmanifest",
  "./foto/icon-192.png",
  "./foto/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          return caches.match("./index.html");
        })
      );
    })
  );
});
