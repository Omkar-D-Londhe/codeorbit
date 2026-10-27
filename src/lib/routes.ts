import { challengesForTopic } from '../data/challenges'
import type { LastVisited } from '../state/types'

export const lessonPath = (topicId: string): string => `/lesson/${topicId}`
export const quizPath = (topicId: string): string => `/quiz/${topicId}`
export const practicePath = (challengeId: string): string => `/practice/${challengeId}`
export const trackPath = (technologyId: string): string => `/learn/${technologyId}`
export const masteryPath = (technologyId: string): string => `/learn/${technologyId}/mastery`

export function resumePath(lv: LastVisited): string {
  if (lv.activity === 'quiz') return quizPath(lv.topicId)
  if (lv.activity === 'practice') {
    const id = lv.challengeId ?? challengesForTopic(lv.topicId)[0]?.id
    return id ? practicePath(id) : lessonPath(lv.topicId)
  }
  return lessonPath(lv.topicId)
}

export const ACTIVITY_LABEL = { lesson: 'Lesson', quiz: 'Quick quiz', practice: 'Practice lab' } as const
