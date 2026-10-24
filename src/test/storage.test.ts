import { BACKUP_KEY, SCHEMA_VERSION, STORAGE_KEY, clearState, createDefaultState, loadState, migrate, saveState } from '../lib/storage'
import { newSession } from '../lib/quiz'

function memoryStorage(initial: Record<string, string> = {}) {
  const m = new Map(Object.entries(initial))
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => { m.set(k, v) },
    removeItem: (k: string) => { m.delete(k) },
    _m: m,
  }
}

describe('versioned storage', () => {
  it('returns defaults with no recovery on first run', () => {
    const r = loadState(memoryStorage())
    expect(r.recovery).toBe('none')
    expect(r.state).toEqual(createDefaultState())
    expect(r.state.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('round-trips a populated state exactly', () => {
    const s = createDefaultState()
    s.lastVisited = { topicId: 'lists', activity: 'practice', challengeId: 'ch-lists', at: 1700000000000 }
    s.selectedTopicId = 'lists'
    s.topics.lists = { lessonComplete: true, quizAttempts: 2, quizBest: { correct: 2, total: 3 } }
    s.drafts['ch-lists'] = '<ul><li>x</li></ul>'
    s.challenges['ch-lists'] = { attempts: 3, hintsRevealed: 2, solutionRevealed: false, completed: true, completedWithoutSolution: true, lastCheck: { passed: 3, total: 3, failedIds: [], at: 5 } }
    s.notes.lists = { text: 'remember li', updatedAt: 9 }
    s.bookmarks = ['lists']
    s.quizSessions.lists = { ...newSession(3), index: 1 }
    s.errorNotebook = [{ id: 'e1', source: 'quiz', topicId: 'lists', refId: 'lists-1', title: 't', detail: 'd', status: 'open', createdAt: 1 }]
    const st = memoryStorage()
    expect(saveState(s, st)).toEqual({ ok: true })
    const r = loadState(st)
    expect(r.recovery).toBe('none')
    expect(r.state).toEqual(s)
  })

  it('recovers from invalid JSON, keeps a backup, and starts fresh', () => {
    const st = memoryStorage({ [STORAGE_KEY]: '{not json' })
    const r = loadState(st)
    expect(r.recovery).toBe('corrupt')
    expect(r.state).toEqual(createDefaultState())
    expect(st.getItem(BACKUP_KEY)).toBe('{not json')
  })

  it.each(['[]', '"str"', '42', 'null'])('treats non-object JSON %s as corrupt', (raw) => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: raw })).recovery).toBe('corrupt')
  })

  it('refuses data from a newer schema version without destroying it', () => {
    const raw = JSON.stringify({ schemaVersion: SCHEMA_VERSION + 5, topics: {} })
    const st = memoryStorage({ [STORAGE_KEY]: raw })
    const r = loadState(st)
    expect(r.recovery).toBe('newer-version')
    expect(st.getItem(BACKUP_KEY)).toBe(raw)
    expect(st.getItem(STORAGE_KEY)).toBe(raw)
  })

  it('migrates a version-0 payload that used "progress"', () => {
    const v0 = { progress: { lists: { lessonComplete: true, quizAttempts: 0 } } }
    const r = loadState(memoryStorage({ [STORAGE_KEY]: JSON.stringify(v0) }))
    expect(r.state.topics.lists?.lessonComplete).toBe(true)
    expect(r.state.schemaVersion).toBe(1)
    expect(migrate({ schemaVersion: 1, topics: {} })).toMatchObject({ schemaVersion: 1 })
  })

  it('repairs partially malformed data and keeps the valid parts', () => {
    const bad = {
      schemaVersion: 1,
      topics: { lists: { lessonComplete: true, quizAttempts: 1 }, 'not-a-topic': { lessonComplete: true }, links: 'oops' },
      drafts: { 'ch-lists': 'ok', 'ch-nope': 'x', 'ch-links': 5 },
      bookmarks: ['lists', 'lists', 'ghost', 3],
      notes: { lists: { text: 'n', updatedAt: 1 }, links: { text: 5 } },
      errorNotebook: [{ id: 1 }, { id: 'a', source: 'quiz', topicId: 'lists', refId: 'r', title: 't', detail: 'd', createdAt: 1 }],
      challenges: { 'ch-lists': { attempts: -3, hintsRevealed: 99, completed: 'yes' } },
      quizSessions: { lists: { answers: [1] } },
      lastVisited: { topicId: 'ghost', activity: 'lesson', at: 1 },
      selectedTopicId: 'ghost',
    }
    const r = loadState(memoryStorage({ [STORAGE_KEY]: JSON.stringify(bad) }))
    expect(r.recovery).toBe('repaired')
    expect(Object.keys(r.state.topics)).toEqual(['lists'])
    expect(r.state.drafts).toEqual({ 'ch-lists': 'ok' })
    expect(r.state.bookmarks).toEqual(['lists'])
    expect(Object.keys(r.state.notes)).toEqual(['lists'])
    expect(r.state.errorNotebook).toHaveLength(1)
    expect(r.state.errorNotebook[0].status).toBe('open')
    expect(r.state.challenges['ch-lists']).toMatchObject({ attempts: 0, hintsRevealed: 3, completed: false })
    expect(r.state.quizSessions).toEqual({})
    expect(r.state.lastVisited).toBeUndefined()
    expect(r.state.selectedTopicId).toBeUndefined()
  })

  it('never lets completedWithoutSolution be true unless completed', () => {
    const raw = { schemaVersion: 1, challenges: { 'ch-lists': { completed: false, completedWithoutSolution: true } } }
    const r = loadState(memoryStorage({ [STORAGE_KEY]: JSON.stringify(raw) }))
    expect(r.state.challenges['ch-lists'].completedWithoutSolution).toBe(false)
  })

  it('reports unavailable storage when reading throws', () => {
    const r = loadState({ getItem: () => { throw new Error('denied') }, setItem: () => {}, removeItem: () => {} })
    expect(r.recovery).toBe('unavailable')
    expect(r.state).toEqual(createDefaultState())
  })

  it('reports unavailable storage when there is no storage object', () => {
    expect(loadState(null).recovery).toBe('unavailable')
    expect(saveState(createDefaultState(), null)).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('reports a failed save (quota) instead of pretending it worked', () => {
    const st = { getItem: () => null, setItem: () => { throw new DOMException('full', 'QuotaExceededError') }, removeItem: () => {} }
    expect(saveState(createDefaultState(), st)).toEqual({ ok: false, reason: 'failed' })
  })

  it('clears both state and backup', () => {
    const st = memoryStorage({ [STORAGE_KEY]: '{}', [BACKUP_KEY]: 'x' })
    expect(clearState(st)).toEqual({ ok: true })
    expect(st._m.size).toBe(0)
  })
})
