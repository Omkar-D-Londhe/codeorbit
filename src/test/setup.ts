import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '../app/registerTracks'
import { registerTracks } from '../app/registerTracks'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  registerTracks()
})

// jsdom lacks these browser APIs.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }) as MediaQueryList
}
class RO { observe() {} unobserve() {} disconnect() {} }
if (!('ResizeObserver' in window)) (window as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? function () {}
