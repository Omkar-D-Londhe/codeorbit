import type { Quiz } from '../data/types'

export interface QuizSession {
  answers: Array<number | null>
  /** A question is "checked" once the learner submitted an answer or skipped it. Checked answers are final. */
  checked: boolean[]
  skipped: boolean[]
  index: number
  finished: boolean
}

export interface QuizScore {
  correct: number
  total: number
  unanswered: number
}

export const newSession = (questionCount: number): QuizSession => ({
  answers: Array(questionCount).fill(null),
  checked: Array(questionCount).fill(false),
  skipped: Array(questionCount).fill(false),
  index: 0,
  finished: false,
})

const inRange = (s: QuizSession, i: number): boolean => Number.isInteger(i) && i >= 0 && i < s.answers.length

/** Choose an option. Ignored once the question is checked or the quiz is finished. */
export function selectOption(s: QuizSession, q: number, option: number): QuizSession {
  if (!inRange(s, q) || s.finished || s.checked[q]) return s
  const answers = s.answers.slice()
  answers[q] = option
  return { ...s, answers }
}

/** Lock in the selected answer. Does nothing when nothing is selected. */
export function checkAnswer(s: QuizSession, q: number): QuizSession {
  if (!inRange(s, q) || s.finished || s.checked[q] || s.answers[q] === null) return s
  const checked = s.checked.slice()
  checked[q] = true
  return { ...s, checked }
}

/** Deliberately skip: the question stays unanswered and is final. */
export function skipQuestion(s: QuizSession, q: number): QuizSession {
  if (!inRange(s, q) || s.finished || s.checked[q]) return s
  const checked = s.checked.slice()
  const skipped = s.skipped.slice()
  const answers = s.answers.slice()
  checked[q] = true
  skipped[q] = true
  answers[q] = null
  return { ...s, checked, skipped, answers }
}

export function goTo(s: QuizSession, i: number): QuizSession {
  return inRange(s, i) ? { ...s, index: i } : s
}

export const allChecked = (s: QuizSession): boolean => s.checked.every(Boolean)

/** Finish only when every question has been checked or skipped. */
export function finish(s: QuizSession): QuizSession {
  return allChecked(s) ? { ...s, finished: true } : s
}

export function scoreSession(s: QuizSession, quiz: Quiz): QuizScore {
  let correct = 0
  let unanswered = 0
  quiz.questions.forEach((question, i) => {
    const a = s.answers[i]
    if (a === null || a === undefined) unanswered++
    else if (a === question.correctIndex) correct++
  })
  return { correct, total: quiz.questions.length, unanswered }
}

/** Passing = at least two thirds correct. */
export const isPass = (score: Pick<QuizScore, 'correct' | 'total'>): boolean =>
  score.total > 0 && score.correct * 3 >= score.total * 2

export const isPerfect = (score: Pick<QuizScore, 'correct' | 'total'>): boolean =>
  score.total > 0 && score.correct === score.total

/** Validate a persisted session against the quiz shape; returns null when unusable. */
export function sanitizeSession(raw: unknown, questionCount: number): QuizSession | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const arr = (v: unknown): unknown[] | null => (Array.isArray(v) && v.length === questionCount ? v : null)
  const answers = arr(r.answers), checked = arr(r.checked), skipped = arr(r.skipped)
  if (!answers || !checked || !skipped) return null
  if (!answers.every((a) => a === null || (Number.isInteger(a) && (a as number) >= 0 && (a as number) < 10))) return null
  if (!checked.every((c) => typeof c === 'boolean') || !skipped.every((c) => typeof c === 'boolean')) return null
  const index = typeof r.index === 'number' && Number.isInteger(r.index) ? Math.min(Math.max(r.index, 0), questionCount - 1) : 0
  return {
    answers: answers as Array<number | null>,
    checked: checked as boolean[],
    skipped: skipped as boolean[],
    index,
    finished: r.finished === true,
  }
}
