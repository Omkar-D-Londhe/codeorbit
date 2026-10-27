import { describe, it, expect } from 'vitest'
import { recommend } from '../../core/insights/recommendations'
import { topics } from '../../data/curriculum'
import { createDefaultState } from '../../lib/storage'
import type { CodeOrbitState } from '../../state/types'

describe('Knowledge-Gap Recommendations Engine (Stage 15c, Enhancement 11.4)', () => {
  const track = { id: 'html', topics }

  it('suggests the first foundational topic when no progress has been made', () => {
    const state = createDefaultState()
    const result = recommend(state, track)

    expect(result.next).toBeDefined()
    expect(result.next?.topicId).toBe('html-structure')
    expect(result.next?.reason).toContain('Document structure is ready to start')
    expect(result.gaps).toHaveLength(0)
  })

  it('recommends next topic in curriculum order once its prerequisites are completed', () => {
    const state: CodeOrbitState = {
      ...createDefaultState(),
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

    const result = recommend(state, track)
    expect(result.next).toBeDefined()
    // elements-attributes builds on html-structure
    expect(result.next?.topicId).toBe('elements-attributes')
    expect(result.next?.reason).toContain('prerequisite topics are complete')
  })

  it('identifies knowledge gaps on completed topics with imperfect quiz scores', () => {
    const state: CodeOrbitState = {
      ...createDefaultState(),
      topics: {
        'html-structure': {
          lessonComplete: true,
          quizAttempts: 1,
          quizBest: { correct: 2, total: 3 }, // 2 of 3 is passing but not perfect
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
      errorNotebook: [
        {
          id: 'err-1',
          source: 'quiz',
          topicId: 'html-structure',
          refId: 'q-structure-1',
          title: 'Document doctype',
          detail: 'Missed question 1',
          status: 'open',
          createdAt: 1700000000000,
        },
      ],
    }

    const result = recommend(state, track)
    expect(result.gaps).toHaveLength(1)
    expect(result.gaps[0].topicId).toBe('html-structure')
    expect(result.gaps[0].reason).toContain('2/3')
    expect(result.gaps[0].reason).toContain('Error Notebook review')
  })

  it('returns no next topic when all topics in track are fully complete', () => {
    const state: CodeOrbitState = {
      ...createDefaultState(),
      topics: Object.fromEntries(
        topics.map((t) => [
          t.id,
          {
            lessonComplete: true,
            quizAttempts: 1,
            quizBest: { correct: 3, total: 3 },
          },
        ])
      ),
      challenges: Object.fromEntries(
        topics.map((t) => [
          `ch-${t.id}`,
          {
            attempts: 1,
            hintsRevealed: 0,
            solutionRevealed: false,
            completed: true,
            completedWithoutSolution: true,
          },
        ])
      ),
    }

    const result = recommend(state, track)
    expect(result.next).toBeUndefined()
  })
})
