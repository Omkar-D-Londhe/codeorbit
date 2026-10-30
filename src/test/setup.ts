import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '../app/registerTracks'
import { registerTracks } from '../app/registerTracks'

afterEach(() => {
  cleanup()
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear()
  }
  registerTracks()
})

// jsdom lacks these browser APIs.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }) as MediaQueryList
  }
  class RO { observe() {} unobserve() {} disconnect() {} }
  if (!('ResizeObserver' in window)) (window as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO
  if (typeof Element !== 'undefined') {
    Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? function () {}
  }
}

if (typeof Range !== 'undefined') {
  Range.prototype.getClientRects = Range.prototype.getClientRects || function () {
    return [] as unknown as DOMRectList
  }
  Range.prototype.getBoundingClientRect = Range.prototype.getBoundingClientRect || function () {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect
  }
}
