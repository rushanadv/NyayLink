/**
 * NyayLink PWA Service Worker
 * 
 * SECURITY DIRECTIVE:
 * Never cache authenticated sessions, legal documents, AI Preconsultation responses,
 * or user dashboards. Network-only enforcement for all sensitive dynamic routes.
 */

const CACHE_VERSION = "nyaylink-static-v1";
const PRECACHE_ASSETS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/brand/nyaylink-logo.png",
  "/favicon.ico",
];

// Helper to determine if a request must NEVER be cached
function isNonCacheable(url, request) {
  const pathname = url.pathname;

  // 1. All non-GET requests are network-only
  if (request.method !== "GET") return true;

  // 2. Sensitive APIs, auth, dashboard, and legal intake routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/lawyer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/intake") ||
    pathname.startsWith("/onboarding")
  ) {
    return true;
  }

  // 3. Third-party auth, storage, or external databases
  if (url.hostname.includes("supabase.co") || url.hostname.includes("groq.com")) {
    return true;
  }

  // 4. Next.js RSC streaming, data queries, or signed URLs
  if (
    url.searchParams.has("_rsc") ||
    url.searchParams.has("rsc") ||
    pathname.startsWith("/_next/data") ||
    url.searchParams.has("token") ||
    url.searchParams.has("signature") ||
    url.searchParams.has("sig")
  ) {
    return true;
  }

  // 5. Authenticated requests with explicit headers
  if (request.headers.has("authorization")) {
    return true;
  }

  return false;
}

// Installation: Pre-cache minimal public static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[NyayLink SW] Pre-cache non-fatal warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activation: Clean up obsolete cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_VERSION) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Secure network-first routing with offline fallback
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Security Gate: Never cache private/sensitive traffic
  if (isNonCacheable(url, event.request)) {
    return; // Standard network fetch, completely bypassing cache
  }

  // Case A: Public Static Branding & Icons (/icons/, /brand/, /favicon.ico)
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // Case B: Public HTML Document Navigation (when offline, serve /offline fallback)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedOffline = await caches.match("/offline");
        if (cachedOffline) return cachedOffline;
        return new Response("You are offline. Please reconnect to access NyayLink.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
    );
    return;
  }

  // Default: pass through directly to network
});
