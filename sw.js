const CACHE_NAME = "offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  console.log("Installing web app…");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching core assets…");
      return cache.addAll([
        "/",
        "/index.html",
        OFFLINE_URL,
        "/src/images/logo.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle HTTP/HTTPS requests
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || caches.match(OFFLINE_URL));

      // Serve cached response immediately (stale-while-revalidate)
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Activating new service worker…");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
