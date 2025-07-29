const CACHE_NAME = "offline-v1";
const OFFLINE_URL = "/offline.html";
const CORE_ASSETS = [
  "/",
  "/index.html",
  OFFLINE_URL,
  "/src/images/logo-192.png",
  "/src/images/logo-512.png",
  "/content.js"
];

self.addEventListener("install", (event) => {
  console.log("Installing web app…");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching core assets…");
      return Promise.all(
        CORE_ASSETS.map((url) =>
          fetch(url, { mode: "no-cors" })
            .then((response) => {
              if (!response.ok) {
                console.warn(`Failed to fetch ${url}: Status ${response.status}`);
                return null;
              }
              return cache.put(url, response);
            })
            .catch((error) => {
              console.warn(`Failed to fetch ${url}:`, error.message);
              return null;
            })
        )
      ).then(() => {
        console.log("Caching completed");
        return cache.match(OFFLINE_URL).then((response) => {
          if (!response) {
            console.error(`Critical: ${OFFLINE_URL} not cached`);
          }
        });
      }).catch((error) => {
        console.error("Caching failed:", error);
        throw error;
      });
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`Serving from cache: ${event.request.url}`);
        return cachedResponse;
      }

      const fetchPromise = fetch(event.request, { mode: "cors", credentials: "same-origin" })
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            event.request.method === "GET" &&
            event.request.url.match(/\.(html|css|js|png|jpg|jpeg|svg)$/)
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              console.log(`Caching: ${event.request.url}`);
              cache.put(event.request, responseToCache);
            });
          }
          if (event.request.url.includes("paymentStatus")) {
            return networkResponse.clone().json().then((data) => {
              if (data && data.status === '') {
                console.warn(`Invalid paymentStatus response: ${JSON.stringify(data)}`);
                return new Response(
                  JSON.stringify({
                    error: "Payment status unavailable",
                    message: "Server returned invalid response, please try again",
                    status: null
                  }),
                  { status: 503, headers: { "Content-Type": "application/json" } }
                );
              }
              return networkResponse;
            }).catch(() => networkResponse);
          }
          return networkResponse;
        })
        .catch((error) => {
          console.error(`Fetch failed for ${event.request.url}:`, {
            error: error.message,
            requestMode: event.request.mode,
            requestDestination: event.request.destination,
            status: error.status || "N/A",
            isLocalhost: event.request.url.includes("localhost"),
            serverHint: event.request.url.includes("tradedge-server.onrender.com")
              ? "Check CORS headers, server availability, user_id consistency, and response format on tradedge-server.onrender.com"
              : event.request.url.includes("localhost")
              ? "Check CORS headers on localhost:49000 or use HTTPS, ensure server is running"
              : ""
          });

          if (event.request.mode === "navigate") {
            console.log(`Network failed, serving offline page: ${OFFLINE_URL}`);
            return caches.match(OFFLINE_URL).then((response) => {
              if (!response) {
                console.error(`Offline page not found in cache: ${OFFLINE_URL}`);
                return new Response("Offline page unavailable", { status: 503 });
              }
              return response;
            });
          }

          if (event.request.url.includes("paymentStatus") || event.request.url.includes("paymentResult")) {
            console.log(`API request failed: ${event.request.url}, returning fallback response`);
            return new Response(
              JSON.stringify({
                error: "Payment status unavailable",
                message: "Unable to fetch payment status, please try again later",
                status: null
              }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            );
          }

          console.log(`Non-navigation request failed: ${event.request.url}`);
          return new Response("Network error occurred", { status: 503 });
        });

      return fetchPromise;
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