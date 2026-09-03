// Service Worker Giorenatto — v2
// Cambio clave: index.html y productos.json van NETWORK-FIRST (siempre el catálogo/stock más nuevo;
// caché solo si no hay internet). Fotos, logo y manifest siguen cache-first porque no cambian.
// IMPORTANTE: cada vez que subas cambios a index.html/sw.js, subí el número de CACHE (v3, v4…)
// para que los celus que ya instalaron la app pisen la versión vieja.
const CACHE = "giorenatto-v2";
const CORE = ["/", "/index.html", "/nosotros.html", "/logo.webp", "/logo-192.png", "/logo-512.png", "/manifest.webmanifest"];

// Rutas que SIEMPRE se piden a la red primero
const NETWORK_FIRST = /^\/(index\.html)?$|^\/nosotros\.html$|^\/productos\.json$/;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Nunca tocar backend, otros orígenes, ni el panel de admin
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin")) return;

  if (NETWORK_FIRST.test(url.pathname)) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets estáticos: cache-first con actualización en segundo plano
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
