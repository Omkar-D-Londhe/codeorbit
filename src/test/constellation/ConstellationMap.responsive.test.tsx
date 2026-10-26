import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import App from '../../App'
import { aspectBucket } from '../../core/orbit/constellation/layout'
import { ConstellationOrbit } from '../../core/orbit/constellation/ConstellationOrbit'
import { AppStateProvider } from '../../state/AppState'
import { topics, groups } from '../../data/curriculum'

const setDimensions = (w: number, h: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: h })
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

describe('ConstellationOrbit responsive behavior', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('determines aspect bucket correctly for landscape and portrait viewports', () => {
    expect(aspectBucket({ w: 1280, h: 800 })).toBe('landscape')
    expect(aspectBucket({ w: 1440, h: 900 })).toBe('landscape')
    expect(aspectBucket({ w: 820, h: 1180 })).toBe('portrait')
    expect(aspectBucket({ w: 390, h: 844 })).toBe('portrait')
    expect(aspectBucket({ w: 320, h: 640 })).toBe('portrait')
  })

  it('renders correctly at 1280px width (landscape desktop)', () => {
    setDimensions(1280, 800)
    render(
      <MemoryRouter initialEntries={['/learn/html?orbit=constellation']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('group', { name: /Learning Orbit map/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^01 Document structure/i })).toBeInTheDocument()
  })

  it('renders correctly at 820px width (portrait tablet)', () => {
    setDimensions(820, 1180)
    render(
      <MemoryRouter initialEntries={['/learn/html?orbit=constellation']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('group', { name: /Learning Orbit map/i })).toBeInTheDocument()
  })

  it('renders correctly at 390px width (mobile)', () => {
    setDimensions(390, 844)
    render(
      <MemoryRouter initialEntries={['/learn/html?orbit=constellation']}>
        <App />
      </MemoryRouter>,
    )

    // For HTML track (12 topics <= 14), map is still default
    expect(screen.getByRole('group', { name: /Learning Orbit map/i })).toBeInTheDocument()
  })

  it('defaults to list view on narrow screen (< 480px) when topic count > 14 (Rule P-12)', () => {
    setDimensions(390, 844)

    // Create 16 mock topics to exceed 14 threshold
    const extraTopics = [
      ...topics,
      {
        id: 't13',
        technologyId: 'html',
        title: 'Extra 13',
        shortTitle: 'E13',
        groupId: 'together',
        description: 'Extra 13',
        prerequisiteIds: [],
      },
      {
        id: 't14',
        technologyId: 'html',
        title: 'Extra 14',
        shortTitle: 'E14',
        groupId: 'together',
        description: 'Extra 14',
        prerequisiteIds: [],
      },
      {
        id: 't15',
        technologyId: 'html',
        title: 'Extra 15',
        shortTitle: 'E15',
        groupId: 'together',
        description: 'Extra 15',
        prerequisiteIds: [],
      },
      {
        id: 't16',
        technologyId: 'html',
        title: 'Extra 16',
        shortTitle: 'E16',
        groupId: 'together',
        description: 'Extra 16',
        prerequisiteIds: [],
      },
    ]

    const { container } = render(
      <AppStateProvider>
        <MemoryRouter>
          <ConstellationOrbit
            technologyId="html"
            technologyName="HTML"
            technologyGlyph="</>"
            technologyDescription="HTML track"
            topics={extraTopics}
            groups={groups}
          />
        </MemoryRouter>
      </AppStateProvider>,
    )

    // Under rule P-12, defaults to list view
    expect(container.querySelector('.constellation-list-view')).toBeInTheDocument()
  })
})
