import type { CodeOrbitState } from '../../state/types'
import { getTopic } from '../../data/curriculum'
import { getChallenge } from '../../data/challenges'
import { isPass, isPerfect } from '../../lib/quiz'
import { computeXp } from '../gamification/xp'
import { evaluateAchievements } from '../gamification/achievements'

export interface ProgressAnnouncement {
  id: string
  message: string
  politeness: 'polite' | 'assertive'
}

/**
 * Maps derived state transitions (lesson completed, quiz result, challenge pass,
 * level up, badge earned) to concise announcements for assistive technologies (Catalog 13.4).
 * Silenced if settings.announcements is false.
 */
export function detectProgressAnnouncements(
  prevState: CodeOrbitState,
  nextState: CodeOrbitState
): ProgressAnnouncement[] {
  // Respect user preference (defaults to true)
  if (nextState.settings.announcements === false) {
    return []
  }

  const announcements: ProgressAnnouncement[] = []

  // 1. Lesson Completed
  for (const [topicId, rec] of Object.entries(nextState.topics ?? {})) {
    const prevRec = prevState.topics?.[topicId]
    if (!prevRec?.lessonComplete && rec?.lessonComplete) {
      const topic = getTopic(topicId)
      const title = topic?.title ?? topicId
      announcements.push({
        id: `lesson-${topicId}`,
        message: `Lesson completed: ${title}`,
        politeness: 'polite',
      })
    }
  }

  // 2. Quiz Result (pass or perfect)
  for (const [topicId, rec] of Object.entries(nextState.topics ?? {})) {
    const prevAttempts = prevState.topics?.[topicId]?.quizAttempts ?? 0
    const nextAttempts = rec?.quizAttempts ?? 0
    if (nextAttempts > prevAttempts && rec?.quizBest) {
      const topic = getTopic(topicId)
      const title = topic?.title ?? topicId
      const score = rec.quizBest
      if (isPerfect(score)) {
        announcements.push({
          id: `quiz-${topicId}-${nextAttempts}`,
          message: `Quiz completed with perfect score: ${score.correct} of ${score.total} on ${title}`,
          politeness: 'polite',
        })
      } else if (isPass(score)) {
        announcements.push({
          id: `quiz-${topicId}-${nextAttempts}`,
          message: `Quiz passed: ${score.correct} of ${score.total} on ${title}`,
          politeness: 'polite',
        })
      } else {
        announcements.push({
          id: `quiz-${topicId}-${nextAttempts}`,
          message: `Quiz completed: ${score.correct} of ${score.total} on ${title}`,
          politeness: 'polite',
        })
      }
    }
  }

  // 3. Challenge Pass
  for (const [challengeId, rec] of Object.entries(nextState.challenges ?? {})) {
    const prevRec = prevState.challenges?.[challengeId]
    if (!prevRec?.completed && rec?.completed) {
      const ch = getChallenge(challengeId)
      const title = ch?.title ?? challengeId
      announcements.push({
        id: `challenge-${challengeId}`,
        message: `Practice challenge passed: ${title}`,
        politeness: 'polite',
      })
    }
  }

  // 4. Level Up
  const prevLevel = computeXp(prevState).level
  const nextLevel = computeXp(nextState).level
  if (nextLevel > prevLevel) {
    announcements.push({
      id: `level-${nextLevel}`,
      message: `Level up: Reached Level ${nextLevel}!`,
      politeness: 'polite',
    })
  }

  // 5. Badge Earned
  const prevBadges = new Set(Object.keys(prevState.badges ?? {}))
  for (const [badgeId, badgeRec] of Object.entries(nextState.badges ?? {})) {
    if (!prevBadges.has(badgeId) && !badgeRec.backfilled) {
      const ach = evaluateAchievements(nextState).find((a) => a.id === badgeId)
      const title = ach?.title ?? badgeId
      announcements.push({
        id: `badge-${badgeId}`,
        message: `Badge earned: ${title}!`,
        politeness: 'polite',
      })
    }
  }

  // Also catch newly evaluated achievements (if not explicitly stored in state.badges yet)
  const prevAchievements = new Set(
    evaluateAchievements(prevState)
      .filter((a) => a.earned)
      .map((a) => a.id)
  )
  for (const ach of evaluateAchievements(nextState)) {
    if (ach.earned && !prevAchievements.has(ach.id)) {
      const alreadyAdded = announcements.some((a) => a.id === `badge-${ach.id}`)
      const isBackfilled = nextState.badges?.[ach.id]?.backfilled
      if (!alreadyAdded && !isBackfilled) {
        announcements.push({
          id: `badge-${ach.id}`,
          message: `Badge earned: ${ach.title}!`,
          politeness: 'polite',
        })
      }
    }
  }

  return announcements
}
