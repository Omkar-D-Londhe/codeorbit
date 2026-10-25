import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Starfield, starPositions, MAX_STARS, MAX_TWINKLE } from '../core/atmosphere/Starfield.tsx'
import { AppStateProvider } from '../state/AppState'

describe('starPositions (pure function)', () => {
  it('is completely deterministic for identical seeds', () => {
    const run1 = starPositions('constellation-alpha', 'normal')
    const run2 = starPositions('constellation-alpha', 'normal')
    expect(run1).toEqual(run2)
  })

  it('produces different star distributions for different seeds', () => {
    const run1 = starPositions('seed-A', 'normal')
    const run2 = starPositions('seed-B', 'normal')
    expect(run1).not.toEqual(run2)
  })

  it('enforces hard cap of <= 150 stars even with higher requested counts', () => {
    const stars = starPositions('test-seed', 999)
    expect(stars.length).toBe(MAX_STARS)
    expect(stars.length).toBeLessThanOrEqual(150)
  })

  it('enforces <= 12 twinkling stars', () => {
    const stars = starPositions('test-seed', 'dense')
    const twinkling = stars.filter((s) => s.twinkle)
    expect(twinkling.length).toBeLessThanOrEqual(MAX_TWINKLE)
  })
})

describe('Starfield Component', () => {
  it('renders an aria-hidden SVG with circles and pointer-events none', () => {
    const { container } = render(<Starfield seed="specimen" density="sparse" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg?.style.pointerEvents).toBe('none')

    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(40)
  })

  it('is completely absent in high-contrast mode', () => {
    // Set high-contrast mode in localStorage
    localStorage.setItem(
      'codeorbit:state',
      JSON.stringify({
        schemaVersion: 2,
        settings: { contrast: 'high' },
      })
    )

    const { container } = render(
      <AppStateProvider>
        <Starfield seed="specimen" />
      </AppStateProvider>
    )

    expect(container.querySelector('svg')).toBeNull()
    localStorage.clear()
  })

  it('suppresses twinkle animation when motion is reduced', () => {
    localStorage.setItem(
      'codeorbit:state',
      JSON.stringify({
        schemaVersion: 2,
        settings: { motion: 'reduce', contrast: 'normal' },
      })
    )

    const { container } = render(
      <AppStateProvider>
        <Starfield seed="specimen" density="dense" />
      </AppStateProvider>
    )

    const twinklingCircles = container.querySelectorAll('.starfield__twinkle')
    expect(twinklingCircles.length).toBe(0)
    localStorage.clear()
  })
})
