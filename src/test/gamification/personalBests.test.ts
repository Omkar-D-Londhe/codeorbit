import { describe, it, expect } from 'vitest'
import { createDefaultState } from '../../lib/storage'
import { reducer } from '../../state/reducer'
import { derivePersonalBests } from '../../core/gamification/personalBests'

describe('Local Personal Bests Derivation (Catalog 8.5)', () => {
  it('handles empty initial state cleanly', () => {
    const bests = derivePersonalBests(createDefaultState(), '2026-10-24')
    expect(bests.longestStreak).toBe(0)
    expect(bests.quizBests).toEqual([])
    expect(bests.fastestPasses).toEqual([])
  })

  it('derives longest streak correctly from activity days and streakBest', () => {
    let s = createDefaultState()
    s = {
      ...s,
      activityDays: ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'],
      streakBest: 4,
    }
    const bests = derivePersonalBests(s, '2026-10-24')
    expect(bests.longestStreak).toBe(4)

    // Historical streakBest survives even if activityDays is smaller or gapped
    s = {
      ...s,
      activityDays: ['2026-10-24'],
      streakBest: 12,
    }
    expect(derivePersonalBests(s, '2026-10-24').longestStreak).toBe(12)
  })

  it('aggregates and sorts quiz best scores by percentage and correct questions', () => {
    let s = createDefaultState()
    s = reducer(s, {
      type: 'QUIZ_FINISH',
      topicId: 'lists',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 2,
      total: 3,
    })
    s = reducer(s, {
      type: 'QUIZ_FINISH',
      topicId: 'links',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 3,
      total: 3,
    })

    const bests = derivePersonalBests(s)
    expect(bests.quizBests).toHaveLength(2)
    // Links (100%) should be first, Lists (67%) second
    expect(bests.quizBests[0]).toEqual({
      topicId: 'links',
      correct: 3,
      total: 3,
      percentage: 100,
    })
    expect(bests.quizBests[1]).toEqual({
      topicId: 'lists',
      correct: 2,
      total: 3,
      percentage: 67,
    })
  })

  it('extracts fastest challenge passes from stored personalBests and check history', () => {
    let s = createDefaultState()
    // Stored via RECORD_PERSONAL_BEST
    s = reducer(s, {
      type: 'RECORD_PERSONAL_BEST',
      key: 'fastestPass:ch-html-structure',
      value: 14500, // 14.5s
    })

    // Also recorded via check history on a different challenge
    s = {
      ...s,
      challenges: {
        'ch-elements-attributes': {
          attempts: 2,
          hintsRevealed: 0,
          solutionRevealed: false,
          completed: true,
          completedWithoutSolution: true,
          history: [
            { at: 10000, passed: 1, total: 3, failedIds: ['f1'] },
            { at: 32000, passed: 3, total: 3, failedIds: [] },
          ],
        },
      },
    }

    const bests = derivePersonalBests(s)
    expect(bests.fastestPasses).toHaveLength(2)
    // Sorted by durationMs ascending
    expect(bests.fastestPasses[0]).toEqual({
      challengeId: 'ch-html-structure',
      durationMs: 14500,
    })
    expect(bests.fastestPasses[1]).toEqual({
      challengeId: 'ch-elements-attributes',
      durationMs: 22000, // 32000 - 10000
    })
  })
})
