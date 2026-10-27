import { describe, it, expect } from 'vitest'
import { calculateQuizBreakdown } from '../../core/insights/quizBreakdown'
import { topics } from '../../data/curriculum'
import { createDefaultState } from '../../lib/storage'
import type { CodeOrbitState } from '../../state/types'

describe('Quiz Performance Breakdown Derivation (Stage 15c, Enhancement 12.3)', () => {
  it('initializes quiz items with not-started status when no attempts exist', () => {
    const state = createDefaultState()
    const summary = calculateQuizBreakdown(state, topics)

    expect(summary.totalQuizzes).toBe(topics.length)
    expect(summary.attemptedQuizzes).toBe(0)
    expect(summary.passedQuizzes).toBe(0)
    expect(summary.perfectQuizzes).toBe(0)
    expect(summary.weakCount).toBe(0)

    const first = summary.items[0]
    expect(first.status).toBe('not-started')
    expect(first.attemptsCount).toBe(0)
    expect(first.bestScore).toBeUndefined()
    expect(first.isWeak).toBe(false)
  })

  it('correctly categorizes passed, perfect, and weak (<70%) quizzes', () => {
    const state: CodeOrbitState = {
      ...createDefaultState(),
      topics: {
        'html-structure': {
          lessonComplete: true,
          quizAttempts: 1,
          quizBest: { correct: 3, total: 3 }, // 100% -> perfect
        },
        'elements-attributes': {
          lessonComplete: true,
          quizAttempts: 2,
          quizBest: { correct: 2, total: 3 }, // 66.7% -> passed (>= 2/3) but < 70% -> weak
        },
        'headings-paragraphs': {
          lessonComplete: true,
          quizAttempts: 1,
          quizBest: { correct: 1, total: 3 }, // 33.3% -> failed & weak
        },
      },
    }

    const summary = calculateQuizBreakdown(state, topics)
    expect(summary.attemptedQuizzes).toBe(3)
    expect(summary.passedQuizzes).toBe(2)
    expect(summary.perfectQuizzes).toBe(1)
    expect(summary.weakCount).toBe(2)

    const struct = summary.items.find((it) => it.topicId === 'html-structure')!
    expect(struct.status).toBe('perfect')
    expect(struct.bestScore?.percentage).toBe(100)
    expect(struct.isWeak).toBe(false)
    expect(struct.retriesCount).toBe(0)

    const elem = summary.items.find((it) => it.topicId === 'elements-attributes')!
    expect(elem.status).toBe('passed')
    expect(elem.bestScore?.percentage).toBe(67)
    expect(elem.isWeak).toBe(true)
    expect(elem.retriesCount).toBe(1)

    const head = summary.items.find((it) => it.topicId === 'headings-paragraphs')!
    expect(head.status).toBe('failed')
    expect(head.isWeak).toBe(true)
  })
})
