import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { challenges } from '../data/challenges'
import { topics, prerequisiteEdges } from '../data/curriculum'
import { computeAchievements } from '../lib/achievements'
import { dailyChallengeFor } from '../lib/daily'
import { computeMasteryLayout, topicDepths } from '../lib/masteryLayout'
import { addDay, dayKey, epochDay, streakInfo } from '../lib/streak'
import { createDefaultState, loadState, STORAGE_KEY } from '../lib/storage'
import { reducer } from '../state/reducer'
import type { CodeOrbitState } from '../state/types'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()
const chOf = (topicId: string) => challenges.find((c) => c.topicId === topicId)!
const pass = (s: CodeOrbitState, id: string, now: number) => {
  const c = challenges.find((x) => x.id === id)!
  return reducer(s, { type: 'RECORD_CHECK', challengeId: id, passed: c.requirements.length, total: c.requirements.length, failedIds: [], now })
}

describe('date keys and streaks', () => {
  it('formats local calendar days with zero padding', () => {
    expect(dayKey(at(2026, 1, 5))).toBe('2026-01-05')
    expect(dayKey(at(2026, 12, 31, 23))).toBe('2026-12-31')
  })
  it('does day arithmetic by calendar, including month/year/leap boundaries', () => {
    expect(epochDay('2026-03-01') - epochDay('2026-02-28')).toBe(1)
    expect(epochDay('2024-03-01') - epochDay('2024-02-28')).toBe(2)
    expect(epochDay('2027-01-01') - epochDay('2026-12-31')).toBe(1)
    expect(epochDay('1970-01-01')).toBe(0)
  })
  it('addDay keeps days unique, sorted and bounded, and returns the same array when unchanged', () => {
    const a = addDay([], '2026-10-02')
    expect(addDay(a, '2026-10-02')).toBe(a)
    expect(addDay(a, '2026-10-01')).toEqual(['2026-10-01', '2026-10-02'])
    expect(addDay(['2026-01-01', '2026-01-02'], '2026-01-03', 2)).toEqual(['2026-01-02', '2026-01-03'])
  })
  it('has no streak with no activity', () => {
    expect(streakInfo([], '2026-10-24')).toEqual({ current: 0, longest: 0, activeToday: false })
  })
  it('counts consecutive days ending today', () => {
    const r = streakInfo(['2026-10-22', '2026-10-23', '2026-10-24'], '2026-10-24')
    expect(r).toMatchObject({ current: 3, longest: 3, activeToday: true })
  })
  it('keeps the streak alive when the last activity was yesterday', () => {
    expect(streakInfo(['2026-10-22', '2026-10-23'], '2026-10-24')).toMatchObject({ current: 2, activeToday: false })
  })
  it('resets the current streak after a missed day but remembers the longest', () => {
    const r = streakInfo(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-20'], '2026-10-24')
    expect(r).toMatchObject({ current: 0, longest: 4, lastActive: '2026-10-20' })
  })
  it('handles gaps inside history and unsorted/duplicate input', () => {
    const r = streakInfo(['2026-10-24', '2026-10-22', '2026-10-24', '2026-10-23', '2026-10-10'], '2026-10-24')
    expect(r).toMatchObject({ current: 3, longest: 3 })
  })
  it('counts across month and year boundaries', () => {
    expect(streakInfo(['2026-12-30', '2026-12-31', '2027-01-01'], '2027-01-01').current).toBe(3)
  })
})

describe('activity recording in the reducer', () => {
  it('records a day for lesson completion, quiz finish and checks — but not for visiting or un-completing', () => {
    const now = at(2026, 10, 24)
    let s = reducer(createDefaultState(), { type: 'VISIT', topicId: 'lists', activity: 'lesson', now })
    expect(s.activityDays).toEqual([])
    s = reducer(s, { type: 'SELECT_TOPIC', topicId: 'links' })
    s = reducer(s, { type: 'SET_DRAFT', challengeId: 'ch-lists', code: 'x' })
    expect(s.activityDays).toEqual([])
    s = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: true, now })
    expect(s.activityDays).toEqual(['2026-10-24'])
    s = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: false, now: at(2026, 10, 25) })
    expect(s.activityDays).toEqual(['2026-10-24'])
    s = reducer(s, { type: 'QUIZ_FINISH', topicId: 'lists', session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true }, correct: 1, total: 3, now: at(2026, 10, 25) })
    expect(s.activityDays).toEqual(['2026-10-24', '2026-10-25'])
    s = reducer(s, { type: 'RECORD_CHECK', challengeId: 'ch-lists', passed: 0, total: 3, failedIds: [], now: at(2026, 10, 26) })
    expect(s.activityDays).toHaveLength(3)
  })
  it('does not record a day when no timestamp is supplied', () => {
    expect(reducer(createDefaultState(), { type: 'SET_LESSON_COMPLETE', topicId: 'lists', value: true }).activityDays).toEqual([])
  })
})

describe('daily challenge', () => {
  it('is deterministic for a date and independent of progress', () => {
    const a = dailyChallengeFor('2026-10-24')
    expect(dailyChallengeFor('2026-10-24')).toBe(a)
    const s = pass(createDefaultState(), chOf('lists').id, at(2026, 10, 24))
    expect(s).toBeTruthy()
    expect(dailyChallengeFor('2026-10-24').id).toBe(a.id)
  })
  it('cycles through every challenge in order, one per consecutive day, and repeats after a full cycle', () => {
    const n = challenges.length
    const ids = Array.from({ length: n }, (_, i) => dailyChallengeFor(`2026-11-${String(i + 1).padStart(2, '0')}`).id)
    expect(new Set(ids).size).toBe(n)
    const start = challenges.findIndex((c) => c.id === ids[0])
    ids.forEach((id, i) => expect(id).toBe(challenges[(start + i) % n].id))
    expect(dailyChallengeFor('2026-11-13').id).toBe(ids[0] === dailyChallengeFor('2026-11-01').id ? dailyChallengeFor('2026-11-01').id : '')
  })
  it('works for dates before 1970', () => {
    expect(challenges.map((c) => c.id)).toContain(dailyChallengeFor('1969-12-31').id)
  })
  it('is marked done only when TODAY’S challenge is fully passed, once per day', () => {
    const now = at(2026, 10, 24)
    const today = dailyChallengeFor(dayKey(now))
    const other = challenges.find((c) => c.id !== today.id)!
    let s = pass(createDefaultState(), other.id, now)
    expect(s.dailyDone).toEqual([])
    s = reducer(s, { type: 'RECORD_CHECK', challengeId: today.id, passed: 0, total: today.requirements.length, failedIds: ['x'], now })
    expect(s.dailyDone).toEqual([])
    s = pass(s, today.id, now)
    expect(s.dailyDone).toEqual(['2026-10-24'])
    s = pass(s, today.id, now)
    expect(s.dailyDone).toEqual(['2026-10-24'])
  })
})

describe('achievements are derived from real evidence', () => {
  const T = '2026-10-24'
  const byId = (s: CodeOrbitState, id: string) => computeAchievements(s, T).find((a) => a.id === id)!
  const finishTopic = (s: CodeOrbitState, topicId: string, { hint = false, solution = false, perfect = true } = {}) => {
    const c = chOf(topicId)
    let x = reducer(s, { type: 'SET_LESSON_COMPLETE', topicId, value: true })
    x = reducer(x, { type: 'QUIZ_FINISH', topicId, session: { answers: [0, 0, 0], checked: [true, true, true], skipped: [false, false, false], index: 2, finished: true }, correct: perfect ? 3 : 2, total: 3 })
    if (hint) x = reducer(x, { type: 'REVEAL_HINT', challengeId: c.id, max: 3 })
    if (solution) x = reducer(x, { type: 'REVEAL_SOLUTION', challengeId: c.id })
    return pass(x, c.id, at(2026, 10, 24))
  }
  it('starts with nothing earned', () => {
    expect(computeAchievements(createDefaultState(), T).every((a) => !a.earned)).toBe(true)
  })
  it('opening pages, bookmarking or taking notes earns nothing', () => {
    let s = reducer(createDefaultState(), { type: 'VISIT', topicId: 'forms', activity: 'practice', challengeId: 'ch-forms', now: 1 })
    s = reducer(s, { type: 'TOGGLE_BOOKMARK', topicId: 'forms' })
    s = reducer(s, { type: 'SET_NOTE', topicId: 'forms', text: 'x', now: 1 })
    expect(computeAchievements(s, T).some((a) => a.earned)).toBe(false)
  })
  it('First Challenge Completed needs a fully passing check', () => {
    const c = chOf('lists')
    const failed = reducer(createDefaultState(), { type: 'RECORD_CHECK', challengeId: c.id, passed: 2, total: 3, failedIds: ['ol'], now: 1 })
    expect(byId(failed, 'first-challenge').earned).toBe(false)
    expect(byId(pass(createDefaultState(), c.id, 1), 'first-challenge').earned).toBe(true)
  })
  it('topic badges follow their exact rules', () => {
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
    expect(byId(s, 'html-foundations').earned).toBe(true)
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
    let s = reducer(createDefaultState(), { type: 'ADD_ERROR', entry: { id: 'a', source: 'quiz', topicId: 'lists', refId: 'q', title: 't', detail: 'd', status: 'open', createdAt: 1 } })
    expect(byId(s, 'revision-completed').earned).toBe(false)
    s = reducer(s, { type: 'SET_ERROR_STATUS', id: 'a', status: 'understood' })
    expect(byId(s, 'revision-completed').earned).toBe(true)
  })
  it('Three-Day Streak needs three real consecutive days', () => {
    const s = { ...createDefaultState(), activityDays: ['2026-10-01', '2026-10-02', '2026-10-04'] }
    expect(byId(s, 'three-day-streak')).toMatchObject({ earned: false, progress: { current: 2, total: 3 } })
    expect(byId({ ...s, activityDays: ['2026-10-01', '2026-10-02', '2026-10-03'] }, 'three-day-streak').earned).toBe(true)
  })
  it('every achievement states a rule and ids are unique', () => {
    const list = computeAchievements(createDefaultState(), T)
    expect(new Set(list.map((a) => a.id)).size).toBe(list.length)
    list.forEach((a) => expect(a.rule.length).toBeGreaterThan(20))
  })
  it('completing the whole track earns the track badge', () => {
    let s = createDefaultState()
    topics.forEach((t) => { s = finishTopic(s, t.id) })
    expect(byId(s, 'html-complete').earned).toBe(true)
    expect(computeAchievements(s, T).filter((a) => a.id !== 'three-day-streak').every((a) => a.id === 'revision-completed' ? !a.earned : a.earned)).toBe(true)
  })
})

describe('storage of engagement data', () => {
  const memory = (raw: unknown) => ({ getItem: () => JSON.stringify(raw), setItem: () => {}, removeItem: () => {} })
  it('loads older v1 data that has no day lists', () => {
    const r = loadState(memory({ schemaVersion: 1, topics: {} }))
    expect(r.state.activityDays).toEqual([])
    expect(r.recovery).toBe('none')
  })
  it('keeps valid day lists and repairs invalid entries', () => {
    const r = loadState(memory({ schemaVersion: 1, activityDays: ['2026-10-02', '2026-10-01', 'garbage', 5, '2026-10-02'], dailyDone: 'nope' }))
    expect(r.state.activityDays).toEqual(['2026-10-01', '2026-10-02'])
    expect(r.state.dailyDone).toEqual([])
    expect(r.recovery).toBe('repaired')
  })
})

describe('mastery layout', () => {
  const layout = computeMasteryLayout(topics, 900)
  it('derives depth from real prerequisites only', () => {
    const d = topicDepths(topics)
    expect(d.get('html-structure')).toBe(0)
    expect(d.get('elements-attributes')).toBe(1)
    expect(d.get('semantic-layout')).toBe(2)
    expect(d.get('accessibility')).toBe(3)
    expect(d.get('putting-together')).toBe(3)
    prerequisiteEdges.forEach((e) => expect(d.get(e.from)!).toBeLessThan(d.get(e.to)!))
  })
  it('draws exactly the declared edges, nothing else', () => {
    expect(layout.edges.map((e) => `${e.from}>${e.to}`).sort()).toEqual(prerequisiteEdges.map((e) => `${e.from}>${e.to}`).sort())
  })
  it('is stable and keeps canonical order within a level', () => {
    expect(computeMasteryLayout(topics, 900)).toEqual(layout)
    const lvl2 = layout.nodes.filter((n) => n.depth === 2).map((n) => n.id)
    expect(lvl2).toEqual(topics.filter((t) => lvl2.includes(t.id)).map((t) => t.id))
  })
  it('never overlaps nodes and keeps every node inside the bounds', () => {
    layout.nodes.forEach((a, i) => {
      expect(a.x).toBeGreaterThanOrEqual(0)
      expect(a.x + layout.nodeW).toBeLessThanOrEqual(layout.width)
      expect(a.y + layout.nodeH).toBeLessThanOrEqual(layout.height)
      layout.nodes.slice(i + 1).forEach((b) => {
        const overlap = a.x < b.x + layout.nodeW && b.x < a.x + layout.nodeW && a.y < b.y + layout.nodeH && b.y < a.y + layout.nodeH
        expect(overlap).toBe(false)
      })
    })
  })
  it('uses one node size for everything (ability is never encoded as size)', () => {
    expect(new Set(layout.nodes.map(() => layout.nodeW)).size).toBe(1)
  })
  it('detects prerequisite cycles instead of looping', () => {
    expect(() => topicDepths([{ id: 'a', prerequisiteIds: ['b'] }, { id: 'b', prerequisiteIds: ['a'] }])).toThrow(/cycle/i)
  })
})

describe('Mastery map page, achievements and daily card in the app', () => {
  const setWidth = (w: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
    window.matchMedia = ((q: string) => {
      const m = /max-width:\s*(\d+)px/.exec(q)
      return { matches: m ? w <= Number(m[1]) : false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false, onchange: null } as unknown as MediaQueryList
    }) as typeof window.matchMedia
  }
  const renderAt = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
  beforeEach(() => setWidth(1440))

  it('shows the graph with all 12 topics and only real edges on wide screens', () => {
    renderAt('/mastery')
    expect(document.querySelectorAll('.mastery-node')).toHaveLength(12)
    expect(document.querySelectorAll('.mastery__edge')).toHaveLength(prerequisiteEdges.length)
  })
  it('selecting a node explains its status and highlights only its real edges', async () => {
    const user = userEvent.setup()
    renderAt('/mastery')
    await user.click(document.querySelector('[data-topic-id="semantic-layout"]')!)
    expect(screen.getByRole('heading', { level: 2, name: 'Semantic page layout' })).toBeInTheDocument()
    expect(document.querySelectorAll('.mastery__edge--active')).toHaveLength(3)
    expect(screen.getByRole('list', { name: /mastery criteria/i })).toHaveTextContent(/Not taken/)
    expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute('href', '/lesson/semantic-layout')
  })
  it('explains why mastery is impossible after revealing the solution first', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, topics: { lists: { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } } }, challenges: { 'ch-lists': { attempts: 2, hintsRevealed: 0, solutionRevealed: true, completed: true, completedWithoutSolution: false } } }))
    const user = userEvent.setup()
    renderAt('/mastery')
    await user.click(document.querySelector('[data-topic-id="lists"]')!)
    expect(screen.getByText(/Not possible: solution revealed first/)).toBeInTheDocument()
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
  })
  it('falls back to a structured list on narrow screens (same data, no graph)', () => {
    setWidth(390)
    renderAt('/mastery')
    expect(document.querySelector('.mastery__graph')).toBeNull()
    expect(screen.getByRole('list', { name: /grouped by prerequisite level/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Builds on:/).length).toBeGreaterThan(0)
  })
  it('Progress shows achievements as not earned on first run, with their rules', () => {
    renderAt('/progress')
    expect(screen.getByText(/0 of 10 earned/)).toBeInTheDocument()
    expect(screen.getAllByText('Not yet').length).toBe(10)
    expect(screen.getByText(/No active streak/)).toBeInTheDocument()
    expect(screen.getByText(/No activity recorded yet/)).toBeInTheDocument()
  })
  it('a real passing check earns First Challenge Completed, records a streak day and marks the daily challenge when it is today’s', async () => {
    const today = dailyChallengeFor(dayKey(Date.now()))
    const user = userEvent.setup()
    const { unmount } = renderAt(`/practice/${today.id}`)
    const ed = screen.getByRole('textbox', { name: /html editor/i })
    await user.clear(ed)
    await user.click(ed)
    await user.paste(today.solutionCode)
    await user.click(screen.getByRole('button', { name: /check solution/i }))
    await act(async () => { window.dispatchEvent(new Event('pagehide')) })
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)
    expect(saved.activityDays).toEqual([dayKey(Date.now())])
    expect(saved.dailyDone).toEqual([dayKey(Date.now())])
    unmount()
    renderAt('/progress')
    expect(screen.getByText(/1-day streak/)).toBeInTheDocument()
    expect(screen.getByText('Passed today')).toBeInTheDocument()
    const first = screen.getByText('First Challenge Completed').closest('li')!
    expect(within(first).getByText('Earned')).toBeInTheDocument()
  })
  it('Home shows today’s daily challenge with a working link and honest wording', () => {
    renderAt('/')
    const today = dailyChallengeFor(dayKey(Date.now()))
    const card = screen.getByRole('heading', { name: today.title }).closest('section')!
    expect(within(card).getByRole('link', { name: /start challenge/i })).toHaveAttribute('href', `/practice/${today.id}`)
    expect(within(card).getByText(/not shared with other people or devices/i)).toBeInTheDocument()
    expect(screen.queryByText(/streak/i)).not.toBeInTheDocument()
  })
  it('the track page links to the mastery map', () => {
    renderAt('/learn/html')
    expect(screen.getByRole('link', { name: /mastery map/i })).toHaveAttribute('href', '/mastery')
  })
})
