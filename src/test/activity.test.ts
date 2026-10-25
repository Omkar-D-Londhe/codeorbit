import { describe, it, expect } from 'vitest'
import { reducer } from '../state/reducer'
import { createDefaultState } from '../lib/storage'
import { isMeaningfulActivity } from '../core/activity/meaningful'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()

describe('Meaningful activity recording (L-19, REF-03)', () => {
  it('correctly classifies meaningful activity types', () => {
    expect(isMeaningfulActivity('lesson-complete')).toBe(true)
    expect(isMeaningfulActivity('quiz-finish')).toBe(true)
    expect(isMeaningfulActivity('challenge-check')).toBe(true)
    expect(isMeaningfulActivity('visit')).toBe(false)
    expect(isMeaningfulActivity('note')).toBe(false)
    expect(isMeaningfulActivity('bookmark')).toBe(false)
  })

  it('records a day and activity event for lesson completion, quiz finish and checks — but not for visiting or un-completing', () => {
    const now = at(2026, 10, 24)
    let s = reducer(createDefaultState(), { type: 'VISIT', topicId: 'lists', activity: 'lesson', now })
    expect(s.activityDays).toEqual([])
    expect(s.activity).toEqual([])

    s = reducer(s, { type: 'SELECT_TOPIC', topicId: 'links' })
    s = reducer(s, { type: 'SET_DRAFT', challengeId: 'ch-lists', code: 'x' })
    s = reducer(s, { type: 'SET_NOTE', topicId: 'lists', text: 'Some notes', now })
    s = reducer(s, { type: 'TOGGLE_BOOKMARK', topicId: 'lists' })
    s = reducer(s, { type: 'SET_SETTINGS', patch: { userName: 'Learner' } })
    expect(s.activityDays).toEqual([])
    expect(s.activity).toEqual([])

    // 1. Mark lesson complete
    s = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: true, now })
    expect(s.activityDays).toEqual(['2026-10-24'])
    expect(s.activity).toHaveLength(1)
    expect(s.activity[0].type).toBe('lesson-complete')
    expect(s.activity[0].at).toBe(now)

    // 2. Un-mark lesson complete (does NOT record day or activity)
    s = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: false, now: at(2026, 10, 25) })
    expect(s.activityDays).toEqual(['2026-10-24'])
    expect(s.activity).toHaveLength(1)

    // 3. Quiz finish
    s = reducer(s, {
      type: 'QUIZ_FINISH',
      topicId: 'lists',
      session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true },
      correct: 1,
      total: 3,
      now: at(2026, 10, 25)
    })
    expect(s.activityDays).toEqual(['2026-10-24', '2026-10-25'])
    expect(s.activity).toHaveLength(2)
    expect(s.activity[1].type).toBe('quiz-finish')

    // 4. Challenge check (whether pass or fail)
    s = reducer(s, { type: 'RECORD_CHECK', challengeId: 'ch-lists', passed: 0, total: 3, failedIds: [], now: at(2026, 10, 26) })
    expect(s.activityDays).toEqual(['2026-10-24', '2026-10-25', '2026-10-26'])
    expect(s.activity).toHaveLength(3)
    expect(s.activity[2].type).toBe('challenge-check')
    expect(s.streakBest).toBe(3)
  })

  it('does not record a day when no timestamp is supplied', () => {
    const s = reducer(createDefaultState(), { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: true })
    expect(s.activityDays).toEqual([])
    expect(s.activity).toEqual([])
  })

  it('caps activity events at 5000 and drops oldest entries', () => {
    let s = createDefaultState()
    const now = at(2026, 10, 24)
    // Pre-populate 5000 items
    s.activity = Array.from({ length: 5000 }, (_, i) => ({
      id: `evt-${i}`,
      type: 'lesson-complete',
      at: now + i
    }))

    s = reducer(s, { type: 'RECORD_CHECK', challengeId: 'ch-lists', passed: 3, total: 3, failedIds: [], now: now + 5001 })
    expect(s.activity).toHaveLength(5000)
    expect(s.activity[0].id).toBe('evt-1') // oldest dropped
    expect(s.activity[4999].type).toBe('challenge-check')
  })
})
