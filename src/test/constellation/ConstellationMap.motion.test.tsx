import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import App from '../../App'
import { createDefaultState, saveState } from '../../lib/storage'

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  window.matchMedia = ((q: string) => {
    const m = /max-width:\s*(\d+)px/.exec(q)
    const matches = m ? w <= Number(m[1]) : false
    return {
      matches,
      media: q,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList
  }) as typeof window.matchMedia
}

const renderConstellation = () =>
  render(
    <MemoryRouter initialEntries={['/learn/html?orbit=constellation']}>
      <App />
    </MemoryRouter>,
  )

describe('ConstellationOrbit motion and contrast behavior', () => {
  beforeEach(() => {
    setWidth(1440)
    window.localStorage.clear()
  })

  it('in high-contrast mode, decorative starfield backdrop is absent (FC-15 / spec §13)', () => {
    const s = createDefaultState()
    s.settings.contrast = 'high'
    saveState(s)

    const { container } = renderConstellation()

    // Decorative starfield SVG backdrop is omitted
    const starfield = container.querySelector('svg.starfield')
    expect(starfield).toBeNull()
  })

  it('in normal mode, starfield backdrop is rendered', () => {
    const s = createDefaultState()
    s.settings.contrast = 'normal'
    saveState(s)

    const { container } = renderConstellation()

    const starfield = container.querySelector('svg.starfield')
    expect(starfield).not.toBeNull()
  })

  it('respects reduced-motion setting', () => {
    const s = createDefaultState()
    s.settings.motion = 'reduced'
    saveState(s)

    const { container } = renderConstellation()

    // No stars with twinkle animation class in starfield
    const twinklingStars = container.querySelectorAll('.starfield__dot--twinkle')
    expect(twinklingStars.length).toBe(0)
  })
})
