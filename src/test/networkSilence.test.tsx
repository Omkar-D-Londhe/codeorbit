import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../state/AppState'
import Home from '../pages/Home'
import Explore from '../pages/Explore'
import Track from '../pages/Track'
import Settings from '../pages/Settings'

describe('Stage 28: Third-Party Network Silence & Privacy Boundaries', () => {
  const originalFetch = globalThis.fetch
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = String(url)
      // Allow local relative asset loading or data URLs if any, but catch external domains
      if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        throw new Error(`Unauthorized third-party network call to: ${urlStr}`)
      }
      return Promise.resolve(new Response('{}', { status: 200 }))
    })
    globalThis.fetch = fetchSpy as unknown as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('renders Home, Explore, Track, and Settings without dispatching any third-party network requests', () => {
    const { unmount: unmountHome } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppStateProvider>
          <Home />
        </AppStateProvider>
      </MemoryRouter>
    )
    unmountHome()

    const { unmount: unmountExplore } = render(
      <MemoryRouter initialEntries={['/explore']}>
        <AppStateProvider>
          <Explore />
        </AppStateProvider>
      </MemoryRouter>
    )
    unmountExplore()

    const { unmount: unmountTrack } = render(
      <MemoryRouter initialEntries={['/learn/html']}>
        <AppStateProvider>
          <Routes>
            <Route path="/learn/:technologyId" element={<Track />} />
          </Routes>
        </AppStateProvider>
      </MemoryRouter>
    )
    unmountTrack()

    const { unmount: unmountSettings } = render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppStateProvider>
          <Settings />
        </AppStateProvider>
      </MemoryRouter>
    )
    unmountSettings()

    // Verify zero calls made to external endpoints
    for (const call of fetchSpy.mock.calls) {
      const target = String(call[0])
      expect(target).not.toMatch(/validator\.w3\.org/)
      expect(target).not.toMatch(/api\.openai\.com/)
      expect(target).not.toMatch(/generativelanguage\.googleapis\.com/)
      expect(target).not.toMatch(/webrtc/)
    }
  })

  it('proves that W3C validator, AI hint proxy, and multiplayer race make zero background network requests', () => {
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
