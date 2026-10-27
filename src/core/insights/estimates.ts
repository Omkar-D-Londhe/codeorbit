import type { CodeOrbitState } from '../../state/types'
import type { Topic, TopicGroup } from '../../data/types'
import { getLesson } from '../../data/lessons'
import { formatActiveTime } from './activeTime'
import { topicProgress } from '../../lib/progress'

export const MIN_MEASURED_SESSIONS_FOR_ACTUAL = 3
export const DEFAULT_QUIZ_ESTIMATE_MINUTES = 3
export const DEFAULT_PRACTICE_ESTIMATE_MINUTES = 10
export const DEFAULT_LESSON_ESTIMATE_MINUTES = 5

export interface TopicEstimateComparison {
  topicId: string
  topicTitle: string
  groupId: string
  estimatedMinutes: number
  estimatedFormatted: string
  measuredSeconds: number
  measuredFormatted?: string
  sessionCount: number
  hasSufficientSessions: boolean // >= 3 measured sessions (P-07)
}

export interface GroupEstimateComparison {
  groupId: string
  groupTitle: string
  estimatedMinutes: number
  estimatedFormatted: string
  measuredSeconds: number
  measuredFormatted?: string
  qualifyingTopicsCount: number
  totalTopicsCount: number
}

/**
 * Returns estimated minutes for a topic's three steps (lesson, quiz, practice).
 */
export function estimateTopicMinutes(topicId: string): {
  lessonMinutes: number
  quizMinutes: number
  practiceMinutes: number
  totalMinutes: number
} {
  const lesson = getLesson(topicId)
  const lessonMinutes = lesson?.estimatedMinutes && lesson.estimatedMinutes > 0
    ? lesson.estimatedMinutes
    : DEFAULT_LESSON_ESTIMATE_MINUTES

  const quizMinutes = DEFAULT_QUIZ_ESTIMATE_MINUTES
  const practiceMinutes = DEFAULT_PRACTICE_ESTIMATE_MINUTES
  const totalMinutes = lessonMinutes + quizMinutes + practiceMinutes

  return { lessonMinutes, quizMinutes, practiceMinutes, totalMinutes }
}

/**
 * Formats estimated remaining minutes with truthful labelling (4.6, 11.3, L-05).
 * Output matches verbatim requirement: "about N min remaining (estimate)".
 */
export function formatRemainingEstimate(minutes: number): string {
  if (minutes <= 0) return '0 min remaining (estimate)'
  if (minutes < 60) return `about ${minutes} min remaining (estimate)`
  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60
  if (remainingMins === 0) return `about ${hours} h remaining (estimate)`
  return `about ${hours} h ${remainingMins} min remaining (estimate)`
}

/**
 * Calculates remaining estimated minutes for incomplete steps across a list of topics.
 */
export function calculateTrackRemainingEstimate(state: CodeOrbitState, topics: readonly Topic[]): {
  remainingMinutes: number
  formatted: string
  completedTopics: number
  totalTopics: number
} {
  let remainingMinutes = 0
  let completedTopics = 0

  for (const topic of topics) {
    const p = topicProgress(state, topic)
    if (p.status === 'completed' || p.status === 'mastered') {
      completedTopics += 1
      continue
    }

    const { lessonMinutes, quizMinutes, practiceMinutes } = estimateTopicMinutes(topic.id)
    if (!p.lessonDone) remainingMinutes += lessonMinutes
    if (!p.quizPassed) remainingMinutes += quizMinutes
    if (!p.practiceDone) remainingMinutes += practiceMinutes
  }

  return {
    remainingMinutes,
    formatted: formatRemainingEstimate(remainingMinutes),
    completedTopics,
    totalTopics: topics.length,
  }
}

/**
 * Generates per-topic comparison of estimated time vs actual measured time (Catalog 12.2).
 * Strictly enforces Principle P-07: "actual" is withheld if sessionCount < 3.
 */
export function compareTopicEstimates(
  state: CodeOrbitState,
  topics: readonly Topic[]
): TopicEstimateComparison[] {
  return topics.map((t) => {
    const { totalMinutes } = estimateTopicMinutes(t.id)
    const measuredSeconds = state.timeSpent?.[t.id] ?? 0
    const sessionCount = state.timeSpentSessions?.[t.id] ?? 0
    const hasSufficientSessions = sessionCount >= MIN_MEASURED_SESSIONS_FOR_ACTUAL

    return {
      topicId: t.id,
      topicTitle: t.title,
      groupId: t.groupId,
      estimatedMinutes: totalMinutes,
      estimatedFormatted: `about ${totalMinutes} min (estimate)`,
      measuredSeconds,
      measuredFormatted: hasSufficientSessions ? formatActiveTime(measuredSeconds) : undefined,
      sessionCount,
      hasSufficientSessions,
    }
  })
}

/**
 * Compares estimated vs actual time grouped by curriculum TopicGroup (Catalog 12.2).
 * Only aggregates measured actual time for topics that meet the P-07 session gate.
 */
export function compareGroupEstimates(
  state: CodeOrbitState,
  topics: readonly Topic[],
  groups: readonly TopicGroup[]
): GroupEstimateComparison[] {
  const topicComparisons = compareTopicEstimates(state, topics)

  return groups.map((g) => {
    const inGroup = topicComparisons.filter((tc) => tc.groupId === g.id)
    const estimatedMinutes = inGroup.reduce((sum, tc) => sum + tc.estimatedMinutes, 0)
    const qualifying = inGroup.filter((tc) => tc.hasSufficientSessions)
    const measuredSeconds = qualifying.reduce((sum, tc) => sum + tc.measuredSeconds, 0)

    return {
      groupId: g.id,
      groupTitle: g.title,
      estimatedMinutes,
      estimatedFormatted: `about ${estimatedMinutes} min (estimate)`,
      measuredSeconds,
      measuredFormatted: qualifying.length > 0 ? formatActiveTime(measuredSeconds) : undefined,
      qualifyingTopicsCount: qualifying.length,
      totalTopicsCount: inGroup.length,
    }
  })
}
