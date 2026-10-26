import { describe, it, expect, beforeEach } from 'vitest'
import { createDefaultState } from '../../lib/storage'
import { reducer } from '../../state/reducer'
import { evaluateAchievements, syncBadges, getAllAchievementDefs } from '../../core/gamification/achievements'
import { registerTrack, clearTracks } from '../../core/content/registry'
import { htmlTrack } from '../../tracks/html/track'
import { challenges } from '../../data/challenges'
import { topics } from '../../data/curriculum'
import type { CodeOrbitState } from '../../state/types'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()
const chOf = (topicId: string) => challenges.find((c) => c.topicId === topicId)!

const pass = (s: CodeOrbitState, id: string, now = 1000) => {
  const c = challenges.find((x) => x.id === id)!
  return reducer(s, {
    type: 'RECORD_CHECK',
    challengeId: id,
    passed: c.requirements.length,
    total: c.requirements.length,
    failedIds: [],
    now,
  })
}

const finishTopic = (
  s: CodeOrbitState,
  topicId: string,
  { hint = false, solution = false, perfect = true } = {}
) => {
  const c = chOf(topicId)
  let x = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId, value: true, now: at(2026, 10, 24) })
  x = reducer(x, {
    type: 'QUIZ_FINISH',
    topicId,
    session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
    correct: perfect ? 3 : 2,
    total: 3,
    now: at(2026, 10, 24),
  })
  if (hint) x = reducer(x, { type: 'REVEAL_HINT', challengeId: c.id, max: 3 })
  if (solution) x = reducer(x, { type: 'REVEAL_SOLUTION', challengeId: c.id })
  return pass(x, c.id, at(2026, 10, 24))
}

describe('Achievements derived from real evidence (Catalog 8.2, REF-05)', () => {
  const T = '2026-10-24'

  beforeEach(() => {
    clearTracks()
    registerTrack(htmlTrack)
  })

  const byId = (s: CodeOrbitState, id: string) => {
    const list = evaluateAchievements(s, { todayKey: T })
    const found = list.find((a) => a.id === id)
    if (!found) throw new Error(`Achievement '${id}' not found in evaluated list`)
    return found
  }

  it('starts with nothing earned in default state', () => {
    const list = evaluateAchievements(createDefaultState(), { todayKey: T })
    expect(list.length).toBeGreaterThanOrEqual(12) // 7 platform + 5 html track
    expect(list.every((a) => !a.earned)).toBe(true)
  })

  it('opening pages, bookmarking or taking notes earns nothing (anti-farming)', () => {
    let s = reducer(createDefaultState(), { type: 'VISIT', topicId: 'forms', activity: 'practice', challengeId: 'ch-forms', now: 1 })
    s = reducer(s, { type: 'TOGGLE_BOOKMARK', topicId: 'forms' })
    s = reducer(s, { type: 'SET_NOTE', topicId: 'forms', text: 'Important note on forms', now: 1 })
    expect(evaluateAchievements(s, { todayKey: T }).some((a) => a.earned)).toBe(false)
  })

  it('First Challenge Completed needs a fully passing check', () => {
    const c = chOf('lists')
    const failed = reducer(createDefaultState(), {
      type: 'RECORD_CHECK',
      challengeId: c.id,
      passed: 2,
      total: 3,
      failedIds: ['ol'],
      now: 1,
    })
    expect(byId(failed, 'first-challenge').earned).toBe(false)

    const passed = pass(createDefaultState(), c.id, 1)
    expect(byId(passed, 'first-challenge').earned).toBe(true)
  })

  it('HTML topic badges follow their exact rules', () => {
    expect(byId(pass(createDefaultState(), chOf('forms').id, 1), 'form-builder').earned).toBe(true)
    expect(byId(pass(createDefaultState(), chOf('images').id, 1), 'accessible-images').earned).toBe(true)
    expect(byId(pass(createDefaultState(), chOf('semantic-layout').id, 1), 'semantic-structure').earned).toBe(true)
    expect(byId(pass(createDefaultState(), chOf('lists').id, 1), 'form-builder').earned).toBe(false)
  })

  it('HTML Foundations needs all three foundation topics fully complete, and reports progress', () => {
    let s = finishTopic(createDefaultState(), 'html-structure')
    s = finishTopic(s, 'elements-attributes')
    expect(byId(s, 'html-foundations')).toMatchObject({ earned: false, progress: { current: 2, total: 3 } })

    s = finishTopic(s, 'headings-paragraphs')
    expect(byId(s, 'html-foundations')).toMatchObject({ earned: true, progress: { current: 3, total: 3 } })
  })

  it('Independent Solver excludes hints and solution reveals', () => {
    expect(byId(finishTopic(createDefaultState(), 'lists', { hint: true }), 'independent-solver').earned).toBe(false)
    expect(byId(finishTopic(createDefaultState(), 'lists', { solution: true }), 'independent-solver').earned).toBe(false)
    expect(byId(finishTopic(createDefaultState(), 'lists'), 'independent-solver').earned).toBe(true)
  })

  it('First Mastery requires a perfect quiz', () => {
    expect(byId(finishTopic(createDefaultState(), 'lists', { perfect: false }), 'first-mastery').earned).toBe(false)
    expect(byId(finishTopic(createDefaultState(), 'lists'), 'first-mastery').earned).toBe(true)
  })

  it('Revision Completed needs an entry marked understood', () => {
    let s = reducer(createDefaultState(), {
      type: 'ADD_ERROR',
      entry: {
        id: 'err-1',
        source: 'quiz',
        topicId: 'lists',
        refId: 'q-1',
        title: 'Quiz question missed',
        detail: 'detail',
        status: 'open',
        createdAt: 1,
      },
    })
    expect(byId(s, 'revision-completed').earned).toBe(false)
    s = reducer(s, { type: 'SET_ERROR_STATUS', id: 'err-1', status: 'understood' })
    expect(byId(s, 'revision-completed').earned).toBe(true)
  })

  it('Three-Day Streak and Seven-Day Streak need consecutive calendar days', () => {
    const sGapped = { ...createDefaultState(), activityDays: ['2026-10-01', '2026-10-02', '2026-10-04'] }
    expect(byId(sGapped, 'three-day-streak')).toMatchObject({ earned: false, progress: { current: 2, total: 3 } })

    const s3 = { ...createDefaultState(), activityDays: ['2026-10-01', '2026-10-02', '2026-10-03'] }
    expect(byId(s3, 'three-day-streak')).toMatchObject({ earned: true, progress: { current: 3, total: 3 } })
    expect(byId(s3, 'seven-day-streak')).toMatchObject({ earned: false, progress: { current: 3, total: 7 } })

    const s7 = {
      ...createDefaultState(),
      activityDays: ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'],
    }
    expect(byId(s7, 'seven-day-streak')).toMatchObject({ earned: true, progress: { current: 7, total: 7 } })
  })

  it('Quiz Ace requires a perfect score on any quiz', () => {
    let s = reducer(createDefaultState(), {
      type: 'QUIZ_FINISH',
      topicId: 'lists',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 2,
      total: 3,
      now: at(2026, 10, 24),
    })
    expect(byId(s, 'quiz-ace').earned).toBe(false)

    s = reducer(s, {
      type: 'QUIZ_FINISH',
      topicId: 'links',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 3,
      total: 3,
      now: at(2026, 10, 24),
    })
    expect(byId(s, 'quiz-ace').earned).toBe(true)
  })

  it('every achievement states a clear rule (> 20 chars) and ids are unique', () => {
    const allDefs = getAllAchievementDefs([htmlTrack])
    expect(new Set(allDefs.map((a) => a.id)).size).toBe(allDefs.length)
    allDefs.forEach((a) => {
      expect(a.rule.length).toBeGreaterThan(20)
      expect(a.title.length).toBeGreaterThan(3)
    })
  })

  it('completing the whole track earns HTML Track Complete', () => {
    let s = createDefaultState()
    topics.forEach((t) => {
      s = finishTopic(s, t.id)
    })
    expect(byId(s, 'html-complete')).toMatchObject({ earned: true, progress: { current: 12, total: 12 } })
  })

  it('preserves honest dates: live sync records real timestamp; silent backfill leaves firstSeenAt null', () => {
    const s = pass(createDefaultState(), chOf('lists').id, 1000)

    // Silent backfill (e.g. on migration or initial inspection when no live event occurred)
    const backfilled = syncBadges(s)
    expect(backfilled.badges['first-challenge']).toEqual({
      firstSeenAt: null,
      backfilled: true,
    })

    // Live sync (timestamp provided)
    const liveTime = at(2026, 10, 26, 14)
    const liveSync = syncBadges(s, liveTime)
    expect(liveSync.badges['first-challenge']).toEqual({
      firstSeenAt: liveTime,
      backfilled: false,
    })
  })
})
