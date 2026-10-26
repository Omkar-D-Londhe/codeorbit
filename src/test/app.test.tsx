import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { challenges } from '../data/challenges'
import { topics } from '../data/curriculum'
import { getQuiz } from '../data/quizzes'
import type { ChoiceQuizQuestion } from '../data/types'
import { STORAGE_KEY } from '../lib/storage'

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  window.matchMedia = ((q: string) => {
    const m = /max-width:\s*(\d+)px/.exec(q)
    const matches = m ? w <= Number(m[1]) : false
    return { matches, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false, onchange: null } as unknown as MediaQueryList
  }) as typeof window.matchMedia
}
const renderAt = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
const saved = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
const flushSave = async () => { await act(async () => { window.dispatchEvent(new Event('pagehide')) }) }

beforeEach(() => setWidth(1440))

describe('first run', () => {
  it('shows an honest first-run Home with no invented progress', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /learn html by exploring it/i })).toBeInTheDocument()
    expect(screen.getByText(/0 of 12 topics complete/i)).toBeInTheDocument()
    expect(screen.queryByText(/last activity/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /resume/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start html/i })).toHaveAttribute('href', '/learn/html')
  })

  it('marks future technologies as previews with no actions', () => {
    renderAt('/explore')
    for (const name of ['CSS', 'JavaScript', 'Bootstrap', 'Angular']) {
      const card = screen.getByRole('listitem', { name: new RegExp(`${name}: preview`, 'i') })
      expect(within(card).queryByRole('link')).toBeNull()
      expect(within(card).queryByRole('button')).toBeNull()
      expect(within(card).getByText('Preview')).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /open track/i })).toHaveAttribute('href', '/learn/html')
  })

  it('unknown routes show a helpful not-found page', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: /doesn.t exist/i })).toBeInTheDocument()
    renderAt('/lesson/ghost')
  })
})

describe('Learning Orbit', () => {
  it('renders every topic in canonical order in BOTH the strip and the arch (legacy fallback)', () => {
    renderAt('/learn/html?orbit=legacy')
    const strip = within(screen.getByRole('list', { name: /topics in curriculum order/i })).getAllByRole('button')
    const arch = within(screen.getByRole('list', { name: /on the learning orbit/i })).getAllByRole('button')
    expect(strip).toHaveLength(12)
    expect(arch).toHaveLength(12)
    expect(strip.map((b) => b.getAttribute('data-topic-id'))).toEqual(topics.map((t) => t.id))
    expect(arch.map((b) => b.getAttribute('data-topic-id'))).toEqual(topics.map((t) => t.id))
  })

  it('selects the first topic by default and updates the details', () => {
    renderAt('/learn/html?orbit=legacy')
    expect(screen.getByRole('heading', { level: 2, name: 'Document structure' })).toBeInTheDocument()
    const sel = document.querySelectorAll('[aria-current="true"]')
    expect(sel).toHaveLength(2) // one in strip, one in arch
  })

  it('syncs strip → arch and arch → strip, including first and last', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html?orbit=legacy')
    const stripBtn = (id: string) => document.querySelector<HTMLElement>(`[data-nav="strip"][data-topic-id="${id}"]`)!
    const archBtn = (id: string) => document.querySelector<HTMLElement>(`[data-nav="arc"][data-topic-id="${id}"]`)!

    await user.click(stripBtn('putting-together'))
    expect(archBtn('putting-together')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('heading', { level: 2, name: 'Putting it together' })).toBeInTheDocument()

    await user.click(archBtn('links'))
    expect(stripBtn('links')).toHaveAttribute('aria-current', 'true')
    expect(archBtn('putting-together')).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('heading', { level: 2, name: 'Links and navigation' })).toBeInTheDocument()

    await user.click(archBtn('html-structure'))
    expect(stripBtn('html-structure')).toHaveAttribute('aria-current', 'true')
  })

  it('keeps node positions identical regardless of selection (stable layout)', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html?orbit=legacy')
    const pos = () => Array.from(document.querySelectorAll<HTMLElement>('.arch__node-wrap')).map((e) => `${e.style.left},${e.style.top}`)
    const before = pos()
    await user.click(document.querySelector('[data-nav="strip"][data-topic-id="tables"]')!)
    await user.click(document.querySelector('[data-nav="arc"][data-topic-id="forms"]')!)
    expect(pos()).toEqual(before)
  })

  it('supports keyboard navigation in logical order and keeps focus on the navigator', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html?orbit=legacy')
    const first = document.querySelector<HTMLElement>('[data-nav="arc"][data-topic-id="html-structure"]')!
    first.focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toHaveAttribute('data-topic-id', 'elements-attributes')
    expect(document.activeElement).toHaveAttribute('data-nav', 'arc')
    await user.keyboard('{End}')
    expect(document.activeElement).toHaveAttribute('data-topic-id', 'putting-together')
    await user.keyboard('{ArrowRight}') // clamps at the end; no looping
    expect(document.activeElement).toHaveAttribute('data-topic-id', 'putting-together')
    await user.keyboard('{Home}')
    expect(document.activeElement).toHaveAttribute('data-topic-id', 'html-structure')
    await user.keyboard('{ArrowLeft}') // clamps at the start
    expect(document.activeElement).toHaveAttribute('data-topic-id', 'html-structure')
  })

  it('uses roving tabindex: exactly one tab stop per navigator', () => {
    renderAt('/learn/html?orbit=legacy')
    expect(document.querySelectorAll('[data-nav="arc"][tabindex="0"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-nav="strip"][tabindex="0"]')).toHaveLength(1)
  })

  it('gives each node an accessible name with position and status (not colour alone)', () => {
    renderAt('/learn/html?orbit=legacy')
    expect(screen.getAllByRole('button', { name: /Topic 1 of 12: Document structure\. Not started\. Selected\./ }).length).toBe(2)
  })

  it('draws connectors only for declared prerequisites and highlights the selected topic’s', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html?orbit=legacy')
    const total = document.querySelectorAll('.arch__edge').length
    expect(total).toBe(topics.reduce((n, t) => n + t.prerequisiteIds.length, 0))
    await user.click(document.querySelector('[data-nav="arc"][data-topic-id="semantic-layout"]')!)
    // semantic-layout: 1 prerequisite + 2 dependents (accessibility, putting-together)
    expect(document.querySelectorAll('.arch__edge--active')).toHaveLength(3)
  })

  it('shows real prerequisites and dependents, and lets you jump to them', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html?orbit=legacy')
    await user.click(document.querySelector('[data-nav="strip"][data-topic-id="accessibility"]')!)
    const rel = document.querySelector('.detail__rel') as HTMLElement
    expect(within(rel).getByRole('button', { name: 'Semantic page layout' })).toBeInTheDocument()
    expect(within(rel).getByRole('button', { name: 'Images and alt text' })).toBeInTheDocument()
    await user.click(within(rel).getByRole('button', { name: 'Images and alt text' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Images and alt text' })).toBeInTheDocument()
  })

  it('links Learn / Quick quiz / Practice for the selected topic', () => {
    renderAt('/learn/html?orbit=legacy')
    expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute('href', '/lesson/html-structure')
    expect(screen.getByRole('link', { name: 'Quick quiz' })).toHaveAttribute('href', '/quiz/html-structure')
    expect(screen.getByRole('link', { name: 'Practice' })).toHaveAttribute('href', '/practice/ch-html-structure')
  })

  it('falls back to the carousel of cards on phone widths, preserving order and selection', async () => {
    setWidth(390)
    const user = userEvent.setup()
    renderAt('/learn/html?orbit=legacy')
    expect(document.querySelector('.arch')).toBeNull()
    expect(document.querySelector('.strip--cards')).not.toBeNull()
    const ids = Array.from(document.querySelectorAll('[data-nav="strip"]')).map((e) => e.getAttribute('data-topic-id'))
    expect(ids).toEqual(topics.map((t) => t.id))
    await user.click(document.querySelector('[data-nav="strip"][data-topic-id="tables"]')!)
    expect(screen.getByRole('heading', { level: 2, name: 'Tables' })).toBeInTheDocument()
  })

  it('scroll-nudge buttons exist and fades never take pointer input', () => {
    renderAt('/learn/html?orbit=legacy')
    expect(screen.getByRole('button', { name: /scroll topics left/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /scroll topics right/i })).toBeInTheDocument()
    document.querySelectorAll('.strip__fade').forEach((f) => expect(f).toHaveAttribute('aria-hidden', 'true'))
  })

  it('restores the selected topic after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/learn/html?orbit=legacy')
    await user.click(document.querySelector('[data-nav="strip"][data-topic-id="forms"]')!)
    await flushSave()
    unmount()
    renderAt('/learn/html?orbit=legacy')
    expect(screen.getByRole('heading', { level: 2, name: 'Forms and inputs' })).toBeInTheDocument()
  })
})

describe('lesson → quiz → practice flow', () => {
  it('lesson shows content, examples and study panel with working links', () => {
    renderAt('/lesson/lists')
    expect(screen.getByRole('heading', { level: 1, name: 'Lists' })).toBeInTheDocument()
    expect(screen.getByText(/Unordered and ordered/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start quiz/i })).toHaveAttribute('href', '/quiz/lists')
    expect(screen.getByRole('link', { name: /practise this topic/i })).toHaveAttribute('href', '/practice/ch-lists')
    expect(screen.getByRole('link', { name: /next: links/i })).toHaveAttribute('href', '/lesson/links')
    expect(screen.getByRole('link', { name: /previous: text/i })).toHaveAttribute('href', '/lesson/text-semantics')
  })

  it('saves a note, bookmark and lesson completion that survive a reload, and only says "Saved" after a real write', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/lesson/lists')
    await user.type(screen.getByLabelText(/your notes for/i), 'li goes inside ul')
    expect(screen.queryByText(/Saved in this browser/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /bookmark this topic/i }))
    await user.click(screen.getByRole('button', { name: /mark lesson complete/i }))
    await flushSave()
    expect(await screen.findByText(/Saved in this browser/)).toBeInTheDocument()
    const s = saved()
    expect(s.notes.lists.text).toBe('li goes inside ul')
    expect(s.bookmarks).toEqual(['lists'])
    expect(s.topics.lists.lessonComplete).toBe(true)
    unmount()
    renderAt('/lesson/lists')
    expect(screen.getByLabelText(/your notes for/i)).toHaveValue('li goes inside ul')
    expect(screen.getByRole('button', { name: /bookmarked/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /lesson marked complete/i })).toBeInTheDocument()
  })

  it('uses tabs on narrow screens without losing either panel', async () => {
    setWidth(600)
    const user = userEvent.setup()
    renderAt('/lesson/lists')
    expect(screen.getByRole('tab', { name: 'Lesson' })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('tab', { name: /quiz, practice/i }))
    expect(screen.getByRole('link', { name: /start quiz/i })).toBeVisible()
  })

  it('runs a full quiz: select, check, explanation, skip, results, retry', async () => {
    const user = userEvent.setup()
    renderAt('/quiz/lists')
    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    const quiz = getQuiz('lists')!
    // Q1: check is disabled until an answer is selected
    expect(screen.getByRole('button', { name: /check answer/i })).toBeDisabled()
    const q0 = quiz.questions[0] as ChoiceQuizQuestion
    await user.click(screen.getByRole('radio', { name: q0.options[q0.correctIndex] }))
    await user.click(screen.getByRole('button', { name: /check answer/i }))
    const fb = () => document.querySelector('.feedback') as HTMLElement
    expect(fb()).toHaveTextContent(/Correct/)
    expect(fb()).toHaveTextContent(quiz.questions[0].explanation)
    expect(document.activeElement).toHaveTextContent(/next question/i)
    await user.click(screen.getByRole('button', { name: /next question/i }))
    // Q2: wrong answer
    const q1 = quiz.questions[1] as ChoiceQuizQuestion
    const wrong = (q1.correctIndex + 1) % 4
    await user.click(screen.getByRole('radio', { name: q1.options[wrong] }))
    await user.click(screen.getByRole('button', { name: /check answer/i }))
    expect(fb()).toHaveTextContent(/Not quite/)
    expect(screen.getByText(/correct answer/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next question/i }))
    // Q3: skip
    await user.click(screen.getByRole('button', { name: /skip question/i }))
    await user.click(screen.getByRole('button', { name: /see results/i }))
    expect(screen.getByRole('heading', { name: /1 of 3 correct/i })).toBeInTheDocument()
    expect(screen.getByText(/not passed yet/i)).toBeInTheDocument()
    expect(screen.getByText('Unanswered')).toBeInTheDocument()
    await flushSave()
    expect(saved().topics.lists.quizBest).toEqual({ correct: 1, total: 3 })
    await user.click(screen.getByRole('button', { name: /retry quiz/i }))
    expect(screen.getByText(/question 1 of 3/i)).toBeInTheDocument()
  })

  it('resumes an in-progress quiz after reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/quiz/links')
    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    const q = getQuiz('links')!.questions[0] as ChoiceQuizQuestion
    await user.click(screen.getByRole('radio', { name: q.options[q.correctIndex] }))
    await user.click(screen.getByRole('button', { name: /check answer/i }))
    await flushSave()
    unmount()
    renderAt('/quiz/links')
    expect(document.querySelector('.feedback')).toHaveTextContent(/Correct/)
    expect(screen.getAllByRole('radio')[q.correctIndex]).toBeChecked()
  })

  it('saves a missed quiz question to the Error Notebook and shows it on Review', async () => {
    const user = userEvent.setup()
    renderAt('/quiz/lists')
    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    const quiz = getQuiz('lists')!
    for (let i = 0; i < 3; i++) {
      const q = quiz.questions[i] as ChoiceQuizQuestion
      await user.click(screen.getByRole('radio', { name: q.options[(q.correctIndex + 1) % 4] }))
      await user.click(screen.getByRole('button', { name: /check answer/i }))
      await user.click(screen.getByRole('button', { name: i === 2 ? /see results/i : /next question/i }))
    }
    await user.click(screen.getAllByRole('button', { name: /save to error notebook/i })[0])
    await flushSave()
    expect(saved().errorNotebook).toHaveLength(1)
  })
})

describe('practice lab', () => {
  const ch = challenges.find((c) => c.id === 'ch-lists')!

  it('shows requirements as "Not checked" until a real check, never pre-passed', () => {
    renderAt('/practice/ch-lists')
    expect(screen.getAllByText('Not checked')).toHaveLength(ch.requirements.length)
    expect(screen.getByText(/to see your page here/i)).toBeInTheDocument()
  })

  it('previews only inside a fully sandboxed iframe after Run', async () => {
    const user = userEvent.setup()
    renderAt('/practice/ch-lists')
    expect(document.querySelector('iframe')).toBeNull()
    await user.click(screen.getByRole('button', { name: /^run$/i }))
    const frame = document.querySelector('iframe')!
    expect(frame.getAttribute('sandbox')).toBe('')
    expect(frame.getAttribute('srcdoc')).toContain('Shopping')
  })

  it('reports incomplete work accurately and lets you save it to the Error Notebook', async () => {
    const user = userEvent.setup()
    renderAt('/practice/ch-lists')
    await user.click(screen.getByRole('button', { name: /check solution/i }))
    expect(screen.getByText(/1 of 3 requirements met/i)).toBeInTheDocument()
    expect(screen.getAllByText('Not met').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: /save to error notebook/i }))
    await flushSave()
    expect(saved().errorNotebook[0]).toMatchObject({ source: 'challenge', refId: 'ch-lists', status: 'open' })
    expect(saved().errorNotebook[0].code).toBe(ch.starterCode)
    expect(saved().challenges['ch-lists'].completed).toBe(false)
  })

  it('reveals hints one at a time and remembers them', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/practice/ch-lists')
    expect(screen.queryByText(/Hint 1 ·/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /show hint 1 of 3/i }))
    expect(screen.getByText(/Hint 1 · Conceptual clue/)).toBeInTheDocument()
    expect(screen.queryByText(/Hint 2 ·/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /show hint 2 of 3/i }))
    await flushSave()
    unmount()
    renderAt('/practice/ch-lists')
    expect(screen.getByText(/Hint 2 · Structural clue/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show hint 3 of 3/i })).toBeInTheDocument()
  })

  it('requires explicit confirmation to reveal the solution, and never touches the draft', async () => {
    const user = userEvent.setup()
    renderAt('/practice/ch-lists')
    const ed = screen.getByRole('textbox', { name: /html editor/i })
    await user.clear(ed)
    await user.type(ed, 'my draft')
    expect(screen.queryByText('Reference solution', { selector: '.code-block__label' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /reveal reference solution/i }))
    const dlg = screen.getByRole('dialog', { name: /reveal the reference solution/i })
    expect(dlg).toBeInTheDocument()
    await user.click(within(dlg).getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText(ch.solutionExplanation[0])).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /reveal reference solution/i }))
    await user.click(screen.getByRole('button', { name: /^reveal solution$/i }))
    expect(screen.getByText(ch.solutionExplanation[0])).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /html editor/i })).toHaveValue('my draft')
  })

  it('completes the challenge with correct code, changes progress, and persists across reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/practice/ch-lists')
    const ed = screen.getByRole('textbox', { name: /html editor/i })
    await user.clear(ed)
    await user.click(ed)
    await user.paste(ch.solutionCode)
    await user.click(screen.getByRole('button', { name: /check solution/i }))
    expect(screen.getByText(/3 of 3 requirements met — challenge complete/i)).toBeInTheDocument()
    await flushSave()
    expect(saved().challenges['ch-lists']).toMatchObject({ completed: true, completedWithoutSolution: true })
    unmount()
    renderAt('/practice/ch-lists')
    expect(screen.getByRole('textbox', { name: /html editor/i })).toHaveValue(ch.solutionCode)
    expect(screen.getByText(/Completed/)).toBeInTheDocument()
    unmount()
  })

  it('focus mode hides the briefing, preserves the draft, and exits via button and Escape', async () => {
    const user = userEvent.setup()
    renderAt('/practice/ch-lists')
    const ed = () => screen.getByRole('textbox', { name: /html editor/i })
    await user.clear(ed())
    await user.type(ed(), 'draft-in-focus')
    await user.click(screen.getByRole('button', { name: /^focus mode$/i }))
    expect(document.documentElement).toHaveClass('is-focus')
    expect(screen.queryByRole('heading', { name: /requirements/i })).not.toBeInTheDocument()
    expect(ed()).toHaveValue('draft-in-focus')
    await user.click(screen.getByRole('button', { name: /exit focus mode/i }))
    expect(document.documentElement).not.toHaveClass('is-focus')
    expect(screen.getByRole('heading', { name: /requirements/i })).toBeInTheDocument()
    expect(ed()).toHaveValue('draft-in-focus')
    await user.click(screen.getByRole('button', { name: /^focus mode$/i }))
    await user.keyboard('{Escape}')
    expect(document.documentElement).not.toHaveClass('is-focus')
    expect(ed()).toHaveValue('draft-in-focus')
  })

  it('reset needs confirmation and restores the starter code', async () => {
    const user = userEvent.setup()
    renderAt('/practice/ch-lists')
    const ed = () => screen.getByRole('textbox', { name: /html editor/i })
    await user.clear(ed())
    await user.type(ed(), 'changed')
    await user.click(screen.getByRole('button', { name: /^reset$/i }))
    await user.click(screen.getByRole('button', { name: /reset editor/i }))
    expect(ed()).toHaveValue(ch.starterCode)
  })

  it('uses tabs on mobile and keeps the draft when switching', async () => {
    setWidth(390)
    const user = userEvent.setup()
    renderAt('/practice/ch-lists')
    const ed = () => screen.getByRole('textbox', { name: /html editor/i })
    await user.clear(ed())
    await user.type(ed(), 'mobile-draft')
    await user.click(screen.getByRole('tab', { name: 'Brief' }))
    expect(screen.getByRole('heading', { name: /requirements/i })).toBeVisible()
    await user.click(screen.getByRole('tab', { name: 'Editor' }))
    expect(ed()).toHaveValue('mobile-draft')
    expect(screen.queryByRole('button', { name: /focus mode/i })).not.toBeInTheDocument()
  })

  it('lesson → practice keeps the topic and the draft', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/practice/ch-lists')
    await user.clear(screen.getByRole('textbox', { name: /html editor/i }))
    await user.type(screen.getByRole('textbox', { name: /html editor/i }), 'kept')
    await flushSave()
    unmount()
    renderAt('/lesson/lists')
    await user.click(screen.getByRole('link', { name: /practise this topic/i }))
    expect(screen.getByRole('textbox', { name: /html editor/i })).toHaveValue('kept')
  })
})

describe('progress & review', () => {
  it('shows honest empty states', () => {
    renderAt('/progress')
    expect(screen.getByText(/no progress yet/i)).toBeInTheDocument()
    expect(screen.getAllByText('Not started').length).toBe(12)
    renderAt('/review')
    expect(screen.getByText(/error notebook is empty/i)).toBeInTheDocument()
  })

  it('Home shows Resume after real activity and points at the right place', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/practice/ch-links')
    await user.type(screen.getByRole('textbox', { name: /html editor/i }), ' ')
    await flushSave()
    unmount()
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /resume/i })).toHaveAttribute('href', '/practice/ch-links')
    expect(screen.getByText(/last activity/i)).toBeInTheDocument()
  })

  it('clears all data after confirmation', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/lesson/lists')
    await user.click(screen.getByRole('button', { name: /mark lesson complete/i }))
    await flushSave()
    unmount()
    renderAt('/progress')
    await user.click(screen.getByRole('button', { name: /clear all saved data/i }))
    await user.click(screen.getByRole('button', { name: /clear everything/i }))
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(screen.getByText(/no progress yet/i)).toBeInTheDocument()
  })

  it('error notebook entries can be marked understood, reopened and deleted', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, errorNotebook: [{ id: 'e1', source: 'quiz', topicId: 'lists', refId: 'lists-1', title: 'Which element?', detail: 'Use ol', status: 'open', createdAt: 1 }] }))
    const user = userEvent.setup()
    renderAt('/review')
    expect(screen.getByText('To review')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /mark as understood/i }))
    expect(screen.getByText('Understood')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /reopen/i }))
    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /delete entry/i }))
    expect(screen.getByText(/error notebook is empty/i)).toBeInTheDocument()
  })
})

describe('system states', () => {
  it('recovers from corrupt storage with a visible, dismissible notice', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken')
    const user = userEvent.setup()
    renderAt('/')
    expect(screen.getByText(/could not be read/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /learn html by exploring it/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /dismiss message/i }))
    expect(screen.queryByText(/could not be read/i)).not.toBeInTheDocument()
  })

  it('tells the truth when storage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    renderAt('/')
    expect(screen.getAllByText(/storage is unavailable|cannot be saved/i).length).toBeGreaterThan(0)
    spy.mockRestore()
  })

  it('has skip link, landmarks and a single h1 per page', () => {
    renderAt('/learn/html')
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('shows the mobile bottom navigation with 4 working destinations and marks the current page', () => {
    setWidth(390)
    renderAt('/progress')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getAllByRole('link')).toHaveLength(4)
    expect(within(nav).getByRole('link', { name: /my progress/i })).toHaveAttribute('aria-current', 'page')
  })
})
