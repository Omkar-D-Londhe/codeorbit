import type { CodeOrbitState } from '../../state/types'
import type { Topic } from '../../data/types'
import { getQuiz } from '../../data/quizzes'

export interface QuizTopicBreakdown {
  topicId: string
  topicTitle: string
  questionCount: number
  attemptsCount: number
  retriesCount: number
  bestScore?: {
    correct: number
    total: number
    percentage: number
  }
  status: 'not-started' | 'passed' | 'perfect' | 'failed'
  isWeak: boolean // Score < 70% or below passing threshold
}

export interface QuizBreakdownSummary {
  totalQuizzes: number
  attemptedQuizzes: number
  passedQuizzes: number
  perfectQuizzes: number
  weakCount: number
  items: QuizTopicBreakdown[]
}

/**
 * Derives comprehensive quiz breakdown across track topics (Catalog 12.3).
 * Identifies weak topics where best or attempt score is below 70%.
 */
export function calculateQuizBreakdown(
  state: CodeOrbitState,
  topics: readonly Topic[]
): QuizBreakdownSummary {
  const items: QuizTopicBreakdown[] = []
  let attemptedQuizzes = 0
  let passedQuizzes = 0
  let perfectQuizzes = 0
  let weakCount = 0

  for (const t of topics) {
    const quiz = getQuiz(t.id)
    if (!quiz) continue

    const record = state.topics?.[t.id]
    const attemptsCount = record?.quizAttempts ?? 0
    const retriesCount = Math.max(0, attemptsCount - 1)
    const best = record?.quizBest

    let status: QuizTopicBreakdown['status'] = 'not-started'
    let bestScore: QuizTopicBreakdown['bestScore'] = undefined
    let isWeak = false

    if (attemptsCount > 0) {
      attemptedQuizzes += 1
      if (best && best.total > 0) {
        const percentage = Math.round((best.correct / best.total) * 100)
        bestScore = {
          correct: best.correct,
          total: best.total,
          percentage,
        }

        if (best.correct === best.total) {
          status = 'perfect'
          perfectQuizzes += 1
          passedQuizzes += 1
        } else if (best.correct / best.total >= 2 / 3) {
          status = 'passed'
          passedQuizzes += 1
          if (percentage < 70) {
            isWeak = true
            weakCount += 1
          }
        } else {
          status = 'failed'
          isWeak = true
          weakCount += 1
        }
      } else {
        status = 'failed'
        isWeak = true
        weakCount += 1
      }
    }

    items.push({
      topicId: t.id,
      topicTitle: t.title,
      questionCount: quiz.questions.length,
      attemptsCount,
      retriesCount,
      bestScore,
      status,
      isWeak,
    })
  }

  return {
    totalQuizzes: items.length,
    attemptedQuizzes,
    passedQuizzes,
    perfectQuizzes,
    weakCount,
    items,
  }
}
