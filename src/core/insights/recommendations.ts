import type { CodeOrbitState } from '../../state/types'
import type { Topic } from '../../data/types'
import { topicProgress } from '../../lib/progress'

export interface Recommendation {
  topicId: string
  topicTitle: string
  reason: string
}

export interface RecommendationsResult {
  next?: Recommendation
  gaps: Recommendation[]
}

/**
 * Pure recommendation engine (spec §7.9, §8, Enhancement 11.4):
 * - next: first incomplete topic in curriculum order whose prerequisites are all completed.
 * - gaps: completed topics with quiz best < perfect and quiz error entries still open (or no full review).
 */
export function recommend(
  state: CodeOrbitState,
  track: { id: string; topics: readonly Topic[] }
): RecommendationsResult {
  const topics = track.topics
  let next: Recommendation | undefined

  // 1. Next best topic
  for (const t of topics) {
    const p = topicProgress(state, t)
    if (p.status !== 'completed' && p.status !== 'mastered') {
      // Check if all declared prerequisites are completed
      const prereqsDone = t.prerequisiteIds.every((preId) => {
        const preTopic = topics.find((topic) => topic.id === preId)
        if (!preTopic) return true // missing prerequisite IDs tolerated safely
        const prep = topicProgress(state, preTopic)
        return prep.status === 'completed' || prep.status === 'mastered'
      })

      if (prereqsDone) {
        const reason = t.prerequisiteIds.length === 0
          ? `${t.title} is ready to start as the foundational topic of the track.`
          : `${t.title} is recommended next because all of its prerequisite topics are complete.`

        next = {
          topicId: t.id,
          topicTitle: t.title,
          reason,
        }
        break
      }
    }
  }

  // 2. Knowledge gaps
  const gaps: Recommendation[] = []
  for (const t of topics) {
    const p = topicProgress(state, t)
    const topicRecord = state.topics?.[t.id]

    // Completed topic with quiz best < perfect
    if ((p.status === 'completed' || p.status === 'mastered') && topicRecord?.quizBest) {
      const best = topicRecord.quizBest
      if (best.correct < best.total) {
        const hasOpenErrors = (state.errorNotebook || []).some(
          (err) => err.topicId === t.id && err.status === 'open'
        )

        const reason = hasOpenErrors
          ? `${t.title} was completed with a quiz score of ${best.correct}/${best.total} and has open Error Notebook review items.`
          : `${t.title} was completed with a quiz score of ${best.correct}/${best.total} — reviewing key concepts will solidify mastery.`

        gaps.push({
          topicId: t.id,
          topicTitle: t.title,
          reason,
        })
      }
    }
  }

  return { next, gaps }
}
