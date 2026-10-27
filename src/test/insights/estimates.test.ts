import { describe, it, expect } from 'vitest'
import {
  calculateTrackRemainingEstimate,
  compareTopicEstimates,
  compareGroupEstimates,
  formatRemainingEstimate,
  MIN_MEASURED_SESSIONS_FOR_ACTUAL,
} from '../../core/insights/estimates'
import { topics, groups } from '../../data/curriculum'
import { createDefaultState } from '../../lib/storage'
import type { CodeOrbitState } from '../../state/types'

describe('Time Estimates & P-07 Gate (Stage 15c, Enhancements 11.3 & 12.2)', () => {
  it('formats remaining estimate according to authoritative verbatim specification', () => {
    expect(formatRemainingEstimate(0)).toBe('0 min remaining (estimate)')
    expect(formatRemainingEstimate(25)).toBe('about 25 min remaining (estimate)')
    expect(formatRemainingEstimate(60)).toBe('about 1 h remaining (estimate)')
    expect(formatRemainingEstimate(85)).toBe('about 1 h 25 min remaining (estimate)')
  })

  it('calculates remaining minutes across track topics and decrements on step completion', () => {
    const state = createDefaultState()
    const fullEstimate = calculateTrackRemainingEstimate(state, topics)

    expect(fullEstimate.totalTopics).toBe(topics.length)
    expect(fullEstimate.completedTopics).toBe(0)
    expect(fullEstimate.remainingMinutes).toBeGreaterThan(0)
    expect(fullEstimate.formatted).toContain('remaining (estimate)')

    // Complete first topic's lesson
    const updatedState: CodeOrbitState = {
      ...state,
      topics: {
        'html-structure': {
          lessonComplete: true,
          quizAttempts: 0,
        },
      },
    }
    const stepEstimate = calculateTrackRemainingEstimate(updatedState, topics)
    expect(stepEstimate.remainingMinutes).toBeLessThan(fullEstimate.remainingMinutes)
  })

  it('strictly enforces Principle P-07: suppresses actual time when session count < 3', () => {
    const state: CodeOrbitState = {
      ...createDefaultState(),
      timeSpent: {
        'html-structure': 900, // 15 mins accumulated
        'elements-attributes': 1800, // 30 mins accumulated
      },
      timeSpentSessions: {
        'html-structure': 2, // < 3 sessions -> MUST NOT SHOW ACTUAL
        'elements-attributes': 3, // >= 3 sessions -> ELIGIBLE FOR ACTUAL
      },
    }

    const topicComparisons = compareTopicEstimates(state, topics)
    const struct = topicComparisons.find((t) => t.topicId === 'html-structure')!
    const elem = topicComparisons.find((t) => t.topicId === 'elements-attributes')!

    expect(MIN_MEASURED_SESSIONS_FOR_ACTUAL).toBe(3)

    // html-structure: 2 sessions
    expect(struct.sessionCount).toBe(2)
    expect(struct.hasSufficientSessions).toBe(false)
    expect(struct.measuredFormatted).toBeUndefined()
    expect(struct.estimatedFormatted).toContain('estimate')

    // elements-attributes: 3 sessions
    expect(elem.sessionCount).toBe(3)
    expect(elem.hasSufficientSessions).toBe(true)
    expect(elem.measuredFormatted).toBeDefined()
    expect(elem.measuredFormatted).toBe('30 min')
  })

  it('aggregates group estimates and only shows actual for groups with qualifying sessions', () => {
    const state: CodeOrbitState = {
      ...createDefaultState(),
      timeSpent: {
        'html-structure': 1200,
      },
      timeSpentSessions: {
        'html-structure': 3,
      },
    }

    const groupComparisons = compareGroupEstimates(state, topics, groups)
    const foundations = groupComparisons.find((g) => g.groupId === 'foundations')!
    const media = groupComparisons.find((g) => g.groupId === 'media')!

    expect(foundations.qualifyingTopicsCount).toBe(1)
    expect(foundations.measuredFormatted).toBe('20 min')

    expect(media.qualifyingTopicsCount).toBe(0)
    expect(media.measuredFormatted).toBeUndefined()
  })
})
