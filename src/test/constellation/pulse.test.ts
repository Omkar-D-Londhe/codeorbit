import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePulse } from '../../core/orbit/constellation/usePulse'
import type { TopicProgress, TopicStatus } from '../../lib/progress'

// Mock useMotionAllowed hook
vi.mock('../../core/atmosphere/useMotionAllowed', () => ({
  useMotionAllowed: vi.fn(() => true),
}))

import { useMotionAllowed } from '../../core/atmosphere/useMotionAllowed'

function mockProg(status: TopicStatus, parts: number): TopicProgress {
  return {
    lessonDone: parts >= 1,
    quizPassed: parts >= 2,
    quizPerfect: false,
    practiceDone: parts >= 3,
    usedSolution: false,
    touched: parts > 0,
    parts,
    partsTotal: 3,
    status,
  }
}

describe('Catalog 2.1: Star Pulse on Progress Save (usePulse hook)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMotionAllowed).mockReturnValue(true)
  })

  it('does NOT pulse on initial mount', () => {
    const initialMap: Record<string, TopicProgress> = {
      'topic-1': mockProg('in-progress', 1),
      'topic-2': mockProg('not-started', 0),
    }

    const { result } = renderHook(({ map }) => usePulse(map), {
      initialProps: { map: initialMap },
    })

    expect(result.current.size).toBe(0)
  })

  it('pulses when topic parts increase via real progress save', () => {
    const initialMap: Record<string, TopicProgress> = {
      'topic-1': mockProg('in-progress', 1),
    }

    const { result, rerender } = renderHook(({ map }) => usePulse(map), {
      initialProps: { map: initialMap },
    })

    expect(result.current.size).toBe(0)

    // Parts increase from 1 to 2
    act(() => {
      rerender({
        map: {
          'topic-1': mockProg('in-progress', 2),
        },
      })
    })

    expect(result.current.has('topic-1')).toBe(true)
  })

  it('pulses when topic status transitions to completed', () => {
    const initialMap: Record<string, TopicProgress> = {
      'topic-1': mockProg('in-progress', 2),
    }

    const { result, rerender } = renderHook(({ map }) => usePulse(map), {
      initialProps: { map: initialMap },
    })

    // Status changes to completed
    act(() => {
      rerender({
        map: {
          'topic-1': mockProg('completed', 3),
        },
      })
    })

    expect(result.current.has('topic-1')).toBe(true)
  })

  it('does NOT pulse on simple navigation without progress change', () => {
    const initialMap: Record<string, TopicProgress> = {
      'topic-1': mockProg('in-progress', 1),
      'topic-2': mockProg('not-started', 0),
    }

    const { result, rerender } = renderHook(({ map }) => usePulse(map), {
      initialProps: { map: initialMap },
    })

    // Rerender with identical progress data
    act(() => {
      rerender({
        map: {
          'topic-1': mockProg('in-progress', 1),
          'topic-2': mockProg('not-started', 0),
        },
      })
    })

    expect(result.current.size).toBe(0)
  })

  it('does NOT pulse when reduced motion is preferred', () => {
    vi.mocked(useMotionAllowed).mockReturnValue(false)

    const initialMap: Record<string, TopicProgress> = {
      'topic-1': mockProg('in-progress', 1),
    }

    const { result, rerender } = renderHook(({ map }) => usePulse(map), {
      initialProps: { map: initialMap },
    })

    act(() => {
      rerender({
        map: {
          'topic-1': mockProg('completed', 3),
        },
      })
    })

    expect(result.current.size).toBe(0)
  })
})
