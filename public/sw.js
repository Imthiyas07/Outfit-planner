/* =========================================================
   ZeriqAI Service Worker
   Version: 2.0
========================================================= */
const CACHE_VERSION = "v2";
const CACHE_NAME = `wearwise-${CACHE_VERSION}`;
const STATIC_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon 512.png"
];

/* ============================
   INSTALL
============================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_FILES))
      .catch((err) => {
        console.error("Service Worker install/cache.addAll failed:", err);
      })
  );
  self.skipWaiting();
});

/* ============================
   ACTIVATE
============================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* ============================
   FETCH
============================= */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  // Skip unsupported schemes (chrome-extension://, safari-web-extension://, etc.)
  // cache.put() throws on these, causing unhandled rejections.
  if (!request.url.startsWith("http")) return;

  /* ---------- HTML Pages ----------
     Network First
  --------------------------------*/
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache genuinely good responses, not 404/500 pages
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, copy))
              .catch((err) => console.error("Cache put failed:", err));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cached) => cached || caches.match("/offline.html"));
        })
    );
    return;
  }

  /* ---------- Static Assets ----------
     Cache First
  --------------------------------*/
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, copy))
              .catch((err) => console.error("Cache put failed:", err));
            return response;
          })
          .catch((err) => {
            console.error("Fetch failed for static asset:", request.url, err);
            throw err;
          });
      })
  );
});

/* ============================
   PUSH
============================= */
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New Notification",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png"
  };
  event.waitUntil(
    self.registration.showNotification("ZeriqAI", options)
  );
});

/* ============================
   NOTIFICATION CLICK
============================= */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
