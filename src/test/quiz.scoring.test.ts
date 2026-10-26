import { describe, expect, it } from 'vitest'
import {
  scoreQuestion,
  scoreSession,
  sanitizeSession,
  newSession,
  setAnswer,
  isPass,
  isPerfect,
} from '../lib/quiz'
import type {
  Quiz,
  ChoiceQuizQuestion,
  OutputPredictorQuizQuestion,
  SorterQuizQuestion,
  SpotBugQuizQuestion,
  BlankQuizQuestion,
} from '../data/types'

describe('quiz scoring engine (Stage 09)', () => {
  const choiceQ: ChoiceQuizQuestion = {
    id: 'c1',
    prompt: 'Choice Q',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 2,
    explanation: 'Choice explanation',
  }

  const outputQ: OutputPredictorQuizQuestion = {
    kind: 'output',
    id: 'o1',
    prompt: 'Output Q',
    code: '<p>Hi</p>',
    options: [
      { id: 'opt-a', svg: '<svg></svg>' },
      { id: 'opt-b', svg: '<svg></svg>' },
    ],
    answer: 'opt-b',
    explanation: 'Output explanation',
  }

  const sortQ: SorterQuizQuestion = {
    kind: 'sort',
    id: 's1',
    prompt: 'Sort Q',
    items: [
      { id: 'step-1', text: 'First' },
      { id: 'step-2', text: 'Second' },
      { id: 'step-3', text: 'Third' },
    ],
    order: ['step-1', 'step-2', 'step-3'],
    explanation: 'Sort explanation',
  }

  const bugQ: SpotBugQuizQuestion = {
    kind: 'bug',
    id: 'b1',
    prompt: 'Bug Q',
    lines: ['<p>', '<span>Missing close', '</div>'],
    answer: 1,
    explanation: 'Bug explanation',
  }

  const blankQCaseSensitive: BlankQuizQuestion = {
    kind: 'blank',
    id: 'bl1',
    prompt: 'Fill ___ marker',
    answers: ['article', '<article>'],
    explanation: 'Blank explanation',
  }

  const blankQCaseInsensitive: BlankQuizQuestion = {
    kind: 'blank',
    id: 'bl2',
    prompt: 'Fill ___ insensitive',
    answers: ['DOCTYPE', '<!DOCTYPE html>'],
    caseInsensitive: true,
    explanation: 'Blank explanation',
  }

  describe('scoreQuestion per kind', () => {
    it('scores multiple-choice questions correctly', () => {
      expect(scoreQuestion(choiceQ, 2)).toBe(1)
      expect(scoreQuestion(choiceQ, 0)).toBe(0)
      expect(scoreQuestion(choiceQ, null)).toBe(0)
      expect(scoreQuestion(choiceQ, 'invalid' as unknown as number)).toBe(0)
    })

    it('scores visual output predictor questions correctly', () => {
      expect(scoreQuestion(outputQ, 'opt-b')).toBe(1)
      expect(scoreQuestion(outputQ, 'opt-a')).toBe(0)
      expect(scoreQuestion(outputQ, null)).toBe(0)
      expect(scoreQuestion(outputQ, 1 as unknown as string)).toBe(0)
    })

    it('scores drag-and-drop sorter questions correctly', () => {
      expect(scoreQuestion(sortQ, ['step-1', 'step-2', 'step-3'])).toBe(1)
      expect(scoreQuestion(sortQ, ['step-2', 'step-1', 'step-3'])).toBe(0)
      expect(scoreQuestion(sortQ, ['step-1', 'step-2'])).toBe(0)
      expect(scoreQuestion(sortQ, null)).toBe(0)
      expect(scoreQuestion(sortQ, 'step-1' as unknown as string[])).toBe(0)
    })

    it('scores spot-the-bug questions correctly', () => {
      expect(scoreQuestion(bugQ, 1)).toBe(1)
      expect(scoreQuestion(bugQ, 0)).toBe(0)
      expect(scoreQuestion(bugQ, 2)).toBe(0)
      expect(scoreQuestion(bugQ, null)).toBe(0)
      expect(scoreQuestion(bugQ, '1' as unknown as number)).toBe(0)
    })

    it('scores fill-in-the-blank with whitespace trimming and case sensitivity', () => {
      // Case sensitive
      expect(scoreQuestion(blankQCaseSensitive, 'article')).toBe(1)
      expect(scoreQuestion(blankQCaseSensitive, '  article  ')).toBe(1)
      expect(scoreQuestion(blankQCaseSensitive, '<article>')).toBe(1)
      expect(scoreQuestion(blankQCaseSensitive, 'Article')).toBe(0) // case sensitive mismatch
      expect(scoreQuestion(blankQCaseSensitive, 'section')).toBe(0)
      expect(scoreQuestion(blankQCaseSensitive, '')).toBe(0)
      expect(scoreQuestion(blankQCaseSensitive, null)).toBe(0)

      // Case insensitive
      expect(scoreQuestion(blankQCaseInsensitive, 'doctype')).toBe(1)
      expect(scoreQuestion(blankQCaseInsensitive, 'DOCTYPE')).toBe(1)
      expect(scoreQuestion(blankQCaseInsensitive, '  DocType  ')).toBe(1)
      expect(scoreQuestion(blankQCaseInsensitive, '<!doctype html>')).toBe(1)
      expect(scoreQuestion(blankQCaseInsensitive, 'wrong')).toBe(0)
    })
  })

  describe('scoreSession across mixed question kinds', () => {
    const mixedQuiz: Quiz = {
      topicId: 'mixed',
      questions: [choiceQ, outputQ, sortQ, bugQ, blankQCaseSensitive],
    }

    it('computes correct, total, and unanswered truthfully', () => {
      let s = newSession(5)
      expect(scoreSession(s, mixedQuiz)).toEqual({ correct: 0, total: 5, unanswered: 5 })

      s = setAnswer(s, 0, 2) // correct
      s = setAnswer(s, 1, 'opt-a') // wrong
      s = setAnswer(s, 2, ['step-1', 'step-2', 'step-3']) // correct
      s = setAnswer(s, 3, 1) // correct
      // Q4 unanswered

      expect(scoreSession(s, mixedQuiz)).toEqual({ correct: 3, total: 5, unanswered: 1 })
      // 3/5 is 0.6 < 0.666 -> not passed
      expect(isPass(scoreSession(s, mixedQuiz))).toBe(false)

      s = setAnswer(s, 4, 'article') // 4 correct
      expect(scoreSession(s, mixedQuiz)).toEqual({ correct: 4, total: 5, unanswered: 0 })
      expect(isPass(scoreSession(s, mixedQuiz))).toBe(true)
      expect(isPerfect(scoreSession(s, mixedQuiz))).toBe(false)

      s = setAnswer(s, 1, 'opt-b') // all 5 correct
      expect(scoreSession(s, mixedQuiz)).toEqual({ correct: 5, total: 5, unanswered: 0 })
      expect(isPerfect(scoreSession(s, mixedQuiz))).toBe(true)
    })
  })

  describe('sanitizeSession robustness & backwards compatibility', () => {
    it('migrates legacy stored session without errors', () => {
      const legacyRaw = {
        index: 1,
        answers: [2, 0, null],
        checked: [true, true, false],
        skipped: [false, false, false],
        finished: false,
      }
      const sanitized = sanitizeSession(legacyRaw, 3)
      expect(sanitized).toBeDefined()
      expect(sanitized?.index).toBe(1)
      expect(sanitized?.answers).toEqual([2, 0, null])
      expect(sanitized?.checked).toEqual([true, true, false])
      expect(sanitized?.timed).toBe(false)
    })

    it('rejects session when questionCount mismatches raw arrays', () => {
      const raw = {
        index: 0,
        answers: [1, 2],
        checked: [true, true],
        skipped: [false, false],
        finished: false,
      }
      // expected 3 questions, got 2
      expect(sanitizeSession(raw, 3)).toBeNull()
    })

    it('rejects corrupt non-object or malformed input', () => {
      expect(sanitizeSession(null, 3)).toBeNull()
      expect(sanitizeSession(undefined, 3)).toBeNull()
      expect(sanitizeSession('not-a-session', 3)).toBeNull()
      expect(sanitizeSession(12345, 3)).toBeNull()
      expect(sanitizeSession({}, 3)).toBeNull()
    })

    it('clamps out of bounds index', () => {
      const raw = {
        index: 99,
        answers: [null, null, null],
        checked: [false, false, false],
        skipped: [false, false, false],
        finished: false,
      }
      const sanitized = sanitizeSession(raw, 3)
      expect(sanitized?.index).toBe(2)
    })
  })
})
