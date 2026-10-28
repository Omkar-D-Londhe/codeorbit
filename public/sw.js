// CodeOrbit Dependency-Light Service Worker (Catalog 16.3 & 17.6)
const APP_VERSION = '0.1.0'
const SHELL_CACHE = `codeorbit-shell-v${APP_VERSION}`
const ASSETS_CACHE = `codeorbit-assets-v${APP_VERSION}`

const PRECACHE_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
  '/icons/icon.svg',
]

// 1. Install event: Precache application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_SHELL_URLS))
      .catch((err) => {
        console.warn('[SW] Precache failed:', err)
      })
  )
  // Strict requirement: Never call self.skipWaiting() automatically
})

// 2. Activate event: Deterministic cleanup of obsolete caches
self.addEventListener('activate', (event) => {
  const activeCaches = new Set([SHELL_CACHE, ASSETS_CACHE])
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key.startsWith('codeorbit-') && !activeCaches.has(key)) {
              return caches.delete(key)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

// 3. Message event: User-confirmed skipWaiting update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

function isNavigationRequest(request) {
  if (request.mode === 'navigate') return true
  const accept = request.headers ? request.headers.get('accept') : ''
  return Boolean(accept && accept.includes('text/html'))
}

function isStaticAsset(url) {
  const path = url.pathname
  if (path.includes('/assets/')) return true
  if (path.includes('/icons/')) return true
  if (/\.(woff2?|ttf|otf|eot)$/i.test(path)) return true
  if (/\.(js|css|svg|png|jpg|jpeg|webp|ico)$/i.test(path)) return true
  return false
}

// 4. Fetch event: Strategic routing
self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Only handle http / https requests
  if (!url.protocol.startsWith('http')) return

  // Do not intercept Vite dev server internals
  if (url.pathname.startsWith('/@') || url.pathname.includes('/node_modules/')) return

  // Strategy A: Navigation requests (HTML pages & deep links) -> Network-first with /index.html fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone()
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone))
          }
          return networkRes
        })
        .catch(() => {
          // Offline fallback: return cached index.html or root
          return caches.match('/index.html').then((cached) => {
            return cached || caches.match('/')
          })
        })
    )
    return
  }

  // Strategy B: Static assets (JS chunks, CSS, fonts, icons) -> Cache-first with network fallback
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached

        return fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone()
              const cacheName = url.pathname.startsWith('/assets/') ? ASSETS_CACHE : SHELL_CACHE
              caches.open(cacheName).then((cache) => cache.put(request, clone))
            }
            return networkRes
          })
          .catch(() => {
            // Asset offline miss
            return cached
          })
      })
    )
    return
  }

  // Strategy C: Other same-origin GET requests -> Network-first with cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone()
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone))
          }
          return networkRes
        })
        .catch(() => caches.match(request))
    )
  }
})
