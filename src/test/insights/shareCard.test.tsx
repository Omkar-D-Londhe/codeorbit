import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ShareCard, buildShareCardStats } from '../../core/insights/ShareCard'
import { AppStateProvider } from '../../state/AppState'
import { createDefaultState } from '../../lib/storage'
import type { CodeOrbitState } from '../../state/types'
import { topics } from '../../data/curriculum'

const mockTrack = {
  id: 'html',
  name: 'HTML',
  glyph: '</>',
  description: 'HTML track',
  status: 'available' as const,
  topicIds: topics.map((t) => t.id),
  topics,
  groups: [],
}

describe('Progress Sharing Card (Stage 15c, Catalog 12.5)', () => {
  it('buildShareCardStats extracts only truthful, visible metrics and omits empty fields', () => {
    const defaultState = createDefaultState()
    const stats = buildShareCardStats(defaultState, mockTrack)

    expect(stats).not.toBeNull()
    expect(stats!.trackName).toBe('HTML')
    expect(stats!.userName).toBeUndefined()
    expect(stats!.streakDays).toBeUndefined() // streak is 0 -> omitted
    expect(stats!.completedTopics).toBe(0)
    expect(stats!.totalTopics).toBe(topics.length)
    expect(stats!.masteredTopics).toBe(0)
    expect(stats!.level).toBe(0)
  })

  it('includes learner name, streak > 0, and mastered count when present in state', () => {
    const activeState: CodeOrbitState = {
      ...createDefaultState(),
      settings: {
        ...createDefaultState().settings,
        userName: 'Ada Lovelace',
      },
      activityDays: ['2026-10-26', '2026-10-27'], // 2-day streak
      topics: {
        'html-structure': {
          lessonComplete: true,
          quizAttempts: 1,
          quizBest: { correct: 3, total: 3 },
        },
      },
      challenges: {
        'ch-html-structure': {
          attempts: 1,
          hintsRevealed: 0,
          solutionRevealed: false,
          completed: true,
          completedWithoutSolution: true,
        },
      },
    }

    const stats = buildShareCardStats(activeState, mockTrack)
    expect(stats!.userName).toBe('Ada Lovelace')
    expect(stats!.streakDays).toBe(2)
    expect(stats!.completedTopics).toBe(1)
    expect(stats!.masteredTopics).toBe(1)
  })

  it('omits level and XP when gamification is disabled in settings', () => {
    const nongamifiedState: CodeOrbitState = {
      ...createDefaultState(),
      settings: {
        ...createDefaultState().settings,
        gamificationEnabled: false,
      },
    }

    const stats = buildShareCardStats(nongamifiedState, mockTrack)
    expect(stats!.level).toBeUndefined()
    expect(stats!.xp).toBeUndefined()
  })

  it('renders canvas with descriptive aria-label and textual summary in DOM', () => {
    const { getByRole, getByText } = render(
      <AppStateProvider>
        <ShareCard />
      </AppStateProvider>
    )

    const canvas = getByRole('img')
    expect(canvas).toBeDefined()
    expect(canvas.getAttribute('aria-label')).toContain('HTML track')
    expect(canvas.getAttribute('aria-label')).toContain('topics complete')

    // Download button
    expect(getByText('Download Progress Card (PNG)')).toBeDefined()

    // Screen-reader accessible alternative
    const summary = getByRole('region', { name: /Progress sharing card textual alternative/i })
    expect(summary).toBeDefined()
    expect(summary.textContent).toContain('HTML')
  })
})
