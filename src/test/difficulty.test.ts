import { describe, it, expect } from 'vitest'
import { isChallengeRecommended } from '../core/learning/difficulty'
import { createDefaultState } from '../lib/storage'
import type { Challenge } from '../data/types'

describe('Difficulty Progression (6.10)', () => {
  const dummyChallenge = (difficulty: 'beginner' | 'intermediate' | 'advanced'): Challenge => ({
    id: `ch-${difficulty}`,
    topicId: 'test-topic',
    title: 'Test Challenge',
    difficulty,
    prompt: 'Prompt',
    objective: 'Objective',
    starterCode: '<p>Start</p>',
    solutionCode: '<p>Solution</p>',
    solutionExplanation: ['Exp 1', 'Exp 2', 'Exp 3'],
    requirements: [],
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
  })

  it('always recommends beginner challenges', () => {
    const state = createDefaultState()
    const res = isChallengeRecommended(dummyChallenge('beginner'), state)
    expect(res.recommended).toBe(true)
    expect(res.level).toBe('beginner')
  })

  it('provides soft guidance for intermediate when no challenges completed yet', () => {
    const state = createDefaultState()
    const res = isChallengeRecommended(dummyChallenge('intermediate'), state)
    expect(res.recommended).toBe(false)
    expect(res.reason).toContain('Beginner challenges first')

    // Once a challenge is completed, intermediate becomes recommended
    state.challenges['ch-1'] = {
      attempts: 1,
      hintsRevealed: 0,
      solutionRevealed: false,
      completed: true,
      completedWithoutSolution: true,
    }
    const resAfter = isChallengeRecommended(dummyChallenge('intermediate'), state)
    expect(resAfter.recommended).toBe(true)
  })

  it('provides soft guidance for advanced when fewer than 3 challenges completed', () => {
    const state = createDefaultState()
    const res = isChallengeRecommended(dummyChallenge('advanced'), state)
    expect(res.recommended).toBe(false)
    expect(res.reason).toContain('Mastering Beginner and Intermediate')
  })
})
