export const APP_VERSION = '0.1.0'

export const CACHE_NAMES = {
  shell: `codeorbit-shell-v${APP_VERSION}`,
  assets: `codeorbit-assets-v${APP_VERSION}`,
} as const

export const PRECACHE_SHELL_URLS: readonly string[] = [
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

export type CacheStrategy = 'network-first' | 'cache-first' | 'pass-through'

/**
 * Determines whether a request is a client navigation (HTML page load / deep link).
 */
export function isNavigationRequest(request: {
  mode?: string
  headers?: { get: (name: string) => string | null }
}): boolean {
  if (request.mode === 'navigate') return true
  const accept = request.headers?.get?.('accept') || ''
  return accept.includes('text/html')
}

/**
 * Determines whether a request URL represents a hashed or static asset suitable for cache-first strategy.
 */
export function isStaticAsset(url: URL | string): boolean {
  const path = typeof url === 'string' ? url : url.pathname
  if (path.includes('/assets/')) return true
  if (path.includes('/icons/')) return true
  if (/\.(woff2?|ttf|otf|eot)$/i.test(path)) return true
  if (/\.(js|css|svg|png|jpg|jpeg|webp|ico)$/i.test(path)) return true
  return false
}

/**
 * Determines the appropriate caching strategy for an incoming request.
 */
export function getCacheStrategy(request: {
  method: string
  url: string
  mode?: string
  headers?: { get: (name: string) => string | null }
}): CacheStrategy {
  if (request.method !== 'GET') return 'pass-through'

  const parsedUrl = new URL(request.url, 'http://localhost')
  // Do not intercept non-http(s) schemes or dev server internals
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return 'pass-through'
  }
  if (parsedUrl.pathname.startsWith('/@') || parsedUrl.pathname.includes('/node_modules/')) {
    return 'pass-through'
  }

  if (isNavigationRequest(request)) {
    return 'network-first'
  }

  if (isStaticAsset(parsedUrl)) {
    return 'cache-first'
  }

  return 'network-first'
}

/**
 * Returns list of obsolete cache keys given existing cache names.
 */
export function getObsoleteCaches(existingKeys: string[]): string[] {
  const activeKeys = new Set<string>([CACHE_NAMES.shell, CACHE_NAMES.assets])
  return existingKeys.filter((key) => key.startsWith('codeorbit-') && !activeKeys.has(key))
}
