import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ConstellationOrbit } from '../../core/orbit/constellation/ConstellationOrbit'
import { AppStateProvider } from '../../state/AppState'
import { topics, groups } from '../../data/curriculum'

describe('Orbit Search Highlight (Catalog 2.8)', () => {
  const defaultProps = {
    technologyId: 'html',
    technologyName: 'HTML',
    technologyGlyph: '</>',
    technologyDescription: 'HTML Track',
    topics,
    groups,
  }

  it('preserves all star coordinates when highlight filter is applied', () => {
    // 1. Render without highlight
    const { container: c1, unmount: u1 } = render(
      <MemoryRouter>
        <AppStateProvider>
          <ConstellationOrbit {...defaultProps} highlightIds={null} />
        </AppStateProvider>
      </MemoryRouter>
    )

    const starsNormal = Array.from(c1.querySelectorAll<HTMLElement>('.constellation-star'))
    const normalPositions = starsNormal.map((el) => ({
      left: el.style.left,
      top: el.style.top,
    }))
    u1()

    // 2. Render with highlight filter
    const highlightIds = [topics[0].id, topics[2].id]
    const { container: c2 } = render(
      <MemoryRouter>
        <AppStateProvider>
          <ConstellationOrbit {...defaultProps} highlightIds={highlightIds} />
        </AppStateProvider>
      </MemoryRouter>
    )

    const starsHighlighted = Array.from(c2.querySelectorAll<HTMLElement>('.constellation-star'))
    const highlightedPositions = starsHighlighted.map((el) => ({
      left: el.style.left,
      top: el.style.top,
    }))

    // Coordinates must be strictly identical
    expect(highlightedPositions).toEqual(normalPositions)

    // Check highlighted and dimmed classes
    const matchedEl1 = c2.querySelector(`.constellation-star--highlighted`)
    expect(matchedEl1).toBeInTheDocument()

    const dimmedEls = c2.querySelectorAll(`.constellation-star--dimmed`)
    expect(dimmedEls.length).toBe(topics.length - highlightIds.length)
  })
})
