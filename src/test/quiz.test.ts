import { getQuiz } from '../data/quizzes'
import { allChecked, checkAnswer, finish, goTo, isPass, isPerfect, newSession, sanitizeSession, scoreSession, selectOption, skipQuestion } from '../lib/quiz'

const quiz = getQuiz('lists')!
const n = quiz.questions.length
const correctOf = (i: number) => quiz.questions[i].correctIndex
const wrongOf = (i: number) => (correctOf(i) + 1) % 4

describe('quiz engine', () => {
  it('starts empty', () => {
    const s = newSession(n)
    expect(s.answers).toEqual([null, null, null])
    expect(s.finished).toBe(false)
    expect(scoreSession(s, quiz)).toEqual({ correct: 0, total: 3, unanswered: 3 })
  })

  it('cannot check without a selection', () => {
    const s = newSession(n)
    expect(checkAnswer(s, 0)).toBe(s)
  })

  it('locks an answer once checked', () => {
    let s = selectOption(newSession(n), 0, wrongOf(0))
    s = checkAnswer(s, 0)
    const after = selectOption(s, 0, correctOf(0))
    expect(after.answers[0]).toBe(wrongOf(0))
  })

  it('scores a perfect run and passes', () => {
    let s = newSession(n)
    for (let i = 0; i < n; i++) s = checkAnswer(selectOption(s, i, correctOf(i)), i)
    s = finish(s)
    const sc = scoreSession(s, quiz)
    expect(sc).toEqual({ correct: 3, total: 3, unanswered: 0 })
    expect(isPass(sc) && isPerfect(sc)).toBe(true)
    expect(s.finished).toBe(true)
  })

  it('passes at 2 of 3 and fails at 1 of 3', () => {
    expect(isPass({ correct: 2, total: 3 })).toBe(true)
    expect(isPass({ correct: 1, total: 3 })).toBe(false)
    expect(isPass({ correct: 0, total: 0 })).toBe(false)
    expect(isPerfect({ correct: 2, total: 3 })).toBe(false)
  })

  it('counts skipped questions as unanswered and allows finishing', () => {
    let s = newSession(n)
    s = skipQuestion(s, 0)
    s = checkAnswer(selectOption(s, 1, correctOf(1)), 1)
    s = checkAnswer(selectOption(s, 2, wrongOf(2)), 2)
    expect(allChecked(s)).toBe(true)
    expect(scoreSession(finish(s), quiz)).toEqual({ correct: 1, total: 3, unanswered: 1 })
  })

  it('refuses to finish while questions remain unchecked', () => {
    const s = checkAnswer(selectOption(newSession(n), 0, 0), 0)
    expect(finish(s).finished).toBe(false)
  })

  it('navigates within bounds only', () => {
    const s = newSession(n)
    expect(goTo(s, 2).index).toBe(2)
    expect(goTo(s, 9)).toBe(s)
    expect(goTo(s, -1)).toBe(s)
  })

  it('ignores out-of-range selections and changes after finishing', () => {
    const s = newSession(n)
    expect(selectOption(s, 7, 0)).toBe(s)
    let f = newSession(n)
    for (let i = 0; i < n; i++) f = checkAnswer(selectOption(f, i, 0), i)
    f = finish(f)
    expect(selectOption(f, 0, 1)).toBe(f)
  })

  it('retry produces a clean session independent of the old one', () => {
    const old = checkAnswer(selectOption(newSession(n), 0, 1), 0)
    const fresh = newSession(n)
    expect(fresh).not.toEqual(old)
    expect(fresh.answers.every((a) => a === null)).toBe(true)
  })

  it('every quiz explanation is present so feedback never goes blank', () => {
    expect(quiz.questions.every((q) => q.explanation.length > 0)).toBe(true)
  })

  describe('sanitizeSession', () => {
    it('accepts a valid session and clamps index', () => {
      const s = { ...newSession(n), index: 99 }
      expect(sanitizeSession(s, n)?.index).toBe(n - 1)
    })
    it('rejects wrong lengths, wrong types and non-objects', () => {
      expect(sanitizeSession(null, n)).toBeNull()
      expect(sanitizeSession('x', n)).toBeNull()
      expect(sanitizeSession({ ...newSession(2) }, n)).toBeNull()
      expect(sanitizeSession({ ...newSession(n), answers: ['a', null, null] }, n)).toBeNull()
      expect(sanitizeSession({ ...newSession(n), checked: [1, 0, 0] }, n)).toBeNull()
    })
  })
})
