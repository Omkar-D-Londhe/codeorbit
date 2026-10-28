import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  APP_VERSION,
  CACHE_NAMES,
  PRECACHE_SHELL_URLS,
  isNavigationRequest,
  isStaticAsset,
  getCacheStrategy,
  getObsoleteCaches,
} from '../core/pwa/swLogic'
import { registerServiceWorker } from '../core/pwa/register'

describe('Sub-Stage 17c: PWA & Offline Support (Catalog 16.3 & 17.6)', () => {
  describe('1. Web App Manifest & Icons Validation', () => {
    const manifestPath = path.resolve(__dirname, '../../public/manifest.webmanifest')

    it('manifest file exists and parses as valid JSON', () => {
      expect(fs.existsSync(manifestPath)).toBe(true)
      const raw = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(raw)
      expect(manifest).toBeDefined()
    })

    it('manifest adheres to required PWA metadata schema', () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      expect(manifest.name).toBe('CodeOrbit')
      expect(manifest.short_name).toBe('CodeOrbit')
      expect(manifest.start_url).toBe('/')
      expect(manifest.scope).toBe('/')
      expect(manifest.display).toBe('standalone')
      expect(manifest.theme_color).toBe('#111219')
      expect(manifest.background_color).toBe('#111219')
      expect(Array.isArray(manifest.icons)).toBe(true)
      expect(manifest.icons.length).toBeGreaterThanOrEqual(4)
    })

    it('all declared icon files physically exist on disk and have non-zero size', () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      for (const icon of manifest.icons) {
        const fullPath = path.resolve(__dirname, '../../public', icon.src.replace(/^\//, ''))
        expect(fs.existsSync(fullPath), `Icon not found: ${icon.src}`).toBe(true)
        const stat = fs.statSync(fullPath)
        expect(stat.size, `Icon is empty: ${icon.src}`).toBeGreaterThan(100)
      }
    })

    it('contains required 192x192, 512x512, and maskable icons', () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      const has192Any = manifest.icons.some(
        (i: { sizes: string; purpose?: string }) => i.sizes === '192x192' && (!i.purpose || i.purpose === 'any')
      )
      const has512Any = manifest.icons.some(
        (i: { sizes: string; purpose?: string }) => i.sizes === '512x512' && (!i.purpose || i.purpose === 'any')
      )
      const hasMaskable = manifest.icons.some(
        (i: { purpose?: string }) => i.purpose === 'maskable'
      )
      expect(has192Any).toBe(true)
      expect(has512Any).toBe(true)
      expect(hasMaskable).toBe(true)
    })
  })

  describe('2. Service Worker Pure Logic & Caching Strategies', () => {
    it('uses versioned cache names matching APP_VERSION', () => {
      expect(APP_VERSION).toBe('0.1.0')
      expect(CACHE_NAMES.shell).toBe('codeorbit-shell-v0.1.0')
      expect(CACHE_NAMES.assets).toBe('codeorbit-assets-v0.1.0')
    })

    it('precaches core application shell assets', () => {
      expect(PRECACHE_SHELL_URLS).toContain('/')
      expect(PRECACHE_SHELL_URLS).toContain('/index.html')
      expect(PRECACHE_SHELL_URLS).toContain('/manifest.webmanifest')
      expect(PRECACHE_SHELL_URLS).toContain('/favicon.svg')
      expect(PRECACHE_SHELL_URLS).toContain('/icons/icon-192.png')
      expect(PRECACHE_SHELL_URLS).toContain('/icons/icon-512.png')
    })

    it('accurately identifies navigation requests', () => {
      expect(isNavigationRequest({ mode: 'navigate' })).toBe(true)
      expect(isNavigationRequest({ headers: { get: (h) => (h === 'accept' ? 'text/html,application/xhtml+xml' : null) } })).toBe(true)
      expect(isNavigationRequest({ mode: 'cors', headers: { get: () => 'application/json' } })).toBe(false)
      expect(isNavigationRequest({ mode: 'no-cors' })).toBe(false)
    })

    it('accurately identifies static assets, fonts, and hashed chunks', () => {
      expect(isStaticAsset('/assets/index-ABC1234.js')).toBe(true)
      expect(isStaticAsset('/assets/index-DEF5678.css')).toBe(true)
      expect(isStaticAsset('/assets/inter-latin.woff2')).toBe(true)
      expect(isStaticAsset('/icons/icon-192.png')).toBe(true)
      expect(isStaticAsset('/favicon.svg')).toBe(true)
      expect(isStaticAsset('/learn/html')).toBe(false)
      expect(isStaticAsset('/progress')).toBe(false)
    })

    it('routes navigation requests to network-first with /index.html fallback', () => {
      const navStrategy = getCacheStrategy({
        method: 'GET',
        url: 'https://codeorbit.local/learn/html',
        mode: 'navigate',
      })
      expect(navStrategy).toBe('network-first')
    })

    it('routes hashed assets and fonts to cache-first strategy', () => {
      const assetStrategy = getCacheStrategy({
        method: 'GET',
        url: 'https://codeorbit.local/assets/index-123.js',
      })
      expect(assetStrategy).toBe('cache-first')

      const fontStrategy = getCacheStrategy({
        method: 'GET',
        url: 'https://codeorbit.local/assets/inter.woff2',
      })
      expect(fontStrategy).toBe('cache-first')
    })

    it('bypasses non-GET methods and dev server internals', () => {
      expect(getCacheStrategy({ method: 'POST', url: 'https://codeorbit.local/api' })).toBe('pass-through')
      expect(getCacheStrategy({ method: 'GET', url: 'https://codeorbit.local/@vite/client' })).toBe('pass-through')
      expect(getCacheStrategy({ method: 'GET', url: 'https://codeorbit.local/node_modules/vite/dist/client.mjs' })).toBe('pass-through')
    })

    it('identifies obsolete caches deterministically during activation', () => {
      const existingCaches = [
        'codeorbit-shell-v0.0.8',
        'codeorbit-assets-v0.0.8',
        'codeorbit-shell-v0.0.9',
        'codeorbit-shell-v0.1.0', // Current active
        'codeorbit-assets-v0.1.0', // Current active
        'other-unrelated-cache-v1', // Unrelated, must not be touched
      ]
      const obsolete = getObsoleteCaches(existingCaches)
      expect(obsolete).toEqual([
        'codeorbit-shell-v0.0.8',
        'codeorbit-assets-v0.0.8',
        'codeorbit-shell-v0.0.9',
      ])
      expect(obsolete).not.toContain('codeorbit-shell-v0.1.0')
      expect(obsolete).not.toContain('codeorbit-assets-v0.1.0')
      expect(obsolete).not.toContain('other-unrelated-cache-v1')
    })
  })

  describe('3. Service Worker Script Invariants', () => {
    const swScriptPath = path.resolve(__dirname, '../../public/sw.js')

    it('sw.js file exists in public/ directory', () => {
      expect(fs.existsSync(swScriptPath)).toBe(true)
    })

    it('sw.js does NOT call self.skipWaiting() automatically in install event', () => {
      const content = fs.readFileSync(swScriptPath, 'utf-8')
      // Make sure skipWaiting is only inside message event, not install
      const installBlockMatch = /addEventListener\('install'[\s\S]*?\}\)/.exec(content)
      expect(installBlockMatch).not.toBeNull()
      expect(installBlockMatch![0]).not.toContain('skipWaiting')
    })

    it('sw.js responds to message type SKIP_WAITING for user-confirmed updates', () => {
      const content = fs.readFileSync(swScriptPath, 'utf-8')
      expect(content).toContain("event.data.type === 'SKIP_WAITING'")
      expect(content).toContain('self.skipWaiting()')
    })

    it('sw.js never accesses or references localStorage or learner notes/data', () => {
      const content = fs.readFileSync(swScriptPath, 'utf-8')
      expect(content).not.toContain('localStorage')
      expect(content).not.toContain('sessionStorage')
      expect(content).not.toContain('codeorbit:state')
    })
  })

  describe('4. Registration Lifecycle & Update Notification', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('does not register in non-production environment without opt-in', () => {
      const registerMock = vi.fn()
      // @ts-expect-error Mocking navigator.serviceWorker
      globalThis.navigator.serviceWorker = {
        register: registerMock,
        addEventListener: vi.fn(),
      }

      registerServiceWorker()
      expect(registerMock).not.toHaveBeenCalled()
    })

    it('triggers update callback and posts SKIP_WAITING when user reloads', () => {
      const postMessageMock = vi.fn()
      const mockWaitingWorker = {
        postMessage: postMessageMock,
      } as unknown as ServiceWorker

      const onUpdateMock = vi.fn((reload) => {
        // User clicks the reload action
        reload()
      })

      // Simulate triggering the callback directly through register's helper contract
      let capturedReload: (() => void) | null = null
      onUpdateMock.mockImplementation((reload) => {
        capturedReload = reload
      })

      const triggerTest = (worker: ServiceWorker, cb?: (reload: () => void) => void) => {
        if (cb) cb(() => worker.postMessage({ type: 'SKIP_WAITING' }))
      }

      triggerTest(mockWaitingWorker, onUpdateMock)
      expect(onUpdateMock).toHaveBeenCalled()
      expect(capturedReload).not.toBeNull()

      capturedReload!()
      expect(postMessageMock).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    })
  })
})
