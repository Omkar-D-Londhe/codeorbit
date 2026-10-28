import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { Announcer, announce, resetAnnouncerState } from '../../core/a11y/Announcer'
import { detectProgressAnnouncements } from '../../core/a11y/progressAnnouncements'
import { createDefaultState } from '../../lib/storage'
import type { CodeOrbitState } from '../../state/types'

describe('Unified Announcer (Catalog 13.4, Spec §8 & §11)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetAnnouncerState()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders polite and assertive live regions with proper ARIA attributes', () => {
    const { container } = render(<Announcer />)
    const polite = container.querySelector('[aria-live="polite"]')
    const assertive = container.querySelector('[aria-live="assertive"]')

    expect(polite).toBeInTheDocument()
    expect(polite).toHaveAttribute('role', 'status')
    expect(polite).toHaveAttribute('aria-atomic', 'true')

    expect(assertive).toBeInTheDocument()
    expect(assertive).toHaveAttribute('role', 'alert')
    expect(assertive).toHaveAttribute('aria-atomic', 'true')
  })

  it('announces polite messages and updates the live region', () => {
    const { container } = render(<Announcer />)
    const polite = container.querySelector('[aria-live="polite"]')

    act(() => {
      announce('Lesson completed: HTML Elements', 'polite')
    })

    expect(polite?.textContent).toBe('Lesson completed: HTML Elements')
  })

  it('deduplicates identical messages within 1.5 seconds', () => {
    const { container } = render(<Announcer />)
    const polite = container.querySelector('[aria-live="polite"]')

    act(() => {
      announce('Duplicate message test', 'polite')
    })
    expect(polite?.textContent).toBe('Duplicate message test')

    // Same message immediately
    act(() => {
      announce('Duplicate message test', 'polite')
    })
    // Still the same single message
    expect(polite?.textContent).toBe('Duplicate message test')

    // Advance 1000ms (within 1.5s window)
    act(() => {
      vi.advanceTimersByTime(1000)
      announce('Duplicate message test', 'polite')
    })

    // Advance past 1500ms window (e.g. 1600ms total)
    act(() => {
      vi.advanceTimersByTime(600)
      announce('Duplicate message test', 'polite')
    })

    expect(polite?.textContent).toBe('Duplicate message test')
  })

  it('bounds queue depth at max 3 items to never flood assistive tech', () => {
    const { container } = render(<Announcer />)
    const polite = container.querySelector('[aria-live="polite"]')

    act(() => {
      announce('Message 1', 'polite') // speaks immediately
      announce('Message 2', 'polite') // queue 1
      announce('Message 3', 'polite') // queue 2
      announce('Message 4', 'polite') // queue 3
      announce('Message 5', 'polite') // dropped (queue full)
    })

    expect(polite?.textContent).toBe('Message 1')

    // Process queue item 1
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(polite?.textContent).toBe('Message 2')

    // Process queue item 2
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(polite?.textContent).toBe('Message 3')

    // Process queue item 3
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(polite?.textContent).toBe('Message 4')

    // No item 5 exists in queue
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(polite?.textContent).toBe('Message 4')
  })

  it('updates assertive live region immediately for critical alerts', () => {
    const { container } = render(<Announcer />)
    const assertive = container.querySelector('[aria-live="assertive"]')

    act(() => {
      announce('Focus mode activated', 'assertive')
    })

    expect(assertive?.textContent).toBe('Focus mode activated')
  })

  describe('detectProgressAnnouncements', () => {
    it('detects lesson completion, quiz pass/perfect, and challenge pass', () => {
      const prev = createDefaultState()
      const next: CodeOrbitState = {
        ...prev,
        topics: {
          ...prev.topics,
          'html-intro': {
            lessonComplete: true,
            quizAttempts: 1,
            quizBest: { correct: 3, total: 3 },
          },
        },
        challenges: {
          ...prev.challenges,
          'ch-html-tags': {
            attempts: 1,
            hintsRevealed: 0,
            solutionRevealed: false,
            completed: true,
            completedWithoutSolution: true,
          },
        },
      }

      const announcements = detectProgressAnnouncements(prev, next)
      expect(announcements.some((a) => a.message.includes('Lesson completed'))).toBe(true)
      expect(announcements.some((a) => a.message.includes('Quiz completed with perfect score'))).toBe(true)
      expect(announcements.some((a) => a.message.includes('Practice challenge passed'))).toBe(true)
    })

    it('silences all progress announcements when settings.announcements is false', () => {
      const prev = createDefaultState()
      const next: CodeOrbitState = {
        ...prev,
        settings: {
          ...prev.settings,
          announcements: false,
        },
        topics: {
          ...prev.topics,
          'html-intro': {
            lessonComplete: true,
            quizAttempts: 1,
            quizBest: { correct: 3, total: 3 },
          },
        },
      }

      const announcements = detectProgressAnnouncements(prev, next)
      expect(announcements).toEqual([])
    })
  })
})
