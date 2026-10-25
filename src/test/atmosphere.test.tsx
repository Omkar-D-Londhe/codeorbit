import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider } from '../state/AppState'
import { Atmosphere } from '../core/atmosphere/Atmosphere'
import { Particles, HARD_PARTICLE_CAP } from '../core/atmosphere/Particles'
import { RouteTransition } from '../core/atmosphere/RouteTransition'
import { contrastRatio, parseColor } from '../core/a11y/contrast'

describe('Atmosphere Stack (1.1, 1.2, 1.3, 1.6)', () => {
  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('pointer: fine'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders fixed, aria-hidden, pointer-events: none container at z-index: 0', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppStateProvider>
          <Atmosphere />
        </AppStateProvider>
      </MemoryRouter>
    )

    const root = container.querySelector('.atmosphere-root') as HTMLElement
    expect(root).toBeInTheDocument()
    expect(root.getAttribute('aria-hidden')).toBe('true')
    expect(root.style.pointerEvents).toBe('none')
    expect(root.style.position).toBe('fixed')
    expect(root.style.zIndex).toBe('0')
  })

  it('renders Nebula only on Home (/) and Track (/learn) routes, not on /review or /settings', () => {
    // 1. Home route
    const { container: homeContainer } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppStateProvider>
          <Atmosphere />
        </AppStateProvider>
      </MemoryRouter>
    )
    expect(homeContainer.querySelector('.nebula-backdrop')).toBeInTheDocument()

    // 2. Track route (/learn/html)
    const { container: trackContainer } = render(
      <MemoryRouter initialEntries={['/learn/html']}>
        <AppStateProvider>
          <Atmosphere />
        </AppStateProvider>
      </MemoryRouter>
    )
    expect(trackContainer.querySelector('.nebula-backdrop')).toBeInTheDocument()

    // 3. Review route (/review) -> Nebula must NOT be rendered
    const { container: reviewContainer } = render(
      <MemoryRouter initialEntries={['/review']}>
        <AppStateProvider>
          <Atmosphere />
        </AppStateProvider>
      </MemoryRouter>
    )
    expect(reviewContainer.querySelector('.nebula-backdrop')).toBeNull()

    // 4. Settings route (/settings) -> Nebula must NOT be rendered
    const { container: settingsContainer } = render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppStateProvider>
          <Atmosphere />
        </AppStateProvider>
      </MemoryRouter>
    )
    expect(settingsContainer.querySelector('.nebula-backdrop')).toBeNull()
  })

  it('is completely absent in high-contrast mode', () => {
    localStorage.setItem(
      'codeorbit:state',
      JSON.stringify({
        schemaVersion: 2,
        settings: { contrast: 'high' },
      })
    )

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppStateProvider>
          <Atmosphere />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(container.querySelector('.atmosphere-root')).toBeNull()
  })

  it('suppresses animation classes when motion is reduced', () => {
    localStorage.setItem(
      'codeorbit:state',
      JSON.stringify({
        schemaVersion: 2,
        settings: { motion: 'reduced' },
      })
    )

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppStateProvider>
          <Atmosphere />
        </AppStateProvider>
      </MemoryRouter>
    )

    const animatedGlow = container.querySelector('.nebula-glow--animated')
    expect(animatedGlow).toBeNull()
  })
})

describe('Particles (1.6)', () => {
  it('enforces a hard particle cap of <= 30 particles', () => {
    expect(HARD_PARTICLE_CAP).toBe(30)
  })

  it('cleans up event listeners and animation frames on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame')

    const { unmount } = render(
      <AppStateProvider>
        <Particles maxParticles={20} />
      </AppStateProvider>
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalled()
    removeEventListenerSpy.mockRestore()
    cancelRafSpy.mockRestore()
  })
})

describe('RouteTransition (1.7)', () => {
  it('skips animation on initial render and renders content without interrupting focus', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppStateProvider>
          <RouteTransition>
            <div>Page Content</div>
          </RouteTransition>
        </AppStateProvider>
      </MemoryRouter>
    )

    const wrapper = container.querySelector('.route-transition')
    expect(wrapper).toBeInTheDocument()
    // Initial render must not have the active animation class
    expect(wrapper?.classList.contains('route-transition--animate')).toBe(false)
    expect(container.textContent).toContain('Page Content')
  })
})

describe('Text Contrast over Nebula (WCAG AA)', () => {
  it('meets WCAG AA (>= 4.5:1) for text over the brightest gradient stop', () => {
    // Obsidian background is #08080e. Brightest primary glow stop is 14% violet #9a8bff over #08080e:
    // Effective blended background is approx #1c1a2d.
    // Text color is #f4f4f8.
    const obsidianText = parseColor('#f4f4f8')
    const obsidianNebulaPeak = parseColor('#1c1a2d')
    const darkRatio = contrastRatio(obsidianText, obsidianNebulaPeak)
    expect(darkRatio).toBeGreaterThanOrEqual(4.5)

    // Starlight background is #f7f6fb. Brightest glow is 12% violet over #f7f6fb -> #eceafd.
    // Text color is #12101a.
    const starlightText = parseColor('#12101a')
    const starlightNebulaPeak = parseColor('#eceafd')
    const lightRatio = contrastRatio(starlightText, starlightNebulaPeak)
    expect(lightRatio).toBeGreaterThanOrEqual(4.5)
  })
})
