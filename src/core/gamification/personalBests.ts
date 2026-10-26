import type { CodeOrbitState } from '../../state/types'
import { streakInfo, dayKey } from './streak'

export interface QuizBestScore {
  topicId: string
  correct: number
  total: number
  percentage: number
}

export interface FastestPassRecord {
  challengeId: string
  durationMs: number
}

export interface PersonalBestsSummary {
  longestStreak: number
  quizBests: QuizBestScore[]
  fastestPasses: FastestPassRecord[]
}

/**
 * Derives local personal bests strictly on this device (L-20, FC-21).
 * Never introduces peer comparisons or artificial records.
 */
export function derivePersonalBests(state: CodeOrbitState, todayKey = dayKey(Date.now())): PersonalBestsSummary {
  // 1. Longest streak
  const streak = streakInfo(state.activityDays ?? [], todayKey)
  const longestStreak = Math.max(state.streakBest || 0, streak.longest, streak.current)

  // 2. Best quiz score per topic
  const quizBests: QuizBestScore[] = []
  for (const [topicId, rec] of Object.entries(state.topics ?? {})) {
    if (rec?.quizBest && rec.quizBest.total > 0) {
      const { correct, total } = rec.quizBest
      quizBests.push({
        topicId,
        correct,
        total,
        percentage: Math.round((correct / total) * 100),
      })
    }
  }
  quizBests.sort((a, b) => b.percentage - a.percentage || b.correct - a.correct)

  // 3. Fastest pass per challenge (only when timestamps exist)
  const fastestPasses: FastestPassRecord[] = []
  const recorded = state.personalBests ?? {}
  const allChallengeIds = new Set<string>()

  for (const chId of Object.keys(state.challenges ?? {})) {
    allChallengeIds.add(chId)
  }
  for (const key of Object.keys(recorded)) {
    if (key.startsWith('fastestPass:')) {
      allChallengeIds.add(key.slice('fastestPass:'.length))
    }
  }

  for (const challengeId of allChallengeIds) {
    let bestDuration: number | undefined = undefined

    // Check explicitly stored personal best in state.personalBests (key format: fastestPass:${challengeId})
    const stored = recorded[`fastestPass:${challengeId}`]
    if (typeof stored === 'number' && stored > 0) {
      bestDuration = stored
    }

    // Also check checkHistory if available and valid
    const rec = state.challenges?.[challengeId]
    if (rec?.history && rec.history.length > 0) {
      const firstAttempt = rec.history[0]
      const passing = rec.history.find((h) => h.passed === h.total && h.total > 0)
      if (firstAttempt && passing && passing.at >= firstAttempt.at) {
        const diff = passing.at - firstAttempt.at
        if (diff > 0) {
          bestDuration = bestDuration !== undefined ? Math.min(bestDuration, diff) : diff
        }
      }
    }

    if (bestDuration !== undefined) {
      fastestPasses.push({ challengeId, durationMs: bestDuration })
    }
  }

  fastestPasses.sort((a, b) => a.durationMs - b.durationMs)

  return {
    longestStreak,
    quizBests,
    fastestPasses,
  }
}
