import type { Quiz, QuizQuestion, QuizAnswer } from '../data/types'

export interface QuizSession {
  answers: Array<QuizAnswer>
  /** A question is "checked" once the learner submitted an answer or skipped it. Checked answers are final. */
  checked: boolean[]
  skipped: boolean[]
  index: number
  finished: boolean
  timed?: boolean
  timeLeft?: number
}

export interface QuizScore {
  correct: number
  total: number
  unanswered: number
}

export const newSession = (questionCount: number, timed = false, timeLeft?: number): QuizSession => ({
  answers: Array(questionCount).fill(null),
  checked: Array(questionCount).fill(false),
  skipped: Array(questionCount).fill(false),
  index: 0,
  finished: false,
  timed,
  timeLeft,
})

const inRange = (s: QuizSession, i: number): boolean => Number.isInteger(i) && i >= 0 && i < s.answers.length

/** Set an answer for question q. Ignored once the question is checked or the quiz is finished. */
export function setAnswer(s: QuizSession, q: number, answer: QuizAnswer): QuizSession {
  if (!inRange(s, q) || s.finished || s.checked[q]) return s
  const answers = s.answers.slice()
  answers[q] = answer
  return { ...s, answers }
}

/** Choose an option for choice questions. Ignored once the question is checked or the quiz is finished. */
export function selectOption(s: QuizSession, q: number, option: number): QuizSession {
  return setAnswer(s, q, option)
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

/**
 * Evaluates correctness for a single question based on its kind.
 * Yields 1 for fully correct, 0 for incorrect or unanswered.
 */
export function scoreQuestion(q: QuizQuestion, answer: QuizAnswer): 0 | 1 {
  if (answer === null || answer === undefined) return 0

  switch (q.kind) {
    case 'output': {
      return typeof answer === 'string' && answer === q.answer ? 1 : 0
    }
    case 'sort': {
      if (!Array.isArray(answer) || answer.length !== q.order.length) return 0
      return answer.every((id, idx) => id === q.order[idx]) ? 1 : 0
    }
    case 'bug': {
      return Number.isInteger(answer) && answer === q.answer ? 1 : 0
    }
    case 'blank': {
      if (typeof answer !== 'string') return 0
      const trimmed = answer.trim()
      if (trimmed.length === 0) return 0
      if (q.caseInsensitive) {
        return q.answers.some((expected) => expected.trim().toLowerCase() === trimmed.toLowerCase()) ? 1 : 0
      }
      return q.answers.some((expected) => expected.trim() === trimmed) ? 1 : 0
    }
    case 'choice':
    default: {
      const correctIndex = (q as { correctIndex: number }).correctIndex
      return Number.isInteger(answer) && answer === correctIndex ? 1 : 0
    }
  }
}

export function scoreSession(s: QuizSession, quiz: Quiz): QuizScore {
  let correct = 0
  let unanswered = 0
  quiz.questions.forEach((question, i) => {
    const a = s.answers[i]
    if (a === null || a === undefined) {
      unanswered++
    } else if (scoreQuestion(question, a) === 1) {
      correct++
    }
  })
  return { correct, total: quiz.questions.length, unanswered }
}

/** Passing = at least two thirds correct. */
export const isPass = (score: Pick<QuizScore, 'correct' | 'total'>): boolean =>
  score.total > 0 && score.correct * 3 >= score.total * 2

export const isPerfect = (score: Pick<QuizScore, 'correct' | 'total'>): boolean =>
  score.total > 0 && score.correct === score.total

/** Validate a persisted session against the quiz shape; returns null when unusable. */
export function sanitizeSession(raw: unknown, quizOrCount: Quiz | number): QuizSession | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const questionCount = typeof quizOrCount === 'number' ? quizOrCount : quizOrCount.questions.length
  const arr = (v: unknown): unknown[] | null => (Array.isArray(v) && v.length === questionCount ? v : null)
  const answers = arr(r.answers),
    checked = arr(r.checked),
    skipped = arr(r.skipped)
  if (!answers || !checked || !skipped) return null

  if (typeof quizOrCount === 'number') {
    // Legacy choice-only question count validation (keeps full test compatibility)
    if (!answers.every((a) => a === null || (Number.isInteger(a) && (a as number) >= 0 && (a as number) < 10))) {
      return null
    }
  } else {
    // Typed question kind validation per item
    const valid = answers.every((a, i) => {
      if (a === null) return true
      const q = quizOrCount.questions[i]
      if (!q) return false
      switch (q.kind) {
        case 'output':
          return typeof a === 'string' && q.options.some((o) => o.id === a)
        case 'sort':
          return Array.isArray(a) && a.length === q.items.length && a.every((id) => q.items.some((it) => it.id === id))
        case 'bug':
          return Number.isInteger(a) && (a as number) >= 0 && (a as number) < q.lines.length
        case 'blank':
          return typeof a === 'string'
        case 'choice':
        default:
          return Number.isInteger(a) && (a as number) >= 0 && (a as number) < q.options.length
      }
    })
    if (!valid) return null
  }

  if (!checked.every((c) => typeof c === 'boolean') || !skipped.every((c) => typeof c === 'boolean')) return null
  const index =
    typeof r.index === 'number' && Number.isInteger(r.index) ? Math.min(Math.max(r.index, 0), questionCount - 1) : 0

  return {
    answers: answers as Array<QuizAnswer>,
    checked: checked as boolean[],
    skipped: skipped as boolean[],
    index,
    finished: r.finished === true,
    timed: r.timed === true,
    timeLeft: typeof r.timeLeft === 'number' ? r.timeLeft : undefined,
  }
}
