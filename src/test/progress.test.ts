import { challenges } from '../data/challenges'
import { getTopic, topics } from '../data/curriculum'
import { nextAction, openErrorCount, topicProgress, trackProgress } from '../lib/progress'
import { createDefaultState } from '../lib/storage'
import { reducer } from '../state/reducer'
import type { CodeOrbitState } from '../state/types'

const T = (id: string) => getTopic(id)!
const chOf = (topicId: string) => challenges.find((c) => c.topicId === topicId)!
const fullPass = (s: CodeOrbitState, topicId: string, { solutionFirst = false, perfect = true } = {}): CodeOrbitState => {
  const c = chOf(topicId)
  let x = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId, value: true })
  x = reducer(x, { type: 'QUIZ_FINISH', topicId, session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true }, correct: perfect ? 3 : 2, total: 3 })
  if (solutionFirst) x = reducer(x, { type: 'REVEAL_SOLUTION', challengeId: c.id })
  return reducer(x, { type: 'RECORD_CHECK', challengeId: c.id, passed: c.requirements.length, total: c.requirements.length, failedIds: [], now: 1 })
}

describe('progress rules', () => {
  it('starts with no progress and no invented activity', () => {
    const s = createDefaultState()
    topics.forEach((t) => {
      const p = topicProgress(s, t)
      expect(p.status).toBe('not-started')
      expect(p.parts).toBe(0)
      expect(p.touched).toBe(false)
    })
    expect(trackProgress(s, 'html')).toMatchObject({ completedTopics: 0, parts: 0, inProgressTopics: 0 })
  })

  it('merely visiting or selecting a topic is not progress', () => {
    let s = reducer(createDefaultState(), { type: 'VISIT', topicId: 'lists', activity: 'lesson', now: 5 })
    s = reducer(s, { type: 'SELECT_TOPIC', topicId: 'links' })
    expect(topicProgress(s, T('lists')).status).toBe('not-started')
  })

  it('becomes in-progress after real activity (lesson complete, edited draft, quiz answer, check)', () => {
    expect(topicProgress(reducer(createDefaultState(), { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: true }), T('lists')).status).toBe('in-progress')
    const c = chOf('lists')
    expect(topicProgress(reducer(createDefaultState(), { type: 'SET_DRAFT', challengeId: c.id, code: 'x' }), T('lists')).status).toBe('in-progress')
    // a draft equal to the starter is not activity
    expect(topicProgress(reducer(createDefaultState(), { type: 'SET_DRAFT', challengeId: c.id, code: c.starterCode }), T('lists')).status).toBe('not-started')
    expect(topicProgress(reducer(createDefaultState(), { type: 'RECORD_CHECK', challengeId: c.id, passed: 0, total: 3, failedIds: ['ul'], now: 1 }), T('lists')).status).toBe('in-progress')
  })

  it('counts steps honestly: lesson, quiz pass, practice', () => {
    let s = reducer(createDefaultState(), { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: true })
    expect(topicProgress(s, T('lists')).parts).toBe(1)
    s = reducer(s, { type: 'QUIZ_FINISH', topicId: 'lists', session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true }, correct: 1, total: 3 })
    expect(topicProgress(s, T('lists')).quizPassed).toBe(false)
    s = reducer(s, { type: 'QUIZ_FINISH', topicId: 'lists', session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true }, correct: 2, total: 3 })
    expect(topicProgress(s, T('lists')).parts).toBe(2)
    expect(s.topics.lists.quizAttempts).toBe(2)
  })

  it('keeps the BEST quiz score, never a worse later one', () => {
    const sess = { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true }
    let s = reducer(createDefaultState(), { type: 'QUIZ_FINISH', topicId: 'lists', session: sess, correct: 3, total: 3 })
    s = reducer(s, { type: 'QUIZ_FINISH', topicId: 'lists', session: sess, correct: 1, total: 3 })
    expect(s.topics.lists.quizBest).toEqual({ correct: 3, total: 3 })
  })

  it('completed requires all three steps; mastered additionally requires a perfect quiz and no early solution reveal', () => {
    const done = fullPass(createDefaultState(), 'lists')
    expect(topicProgress(done, T('lists')).status).toBe('mastered')
    expect(topicProgress(fullPass(createDefaultState(), 'lists', { perfect: false }), T('lists')).status).toBe('completed')
    const cheated = fullPass(createDefaultState(), 'lists', { solutionFirst: true })
    expect(topicProgress(cheated, T('lists')).status).toBe('completed')
    expect(topicProgress(cheated, T('lists')).usedSolution).toBe(true)
  })

  it('revealing the solution AFTER completing does not remove mastery', () => {
    const s = reducer(fullPass(createDefaultState(), 'lists'), { type: 'REVEAL_SOLUTION', challengeId: chOf('lists').id })
    expect(topicProgress(s, T('lists')).status).toBe('mastered')
  })

  it('a failed check never completes a challenge, and completion is sticky', () => {
    const c = chOf('lists')
    let s = reducer(createDefaultState(), { type: 'RECORD_CHECK', challengeId: c.id, passed: 2, total: 3, failedIds: ['ol'], now: 1 })
    expect(s.challenges[c.id].completed).toBe(false)
    s = reducer(s, { type: 'RECORD_CHECK', challengeId: c.id, passed: 3, total: 3, failedIds: [], now: 2 })
    expect(s.challenges[c.id].completed).toBe(true)
    s = reducer(s, { type: 'RECORD_CHECK', challengeId: c.id, passed: 0, total: 3, failedIds: ['a'], now: 3 })
    expect(s.challenges[c.id].completed).toBe(true)
    expect(s.challenges[c.id].attempts).toBe(3)
  })

  describe('recommendation', () => {
    it('first run: start at the first topic', () => {
      const a = nextAction(createDefaultState())
      expect(a).toMatchObject({ kind: 'start', topicId: 'html-structure' })
    })
    it('resumes the last visited unfinished topic', () => {
      const s = reducer(createDefaultState(), { type: 'VISIT', topicId: 'links', activity: 'quiz', now: 1 })
      expect(nextAction(s)).toMatchObject({ kind: 'resume', topicId: 'links' })
    })
    it('recommends only topics whose prerequisites are done', () => {
      const s = fullPass(createDefaultState(), 'html-structure')
      const a = nextAction(s)
      expect(a.kind).toBe('next')
      expect(T(a.topicId!).prerequisiteIds.every((p) => topicProgress(s, T(p)).status !== 'not-started')).toBe(true)
      expect(a.topicId).toBe('elements-attributes')
    })
    it('reports all-complete only when every topic is complete', () => {
      let s = createDefaultState()
      topics.forEach((t) => { s = fullPass(s, t.id) })
      expect(nextAction(s).kind).toBe('all-complete')
      expect(trackProgress(s, 'html')).toMatchObject({ completedTopics: topics.length, masteredTopics: topics.length })
    })
  })

  it('counts only open error notebook items', () => {
    let s = createDefaultState()
    s = reducer(s, { type: 'ADD_ERROR', entry: { id: 'a', source: 'quiz', topicId: 'lists', refId: 'q1', title: 't', detail: 'd', status: 'open', createdAt: 1 } })
    s = reducer(s, { type: 'ADD_ERROR', entry: { id: 'b', source: 'quiz', topicId: 'lists', refId: 'q2', title: 't', detail: 'd', status: 'open', createdAt: 2 } })
    expect(openErrorCount(s)).toBe(2)
    s = reducer(s, { type: 'SET_ERROR_STATUS', id: 'a', status: 'understood' })
    expect(openErrorCount(s)).toBe(1)
    s = reducer(s, { type: 'DELETE_ERROR', id: 'b' })
    expect(openErrorCount(s)).toBe(0)
  })
})

describe('reducer details', () => {
  it('hints reveal one at a time and stop at the maximum', () => {
    const id = chOf('lists').id
    let s = createDefaultState()
    for (let i = 0; i < 6; i++) s = reducer(s, { type: 'REVEAL_HINT', challengeId: id, max: 3 })
    expect(s.challenges[id].hintsRevealed).toBe(3)
  })
  it('reveal solution is idempotent and independent of the draft', () => {
    const id = chOf('lists').id
    let s = reducer(createDefaultState(), { type: 'SET_DRAFT', challengeId: id, code: 'mine' })
    s = reducer(s, { type: 'REVEAL_SOLUTION', challengeId: id })
    expect(reducer(s, { type: 'REVEAL_SOLUTION', challengeId: id })).toBe(s)
    expect(s.drafts[id]).toBe('mine')
  })
  it('reset clears only the draft', () => {
    const id = chOf('lists').id
    let s = reducer(createDefaultState(), { type: 'SET_DRAFT', challengeId: id, code: 'mine' })
    s = reducer(s, { type: 'REVEAL_HINT', challengeId: id, max: 3 })
    s = reducer(s, { type: 'CLEAR_DRAFT', challengeId: id })
    expect(s.drafts[id]).toBeUndefined()
    expect(s.challenges[id].hintsRevealed).toBe(1)
  })
  it('notes: empty text removes the note; bookmarks toggle', () => {
    let s = reducer(createDefaultState(), { type: 'SET_NOTE', topicId: 'lists', text: 'hi', now: 1 })
    expect(s.notes.lists.text).toBe('hi')
    s = reducer(s, { type: 'SET_NOTE', topicId: 'lists', text: '   ', now: 2 })
    expect(s.notes.lists).toBeUndefined()
    s = reducer(s, { type: 'TOGGLE_BOOKMARK', topicId: 'lists' })
    expect(s.bookmarks).toEqual(['lists'])
    s = reducer(s, { type: 'TOGGLE_BOOKMARK', topicId: 'lists' })
    expect(s.bookmarks).toEqual([])
  })
  it('saving the same failure twice updates one open entry instead of duplicating', () => {
    const e = { id: 'a', source: 'challenge' as const, topicId: 'lists', refId: 'ch-lists', title: 't', detail: 'd1', status: 'open' as const, createdAt: 1 }
    let s = reducer(createDefaultState(), { type: 'ADD_ERROR', entry: e })
    s = reducer(s, { type: 'ADD_ERROR', entry: { ...e, id: 'b', detail: 'd2', createdAt: 9 } })
    expect(s.errorNotebook).toHaveLength(1)
    expect(s.errorNotebook[0]).toMatchObject({ id: 'a', detail: 'd2', createdAt: 1 })
  })
  it('RESET_ALL returns pristine defaults', () => {
    const s = reducer(fullPass(createDefaultState(), 'lists'), { type: 'RESET_ALL' })
    expect(s).toEqual(createDefaultState())
  })
})
