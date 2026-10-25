/**
 * Challenge Difficulty Progression (Stage 06, 6.10).
 * Soft progression model: Beginner -> Intermediate -> Advanced.
 * Recommends foundational challenges first, but NEVER blocks or disables access (O-16 aligned).
 */
import type { Challenge } from '../content/types'
import type { CodeOrbitState } from '../../state/types'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export const DIFFICULTY_ORDER: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

export interface RecommendationResult {
  recommended: boolean
  level: DifficultyLevel
  reason?: string
}

/**
 * Determines whether a challenge is recommended based on prior completion state.
 * Soft gate: returns recommendation rationale without blocking learner access.
 */
export function isChallengeRecommended(
  challenge: Challenge,
  state: CodeOrbitState
): RecommendationResult {
  const level = (challenge.difficulty || 'beginner').toLowerCase() as DifficultyLevel

  if (level === 'beginner') {
    return { recommended: true, level }
  }

  // Count how many challenges of previous tier are completed
  const completedChallenges = state.challenges || {}

  if (level === 'intermediate') {
    const hasAnyCompleted = Object.values(completedChallenges).some((c) => Boolean(c?.completed))
    if (!hasAnyCompleted) {
      return {
        recommended: false,
        level,
        reason: 'Try Beginner challenges first — recommended, not required.',
      }
    }
    return { recommended: true, level }
  }

  if (level === 'advanced') {
    const completedCount = Object.values(completedChallenges).filter((c) => Boolean(c?.completed)).length
    if (completedCount < 3) {
      return {
        recommended: false,
        level,
        reason: 'Mastering Beginner and Intermediate challenges first is recommended.',
      }
    }
    return { recommended: true, level }
  }

  return { recommended: true, level }
}
