import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import App from '../App'
import { topics } from '../data/curriculum'
import { createDefaultState, STORAGE_KEY } from '../lib/storage'
import { buildCommands } from '../core/search/commands'

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

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )

const prerequisiteEdges = topics.flatMap((t) =>
  (t.prerequisiteIds || []).map((p) => ({ from: p, to: t.id }))
)

beforeEach(() => {
  setWidth(1440)
  window.localStorage.clear()
})

describe('Mastery map page (REF-02, Stage 15a)', () => {
  it('shows the graph with all 12 topics and only real edges on wide screens', () => {
    renderAt('/learn/html/mastery')
    expect(document.querySelectorAll('.mastery-node')).toHaveLength(12)
    expect(document.querySelectorAll('.mastery__edge')).toHaveLength(prerequisiteEdges.length)
  })

  it('selecting a node explains its status and highlights only its real edges', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html/mastery')
    await user.click(document.querySelector('[data-topic-id="semantic-layout"]')!)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Semantic page layout' })
    ).toBeInTheDocument()
    expect(document.querySelectorAll('.mastery__edge--active')).toHaveLength(3)
    expect(
      screen.getByRole('list', { name: /mastery criteria/i })
    ).toHaveTextContent(/Not taken/)
    expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute(
      'href',
      '/lesson/semantic-layout'
    )
  })

  it('explains why mastery is impossible after revealing the solution first', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 6,
        topics: {
          lists: {
            lessonComplete: true,
            quizAttempts: 1,
            quizBest: { correct: 3, total: 3 },
          },
        },
        challenges: {
          'ch-lists': {
            attempts: 2,
            hintsRevealed: 0,
            solutionRevealed: true,
            completed: true,
            completedWithoutSolution: false,
          },
        },
      })
    )
    const user = userEvent.setup()
    renderAt('/learn/html/mastery')
    await user.click(document.querySelector('[data-topic-id="lists"]')!)
    expect(
      screen.getByText(/Not possible: solution revealed first/)
    ).toBeInTheDocument()
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
    expect(
      screen.getByText(
        /A learning aid, not an exam grade\. Later review results are not part of the criteria\./
      )
    ).toBeInTheDocument()
  })

  it('falls back to a structured list on narrow screens (same data, no graph)', () => {
    setWidth(390)
    renderAt('/learn/html/mastery')
    expect(document.querySelector('.mastery__graph')).toBeNull()
    expect(
      screen.getByRole('list', { name: /grouped by prerequisite level/i })
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Builds on:/).length).toBeGreaterThan(0)
  })

  it('renders Heatmap view with legend and status chips', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html/mastery')

    const heatmapTab = screen.getByRole('tab', { name: /heatmap/i })
    await user.click(heatmapTab)

    expect(screen.getByLabelText('Mastery heatmap')).toBeInTheDocument()
    expect(screen.getByText('Legend:')).toBeInTheDocument()

    // Select topic within heatmap
    const items = document.querySelectorAll('.mastery-heatmap__item')
    expect(items.length).toBe(12)
    await user.click(items[1])
    expect(items[1]).toHaveAttribute('aria-current', 'true')
  })

  it('supports roving tabindex keyboard navigation across topics and levels', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html/mastery')

    const firstNode = document.querySelector('[data-topic-id="html-structure"]') as HTMLElement
    expect(firstNode).toHaveAttribute('tabIndex', '0')
    firstNode.focus()

    // Arrow right to depth 1 (elements-attributes)
    await user.keyboard('{ArrowRight}')
    const depth1Node = document.querySelector('[data-topic-id="elements-attributes"]') as HTMLElement
    expect(depth1Node).toHaveAttribute('tabIndex', '0')
    expect(firstNode).toHaveAttribute('tabIndex', '-1')

    // Arrow down within depth 1 (headings-paragraphs)
    await user.keyboard('{ArrowDown}')
    const secondDepth1Node = document.querySelector('[data-topic-id="headings-paragraphs"]') as HTMLElement
    expect(secondDepth1Node).toHaveAttribute('tabIndex', '0')
    expect(depth1Node).toHaveAttribute('tabIndex', '-1')

    // Arrow up within depth 1
    await user.keyboard('{ArrowUp}')
    expect(depth1Node).toHaveAttribute('tabIndex', '0')
    expect(secondDepth1Node).toHaveAttribute('tabIndex', '-1')

    // Arrow left back to depth 0
    await user.keyboard('{ArrowLeft}')
    expect(firstNode).toHaveAttribute('tabIndex', '0')
    expect(depth1Node).toHaveAttribute('tabIndex', '-1')

    // Home / End within depth column
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{End}')
    expect(secondDepth1Node).toHaveAttribute('tabIndex', '0')

    await user.keyboard('{Home}')
    expect(depth1Node).toHaveAttribute('tabIndex', '0')
  })

  it('the track page links to the track-scoped mastery map', () => {
    renderAt('/learn/html')
    const links = screen.getAllByRole('link', { name: /mastery map/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', '/learn/html/mastery')
  })

  it('/mastery redirects to default track map /learn/html/mastery', () => {
    renderAt('/mastery')
    expect(document.querySelectorAll('.mastery-node')).toHaveLength(12)
    expect(screen.getByRole('heading', { level: 1, name: 'Mastery map' })).toBeInTheDocument()
  })

  it('includes command palette entry for mastery map', () => {
    let target = ''
    const cmds = buildCommands({
      navigate: (p) => {
        target = p
      },
      state: createDefaultState(),
      dispatch: () => {},
      openShortcuts: () => {},
    })
    const cmd = cmds.find((c) => c.id === 'cmd-nav-mastery')
    expect(cmd).toBeDefined()
    expect(cmd?.title).toBe('Go to Mastery Map')
    cmd?.run()
    expect(target).toBe('/learn/html/mastery')
  })
})

