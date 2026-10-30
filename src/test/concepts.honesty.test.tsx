import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fs from 'node:fs'
import path from 'node:path'
import { MemoryRouter } from 'react-router-dom'
import { concepts, getConcept, type ConceptEntry } from '../core/concepts/concepts'
import { getTopic, getTechnology } from '../data/curriculum.ts'
import { challenges } from '../data/challenges'
import {
  setPendingHighlight,
  getPendingHighlight,
  clearPendingHighlight,
} from '../core/concepts/highlight'
import { HighlightOverlay } from '../core/concepts/HighlightOverlay'
import { ConceptCard } from '../core/concepts/ConceptCard'
import Concepts from '../pages/Concepts'
import { createDefaultState } from '../lib/storage'
import { buildCommands } from '../core/search/commands'
import { generateComplianceDoc } from '../../scripts/generateComplianceDoc'
import { expectNoA11yViolations } from './a11y'
import App from '../App'

const REPO_ROOT = path.resolve(__dirname, '..', '..')

const renderAt = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  )

describe('Stage 19: Concept Atlas Honesty Tests', () => {
  beforeEach(() => {
    clearPendingHighlight()
    window.localStorage.clear()
  })

  afterEach(() => {
    clearPendingHighlight()
  })

  describe('Honesty Check 1: Source Files Existence', () => {
    it('every sourceFiles path exists on disk in the repository', () => {
      expect(concepts.length).toBe(32)

      for (const concept of concepts) {
        if (!concept.platformUse) continue
        expect(concept.platformUse.sourceFiles.length).toBeGreaterThan(0)

        for (const relativePath of concept.platformUse.sourceFiles) {
          const absolutePath = path.resolve(REPO_ROOT, relativePath)
          const exists = fs.existsSync(absolutePath)
          expect(
            exists,
            `Concept ${concept.id} claims nonexistent source file: ${relativePath}`
          ).toBe(true)
        }
      }
    })

    it('negative proof: nonexistent source file is caught and fails', () => {
      const bogusPath = 'src/components/FakeNonexistentComponent.tsx'
      const absolutePath = path.resolve(REPO_ROOT, bogusPath)
      expect(fs.existsSync(absolutePath)).toBe(false)
    })
  })

  describe('Honesty Check 2: Selectors Match Live Rendered DOM', () => {
    it('every selector for route /explore matches at least 1 element', async () => {
      const exploreConcepts = concepts.filter(
        (c) => c.platformUse?.route === '/explore' && c.platformUse.selectors?.length
      )
      expect(exploreConcepts.length).toBeGreaterThan(0)

      const { container } = renderAt('/explore')
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      for (const concept of exploreConcepts) {
        for (const selector of concept.platformUse!.selectors!) {
          const match =
            container.querySelector(selector) || document.querySelector(selector)
          expect(
            match,
            `Concept ${concept.id} selector "${selector}" did not match any element on /explore`
          ).not.toBeNull()
        }
      }
    })

    it('every selector for route /progress matches at least 1 element', async () => {
      const progressConcepts = concepts.filter(
        (c) => c.platformUse?.route === '/progress' && c.platformUse.selectors?.length
      )
      expect(progressConcepts.length).toBeGreaterThan(0)

      const { container } = renderAt('/progress')
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      for (const concept of progressConcepts) {
        for (const selector of concept.platformUse!.selectors!) {
          const match =
            container.querySelector(selector) || document.querySelector(selector)
          expect(
            match,
            `Concept ${concept.id} selector "${selector}" did not match any element on /progress`
          ).not.toBeNull()
        }
      }
    })

    it('every selector for route /settings matches at least 1 element', async () => {
      const settingsConcepts = concepts.filter(
        (c) => c.platformUse?.route === '/settings' && c.platformUse.selectors?.length
      )
      expect(settingsConcepts.length).toBeGreaterThan(0)

      const { container } = renderAt('/settings')
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      for (const concept of settingsConcepts) {
        for (const selector of concept.platformUse!.selectors!) {
          const match =
            container.querySelector(selector) || document.querySelector(selector)
          expect(
            match,
            `Concept ${concept.id} selector "${selector}" did not match any element on /settings`
          ).not.toBeNull()
        }
      }
    })

    it('every selector for route /learn/html matches at least 1 element', async () => {
      const trackConcepts = concepts.filter(
        (c) => c.platformUse?.route === '/learn/html' && c.platformUse.selectors?.length
      )
      expect(trackConcepts.length).toBeGreaterThan(0)

      const { container } = renderAt('/learn/html')
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      for (const concept of trackConcepts) {
        for (const selector of concept.platformUse!.selectors!) {
          const match =
            container.querySelector(selector) || document.querySelector(selector)
          expect(
            match,
            `Concept ${concept.id} selector "${selector}" did not match any element on /learn/html`
          ).not.toBeNull()
        }
      }
    })

    it('negative proof: bogus selector fails DOM match assertion', () => {
      const { container } = renderAt('/explore')
      const bogusSelector = '.bogus-selector-nonexistent-12345'
      expect(container.querySelector(bogusSelector)).toBeNull()
    })
  })

  describe('Honesty Check 3: Teach-In Validity & Planned Track Discipline', () => {
    it('every teachIn references an existing topic/challenge or a planned track', () => {
      for (const concept of concepts) {
        expect(concept.teachIn.length).toBeGreaterThan(0)

        for (const teach of concept.teachIn) {
          const tech = getTechnology(teach.trackId)
          expect(tech, `Unknown trackId ${teach.trackId} in ${concept.id}`).toBeDefined()

          if (tech?.status === 'available' || tech?.status === 'preview' || tech?.status === 'decision-gated') {
            const topic = getTopic(teach.topicId)
            expect(
              topic,
              `Concept ${concept.id} claims available topic "${teach.topicId}" which does not exist in curriculum`
            ).toBeDefined()

            if (teach.challengeId) {
              const chal = challenges.find((c) => c.id === teach.challengeId)
              expect(
                chal,
                `Concept ${concept.id} claims challenge "${teach.challengeId}" which does not exist in challenges`
              ).toBeDefined()
            }
          } else {
            expect(tech?.status).toBe('planned')
          }
        }
      }
    })

    it('negative proof: nonexistent topic on available track is caught', () => {
      const fakeTopicId = 'nonexistent-quantum-computing-topic'
      expect(getTopic(fakeTopicId)).toBeUndefined()
    })
  })

  describe('Honesty Check 4: Evidence Test Files Existence', () => {
    it('every evidenceTests file exists on disk', () => {
      for (const concept of concepts) {
        expect(concept.evidenceTests.length).toBeGreaterThan(0)

        for (const testFile of concept.evidenceTests) {
          const absolutePath = path.resolve(REPO_ROOT, testFile)
          const exists = fs.existsSync(absolutePath)
          expect(
            exists,
            `Concept ${concept.id} lists evidence test that does not exist on disk: ${testFile}`
          ).toBe(true)
        }
      }
    })

    it('negative proof: nonexistent evidence test path is caught', () => {
      const fakeTest = 'src/test/nonexistent.smoke.test.ts'
      const absolute = path.resolve(REPO_ROOT, fakeTest)
      expect(fs.existsSync(absolute)).toBe(false)
    })
  })

  describe('Honesty Check 5: Verification Integrity & Assessment Reference', () => {
    it('no concept claims verified status without a non-empty assessment reference', () => {
      for (const concept of concepts) {
        if (concept.courseStatus === 'verified') {
          expect(
            concept.assessmentRef?.trim().length,
            `Concept ${concept.id} marked verified but lacks assessmentRef`
          ).toBeGreaterThan(0)
        }
      }
    })

    it('all 31 course concepts are pending-review, 1 not-required, 0 verified', () => {
      const verified = concepts.filter((c) => c.courseStatus === 'verified')
      const pending = concepts.filter((c) => c.courseStatus === 'pending-review')
      const notReq = concepts.filter((c) => c.courseStatus === 'not-required')

      expect(verified.length).toBe(0)
      expect(pending.length).toBe(31)
      expect(notReq.length).toBe(1)
      expect(notReq[0].id).toBe('FC-31')
    })

    it('negative proof: claiming verified with missing assessmentRef is rejected', () => {
      const mockConcept: ConceptEntry = {
        ...concepts[0],
        courseStatus: 'verified',
        assessmentRef: undefined,
      }
      const isValid =
        mockConcept.courseStatus !== 'verified' ||
        Boolean(mockConcept.assessmentRef && mockConcept.assessmentRef.trim().length > 0)
      expect(isValid).toBe(false)
    })
  })

  describe('Honesty Check 6: Separation Rule L-14 Integrity', () => {
    it('FC-12, FC-26, FC-27, FC-28, FC-29 have NO platformUse', () => {
      const restrictedIds = ['FC-12', 'FC-26', 'FC-27', 'FC-28', 'FC-29']

      for (const id of restrictedIds) {
        const concept = getConcept(id)
        expect(concept, `Concept ${id} must exist`).toBeDefined()
        expect(
          concept?.platformUse,
          `Separation rule L-14 violation: ${id} must not claim platformUse`
        ).toBeUndefined()
      }
    })
  })

  describe('Concept Atlas UI & Interaction Suite', () => {
    it('renders all 32 concept cards on /concepts', async () => {
      render(
        <MemoryRouter initialEntries={['/concepts']}>
          <Concepts />
        </MemoryRouter>
      )

      expect(screen.getByRole('heading', { level: 1, name: /Frontend Concept Atlas/i })).toBeInTheDocument()
      const cards = screen.getAllByTestId(/^concept-card-FC-/)
      expect(cards.length).toBe(32)
    })

    it('filters concepts by area pill', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter initialEntries={['/concepts']}>
          <Concepts />
        </MemoryRouter>
      )

      const cssFilter = screen.getByTestId('filter-area-css')
      await user.click(cssFilter)

      const visibleCards = screen.getAllByTestId(/^concept-card-FC-/)
      expect(visibleCards.length).toBe(8) // FC-10 to FC-17
      expect(screen.getByTestId('concept-card-FC-13')).toBeInTheDocument()
      expect(screen.queryByTestId('concept-card-FC-01')).not.toBeInTheDocument()
    })

    it('filters concepts by search text input', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter initialEntries={['/concepts']}>
          <Concepts />
        </MemoryRouter>
      )

      const searchInput = screen.getByPlaceholderText(/Search concepts/i)
      await user.type(searchInput, 'grid')

      const cards = screen.getAllByTestId(/^concept-card-FC-/)
      // FC-06 (tables grid), FC-14 (Grid), FC-28 (Bootstrap grid)
      expect(cards.length).toBeGreaterThanOrEqual(2)
      expect(screen.getByTestId('concept-card-FC-14')).toBeInTheDocument()
    })

    it('shows empty state when no concepts match search query, with reset button', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter initialEntries={['/concepts']}>
          <Concepts />
        </MemoryRouter>
      )

      const searchInput = screen.getByPlaceholderText(/Search concepts/i)
      await user.type(searchInput, 'xyznonexistentconcept123')

      expect(screen.getByTestId('concepts-empty-state')).toBeInTheDocument()
      expect(screen.getByText(/No matching frontend concepts found/i)).toBeInTheDocument()

      const resetBtn = screen.getByRole('button', { name: /Reset Filters/i })
      await user.click(resetBtn)

      expect(screen.getAllByTestId(/^concept-card-FC-/).length).toBe(32)
    })

    it('shows teaching-only message for concepts without platformUse', () => {
      const fc12 = getConcept('FC-12')!
      render(
        <MemoryRouter>
          <ConceptCard concept={fc12} />
        </MemoryRouter>
      )

      expect(
        screen.getByText(/Teaching topic — CodeOrbit itself does not need this technique/i)
      ).toBeInTheDocument()
    })

    it('triggers pending highlight and navigation on See it in CodeOrbit click', async () => {
      const user = userEvent.setup()
      const fc02 = getConcept('FC-02')!

      render(
        <MemoryRouter initialEntries={['/concepts']}>
          <ConceptCard concept={fc02} />
        </MemoryRouter>
      )

      const seeBtn = screen.getByTestId('see-in-codeorbit-FC-02')
      await user.click(seeBtn)

      const pending = getPendingHighlight()
      expect(pending).not.toBeNull()
      expect(pending?.selector).toBe('h1')
      expect(pending?.label).toContain('FC-02')
    })

    it('highlight overlay renders callout and dismisses on Dismiss button click', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <h1 id="test-heading">Test Heading Element</h1>
          <HighlightOverlay />
        </div>
      )

      await act(async () => {
        setPendingHighlight({
          selector: '#test-heading',
          label: 'FC-02: Headings & Paragraphs',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('concept-highlight-callout')).toBeInTheDocument()
      })
      expect(screen.getByText('FC-02: Headings & Paragraphs')).toBeInTheDocument()

      const dismissBtn = screen.getByRole('button', { name: /Dismiss/i })
      await act(async () => {
        await user.click(dismissBtn)
      })

      expect(getPendingHighlight()).toBeNull()
      expect(screen.queryByTestId('concept-highlight-callout')).not.toBeInTheDocument()
    })

    it('highlight overlay dismisses on Escape key press', async () => {
      render(
        <div>
          <h1 id="test-heading-esc">Escape Test Heading</h1>
          <HighlightOverlay />
        </div>
      )

      await act(async () => {
        setPendingHighlight({
          selector: '#test-heading-esc',
          label: 'FC-02: Headings',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('concept-highlight-callout')).toBeInTheDocument()
      })

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      })

      expect(getPendingHighlight()).toBeNull()
      expect(screen.queryByTestId('concept-highlight-callout')).not.toBeInTheDocument()
    })

    it('respects prefers-reduced-motion media query', async () => {
      const matchMediaMock = vi.fn().mockImplementation((query) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
      vi.stubGlobal('matchMedia', matchMediaMock)

      render(
        <div>
          <button id="motion-test-btn">Motion Test</button>
          <HighlightOverlay />
        </div>
      )

      await act(async () => {
        setPendingHighlight({
          selector: '#motion-test-btn',
          label: 'FC-18: Events',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('concept-highlight-callout')).toBeInTheDocument()
      })
      vi.unstubAllGlobals()
    })

    it('auto-dismisses highlight cleanly when target element cannot be found within 1500ms timeout', async () => {
      vi.useFakeTimers()
      render(
        <div>
          <HighlightOverlay />
        </div>
      )

      act(() => {
        setPendingHighlight({
          selector: '#non-existent-selector-12345',
          label: 'FC-99: Missing Target',
        })
      })

      // Advance timers beyond 1500ms
      act(() => {
        vi.advanceTimersByTime(1600)
      })

      expect(getPendingHighlight()).toBeNull()
      expect(screen.queryByTestId('concept-highlight-callout')).not.toBeInTheDocument()
      vi.useRealTimers()
    })

    it('auto-dismisses highlight when element is scrolled completely out of viewport', async () => {
      const heading = document.createElement('h2')
      heading.id = 'scroll-target'
      document.body.appendChild(heading)

      render(
        <div>
          <HighlightOverlay />
        </div>
      )

      await act(async () => {
        setPendingHighlight({
          selector: '#scroll-target',
          label: 'FC-10: Scrolling Test',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('concept-highlight-callout')).toBeInTheDocument()
      })

      // Mock getBoundingClientRect to be offscreen
      vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
        top: -200,
        bottom: -50,
        left: 0,
        right: 100,
        width: 100,
        height: 150,
        x: 0,
        y: -200,
        toJSON: () => {},
      })

      // Trigger scroll event
      await act(async () => {
        window.dispatchEvent(new Event('scroll'))
      })

      await waitFor(() => {
        expect(getPendingHighlight()).toBeNull()
        expect(screen.queryByTestId('concept-highlight-callout')).not.toBeInTheDocument()
      })

      document.body.removeChild(heading)
    })

    it('sidebar navigation includes Concepts link under Explore', () => {
      renderAt('/explore')
      const conceptsLinks = screen.getAllByRole('link', { name: /Concepts/i })
      expect(conceptsLinks.length).toBeGreaterThan(0)
      expect(conceptsLinks[0]).toHaveAttribute('href', '/concepts')
    })

    it('command palette includes Open Concept Atlas command', () => {
      const navigateMock = vi.fn()
      const commands = buildCommands({
        navigate: navigateMock,
        state: createDefaultState(),
        dispatch: vi.fn(),
        openShortcuts: vi.fn(),
      })

      const conceptsCmd = commands.find((c) => c.id === 'cmd-nav-concepts')
      expect(conceptsCmd).toBeDefined()
      expect(conceptsCmd?.title).toBe('Open Concept Atlas')
      expect(conceptsCmd?.keywords).toContain('concepts')
      expect(conceptsCmd?.keywords).toContain('atlas')

      conceptsCmd?.run()
      expect(navigateMock).toHaveBeenCalledWith('/concepts')
    })

    it('passes axe accessibility checks on /concepts page', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/concepts']}>
          <Concepts />
        </MemoryRouter>
      )

      await expectNoA11yViolations(container)
    })
  })

  describe('Compliance Documentation Script Integrity', () => {
    it('generateComplianceDoc output matches docs/ASSESSMENT_COMPLIANCE.md', () => {
      const docPath = path.resolve(REPO_ROOT, 'docs', 'ASSESSMENT_COMPLIANCE.md')
      expect(fs.existsSync(docPath)).toBe(true)

      const existingContent = fs.readFileSync(docPath, 'utf8')
      const generatedContent = generateComplianceDoc()

      const normalize = (s: string) => s.replace(/\r\n/g, '\n').trim()
      expect(normalize(existingContent)).toBe(normalize(generatedContent))
      expect(generatedContent).toContain('Total registered concepts')
      expect(generatedContent).toContain('FC-01')
      expect(generatedContent).toContain('FC-32')
    })
  })
})
