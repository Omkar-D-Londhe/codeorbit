import { describe, it, expect, beforeEach } from 'vitest'
import { createDefaultState } from '../../lib/storage'
import { reducer } from '../../state/reducer'
import { computeXp, levelFor, xpForLevel, XP_TABLE } from '../../core/gamification/xp'
import { registerTrack, clearTracks } from '../../core/content/registry'
import { htmlTrack } from '../../tracks/html/track'
import { challenges } from '../../data/challenges'
import type { CodeOrbitState } from '../../state/types'

const chOf = (topicId: string) => challenges.find((c) => c.topicId === topicId)!

const pass = (s: CodeOrbitState, id: string) => {
  const c = challenges.find((x) => x.id === id)!
  return reducer(s, {
    type: 'RECORD_CHECK',
    challengeId: id,
    passed: c.requirements.length,
    total: c.requirements.length,
    failedIds: [],
    now: 1000,
  })
}

describe('Pure XP and Level Derivation (Catalog 8.1, L-20)', () => {
  beforeEach(() => {
    clearTracks()
    registerTrack(htmlTrack)
  })

  it('starts at 0 XP, Level 0 with 100 XP needed for next level', () => {
    const s = createDefaultState()
    const xp = computeXp(s)
    expect(xp.total).toBe(0)
    expect(xp.level).toBe(0)
    expect(xp.currentLevelXp).toBe(0)
    expect(xp.nextLevelXp).toBe(100)
    expect(xp.progressXp).toBe(0)
    expect(xp.neededXp).toBe(100)
  })

  it('level curve xpForLevel(n) is monotonic and matches 100 * n * (n + 1) / 2', () => {
    expect(xpForLevel(0)).toBe(0)
    expect(xpForLevel(1)).toBe(100)
    expect(xpForLevel(2)).toBe(300)
    expect(xpForLevel(3)).toBe(600)
    expect(xpForLevel(4)).toBe(1000)
    expect(xpForLevel(5)).toBe(1500)

    for (let n = 1; n < 20; n++) {
      expect(xpForLevel(n)).toBeGreaterThan(xpForLevel(n - 1))
    }
  })

  it('levelFor(xp) correctly maps thresholds', () => {
    expect(levelFor(0)).toBe(0)
    expect(levelFor(50)).toBe(0)
    expect(levelFor(99)).toBe(0)
    expect(levelFor(100)).toBe(1)
    expect(levelFor(250)).toBe(1)
    expect(levelFor(299)).toBe(1)
    expect(levelFor(300)).toBe(2)
    expect(levelFor(599)).toBe(2)
    expect(levelFor(600)).toBe(3)
    expect(levelFor(1000)).toBe(4)
  })

  it('awards XP strictly per documented XP_TABLE items', () => {
    let s = createDefaultState()

    // 1. Lesson complete: +10
    s = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: true })
    let xp = computeXp(s)
    expect(xp.total).toBe(XP_TABLE.lessonComplete) // 10
    expect(xp.byCategory.lessons).toBe(10)

    // 2. Quiz pass (non-perfect): +15
    s = reducer(s, {
      type: 'QUIZ_FINISH',
      topicId: 'lists',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 2,
      total: 3,
    })
    xp = computeXp(s)
    expect(xp.byCategory.quizzes).toBe(XP_TABLE.quizPass) // 15
    expect(xp.total).toBe(10 + 15) // 25

    // 3. Quiz upgrade to perfect: +10 bonus (total quiz = 25)
    s = reducer(s, {
      type: 'QUIZ_FINISH',
      topicId: 'lists',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 3,
      total: 3,
    })
    xp = computeXp(s)
    expect(xp.byCategory.quizzes).toBe(XP_TABLE.quizPass + XP_TABLE.quizPerfect) // 25
    expect(xp.total).toBe(10 + 25) // 35

    // 4. Practice independent pass: +25 (pass) + 15 (independent bonus) + 50 (mastery! all 3 parts complete & perfect)
    const c = chOf('lists')
    s = pass(s, c.id)
    xp = computeXp(s)
    expect(xp.byCategory.challenges).toBe(XP_TABLE.challengePass + XP_TABLE.independentSolve) // 40
    expect(xp.byCategory.mastery).toBe(XP_TABLE.topicMastered) // 50
    // Total: 10 (lesson) + 25 (quiz) + 40 (challenge) + 50 (mastery) = 125 XP -> Level 1!
    expect(xp.total).toBe(125)
    expect(xp.level).toBe(1)
    expect(xp.progressXp).toBe(25)
    expect(xp.neededXp).toBe(175) // 300 - 125 = 175

    // 5. Error understood: +5
    s = reducer(s, {
      type: 'ADD_ERROR',
      entry: { id: 'err-1', source: 'quiz', topicId: 'lists', refId: 'q', title: 't', detail: 'd', status: 'open', createdAt: 1 },
    })
    expect(computeXp(s).total).toBe(125) // open error gives 0
    s = reducer(s, { type: 'SET_ERROR_STATUS', id: 'err-1', status: 'understood' })
    expect(computeXp(s).byCategory.errors).toBe(XP_TABLE.errorUnderstood) // 5
    expect(computeXp(s).total).toBe(130)

    // 6. Daily challenge: +20
    s = {
      ...s,
      dailyDone: ['2026-10-24'],
    }
    expect(computeXp(s).byCategory.daily).toBe(XP_TABLE.dailyChallenge) // 20
    expect(computeXp(s).total).toBe(150)
  })

  it('anti-farming: repeating passed challenges or quizzes yields zero additional XP', () => {
    const c = chOf('forms')
    let s = pass(createDefaultState(), c.id)
    const initialXp = computeXp(s).total
    expect(initialXp).toBe(40) // 25 pass + 15 independent

    // Repeat check on same challenge
    s = pass(s, c.id)
    expect(computeXp(s).total).toBe(initialXp)

    // Replay quiz with same or lower score
    s = reducer(s, {
      type: 'QUIZ_FINISH',
      topicId: 'forms',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 2,
      total: 3,
    })
    const afterQuizXp = computeXp(s).total
    s = reducer(s, {
      type: 'QUIZ_FINISH',
      topicId: 'forms',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 2,
      total: 3,
    })
    expect(computeXp(s).total).toBe(afterQuizXp)

    // Opening pages, drafts, bookmarks
    s = reducer(s, { type: 'VISIT', topicId: 'forms', activity: 'lesson' })
    s = reducer(s, { type: 'SET_DRAFT', challengeId: c.id, code: 'some code' })
    s = reducer(s, { type: 'TOGGLE_BOOKMARK', topicId: 'forms' })
    expect(computeXp(s).total).toBe(afterQuizXp)
  })

  it('un-completing a lesson consistently reduces XP', () => {
    let s = reducer(createDefaultState(), { type: 'SET_LESSON_COMPLETE', topicId: 'html-structure', value: true })
    expect(computeXp(s).total).toBe(10)

    s = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId: 'html-structure', value: false })
    expect(computeXp(s).total).toBe(0)
  })
})
