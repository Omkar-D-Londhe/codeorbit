import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressCard } from '../../core/orbit/constellation/ProgressCard'
import { computeConstellationCounts } from '../../core/orbit/constellation/state'
import { topics } from '../../data/curriculum'
import type { TopicProgress } from '../../lib/progress'

describe('ProgressCard component', () => {
  it('renders all 4 state counts and they strictly sum to total n', () => {
    const counts = {
      completed: 3,
      inProgress: 2,
      available: 4,
      locked: 3,
      total: 12,
    }

    render(<ProgressCard counts={counts} />)

    // Sum strictly equals n
    expect(counts.completed + counts.inProgress + counts.available + counts.locked).toBe(counts.total)

    expect(screen.getByText(/3 of 12 Complete/i)).toBeInTheDocument()
    expect(screen.getByText('3 Completed')).toBeInTheDocument()
    expect(screen.getByText('2 In Progress')).toBeInTheDocument()
    expect(screen.getByText('4 Available')).toBeInTheDocument()
    expect(screen.getByText('3 Locked')).toBeInTheDocument()
  })

  it('percentage is never 100% unless every single topic is complete', () => {
    // 11 of 12 complete (91.66% -> Math.floor is 91%)
    const countsNearComplete = {
      completed: 11,
      inProgress: 1,
      available: 0,
      locked: 0,
      total: 12,
    }

    const { rerender } = render(<ProgressCard counts={countsNearComplete} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '91')

    // 12 of 12 complete -> 100%
    const countsFull = {
      completed: 12,
      inProgress: 0,
      available: 0,
      locked: 0,
      total: 12,
    }
    rerender(<ProgressCard counts={countsFull} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('computeConstellationCounts computes counts matching topic list and progress map', () => {
    const progressMap: Record<string, TopicProgress> = {
      'html-structure': {
        status: 'completed',
        lessonDone: true,
        quizPassed: true,
        quizPerfect: true,
        practiceDone: true,
        usedSolution: false,
        touched: true,
        parts: 3,
        partsTotal: 3,
      },
      'elements-attributes': {
        status: 'in-progress',
        lessonDone: true,
        quizPassed: false,
        quizPerfect: false,
        practiceDone: false,
        usedSolution: false,
        touched: true,
        parts: 1,
        partsTotal: 3,
      },
    }

    const counts = computeConstellationCounts(topics, progressMap)
    expect(counts.total).toBe(topics.length)
    expect(counts.completed).toBe(1)
    expect(counts.inProgress).toBe(1)
    expect(counts.completed + counts.inProgress + counts.available + counts.locked).toBe(topics.length)
  })
})
