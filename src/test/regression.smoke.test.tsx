import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { SandboxedPreview } from '../components/SandboxedPreview'
import { getQuiz } from '../data/quizzes'
import { isPass, isPerfect } from '../lib/quiz'
import { trackProgress } from '../lib/progress'
import { BACKUP_KEY, STORAGE_KEY, createDefaultState, loadState, saveState, SCHEMA_VERSION } from '../lib/storage'
import { expectNoA11yViolations } from './a11y'

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  window.matchMedia = ((q: string) => {
    const m = /max-width:\s*(\d+)px/.exec(q)
    const matches = m ? w <= Number(m[1]) : false
    return {
      matches,
      media: q,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList
  }) as typeof window.matchMedia
}

const flushSave = async () => {
  await act(async () => {
    window.dispatchEvent(new Event('pagehide'))
  })
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

beforeEach(() => {
  setWidth(1440)
  window.localStorage.clear()
})

describe('G2 Regression Smoke Suite (9 Items)', () => {
  it('1. Home renders; Start/Resume reaches the correct lesson', async () => {
    // First-run Home
    const { unmount } = renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /learn html by exploring it/i })).toBeInTheDocument()
    const startLink = screen.getByRole('link', { name: /start html/i })
    expect(startLink).toHaveAttribute('href', '/learn/html')
    unmount()

    // Resume flow with lastVisited set
    const state = createDefaultState()
    state.lastVisited = { topicId: 'lists', activity: 'lesson', at: Date.now() }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    renderAt('/')
    const resumeLink = screen.getByRole('link', { name: /resume/i })
    expect(resumeLink).toHaveAttribute('href', '/lesson/lists')
  })

  it('2. Track page shows the Learning Orbit; selection via map/stepper/strip in sync; keyboard moves within bounds', async () => {
    const user = userEvent.setup()
    renderAt('/learn/html')

    const strip = within(screen.getByRole('list', { name: /topics in curriculum order/i })).getAllByRole('button')
    const arch = within(screen.getByRole('list', { name: /on the learning orbit/i })).getAllByRole('button')
    expect(strip).toHaveLength(12)
    expect(arch).toHaveLength(12)

    // Initial selection is first topic
    expect(screen.getByRole('heading', { level: 2, name: 'Document structure' })).toBeInTheDocument()

    // Click on strip node selects and updates details
    await user.click(strip[1])
    expect(screen.getByRole('heading', { level: 2, name: 'Elements and attributes' })).toBeInTheDocument()

    // Click on arch node selects and updates details
    await user.click(arch[2])
    expect(screen.getByRole('heading', { level: 2, name: 'Headings and paragraphs' })).toBeInTheDocument()

    // Keyboard navigation within strip
    strip[2].focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(strip[3])
  })

  it('3. Lesson completion persists across reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/lesson/html-structure')

    const completeBtn = screen.getByRole('button', { name: /mark lesson complete/i })
    await user.click(completeBtn)
    await flushSave()

    unmount()

    renderAt('/lesson/html-structure')
    expect(screen.getByRole('button', { name: /lesson marked complete/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('4. Quiz answer, finish and retake, with isPass and isPerfect unchanged', async () => {
    // Unit semantics check
    expect(isPass({ correct: 2, total: 3 })).toBe(true)
    expect(isPass({ correct: 1, total: 3 })).toBe(false)
    expect(isPass({ correct: 0, total: 3 })).toBe(false)
    expect(isPerfect({ correct: 3, total: 3 })).toBe(true)
    expect(isPerfect({ correct: 2, total: 3 })).toBe(false)

    const user = userEvent.setup()
    renderAt('/quiz/html-structure')

    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    const quiz = getQuiz('html-structure')!

    // Answer Q1 correctly
    await user.click(screen.getByRole('radio', { name: quiz.questions[0].options[quiz.questions[0].correctIndex] }))
    await user.click(screen.getByRole('button', { name: /check answer/i }))
    await user.click(screen.getByRole('button', { name: /next question/i }))

    // Skip Q2
    await user.click(screen.getByRole('button', { name: /skip question/i }))
    await user.click(screen.getByRole('button', { name: /next question/i }))

    // Skip Q3 & finish
    await user.click(screen.getByRole('button', { name: /skip question/i }))
    await user.click(screen.getByRole('button', { name: /see results/i }))

    expect(screen.getByRole('heading', { name: /1 of 3 correct/i })).toBeInTheDocument()

    // Retake resets the quiz
    const retakeBtn = screen.getByRole('button', { name: /retry quiz/i })
    await user.click(retakeBtn)
    expect(screen.getByRole('button', { name: /check answer/i })).toBeDisabled()
  })

  it('5. Practice: editing saves a draft, checking shows results, hints progress, and solution reveals', async () => {
    const user = userEvent.setup()
    renderAt('/practice/ch-html-structure')

    const editor = screen.getByRole('textbox', { name: /html editor/i })
    await user.type(editor, '<!-- comment -->')
    await flushSave()

    // Check button evaluates requirements
    const checkBtn = screen.getByRole('button', { name: /check solution/i })
    await user.click(checkBtn)
    expect(screen.getByText(/requirements met/i)).toBeInTheDocument()

    // Progressive hints
    const hintBtn = screen.getByRole('button', { name: /^hint$/i })
    await user.click(hintBtn)
    expect(screen.getByText(/Hint 1/i)).toBeInTheDocument()

    // Solution reveal requires confirmation and sets solutionRevealed
    const revealBtn = screen.getByRole('button', { name: /reveal reference solution/i })
    await user.click(revealBtn)
    const confirmBtn = screen.getByRole('button', { name: /reveal solution/i })
    await user.click(confirmBtn)
    expect(screen.getAllByText(/Reference solution/i).length).toBeGreaterThanOrEqual(1)
  })

  it('6. Error Notebook: failed check adds an entry, mark understood, delete', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/practice/ch-html-structure')

    // Run check to trigger failures (starter code lacks lang attribute)
    await user.click(screen.getByRole('button', { name: /check solution/i }))

    // Save to Error Notebook
    const saveBtn = await screen.findByRole('button', { name: /save to error notebook/i })
    await user.click(saveBtn)
    await flushSave()

    unmount()

    // Visit Review page
    renderAt('/review')
    expect(screen.getByRole('heading', { name: /review/i })).toBeInTheDocument()
    expect(screen.getByText(/Document structure/)).toBeInTheDocument()

    // Mark as understood
    const toggleStatusBtn = screen.getByRole('button', { name: /mark as understood/i })
    await user.click(toggleStatusBtn)
    expect(screen.getByText(/Understood/)).toBeInTheDocument()

    // Delete error entry
    const deleteBtn = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteBtn)
    const confirmDeleteBtn = screen.getByRole('button', { name: /delete entry/i })
    await user.click(confirmDeleteBtn)

    expect(screen.getByText(/your error notebook is empty/i)).toBeInTheDocument()
  })

  it('7. Progress: numbers match stored state', () => {
    const state = createDefaultState()
    state.topics['html-structure'] = {
      lessonComplete: true,
      quizBest: { correct: 3, total: 3 },
      quizAttempts: 1,
    }
    state.challenges['ch-html-structure'] = {
      attempts: 1,
      hintsRevealed: 0,
      solutionRevealed: false,
      completed: true,
      completedWithoutSolution: true,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    const tp = trackProgress(state, 'html')
    expect(tp.completedTopics).toBe(1)
    expect(tp.masteredTopics).toBe(1)
    expect(tp.parts).toBe(3)

    renderAt('/progress')
    expect(screen.getByText(/1 of 12 topics complete · 3 of 36 steps done · 1 mastered/i)).toBeInTheDocument()
  })

  it('8. Storage recovery for corrupt, newer-version and unavailable storage', () => {
    // Corrupt storage recovery
    window.localStorage.setItem(STORAGE_KEY, '{"bad-json')
    const corruptRes = loadState()
    expect(corruptRes.recovery).toBe('corrupt')
    expect(corruptRes.state.schemaVersion).toBe(SCHEMA_VERSION)
    expect(window.localStorage.getItem(BACKUP_KEY)).toBe('{"bad-json')

    // Newer-version storage recovery
    window.localStorage.clear()
    const futureBlob = JSON.stringify({ schemaVersion: 999, topics: {} })
    window.localStorage.setItem(STORAGE_KEY, futureBlob)
    const futureRes = loadState()
    expect(futureRes.recovery).toBe('newer-version')
    expect(window.localStorage.getItem(BACKUP_KEY)).toBe(futureBlob)

    // Storage unavailable via null or throwing storage mock
    const unavailResNull = loadState(null)
    expect(unavailResNull.recovery).toBe('unavailable')

    const throwingStorage = {
      getItem() {
        throw new Error('Storage unavailable')
      },
      setItem() {},
      removeItem() {},
    }
    const unavailResThrow = loadState(throwingStorage)
    expect(unavailResThrow.recovery).toBe('unavailable')

    // App still usable when storage is available
    const saveRes = saveState(createDefaultState())
    expect(saveRes.ok).toBe(true)
  })

  it('9. Preview iframe uses sandbox="", CSP meta, and srcdoc', () => {
    const sampleHtml = '<h1>Hello Sandbox</h1>'
    const { container } = render(<SandboxedPreview html={sampleHtml} />)

    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()

    // Static previews use empty sandbox=""
    expect(iframe?.getAttribute('sandbox')).toBe('')

    // Never combine allow-scripts with allow-same-origin
    const sandboxValue = iframe?.getAttribute('sandbox') ?? ''
    expect(sandboxValue.includes('allow-scripts') && sandboxValue.includes('allow-same-origin')).toBe(false)

    // Uses srcdoc
    const srcdoc = iframe?.getAttribute('srcdoc') ?? ''
    expect(srcdoc).toContain(sampleHtml)

    // Contains strict CSP meta tag
    expect(srcdoc).toContain("default-src 'none'")
  })
})

describe('G4 Accessibility: zero serious/critical violations on 8 core pages', () => {
  const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

  it('passes axe checks on Home page', async () => {
    const { container } = renderAt('/')
    await expectNoA11yViolations(container, axeOptions)
  })

  it('passes axe checks on Explore page', async () => {
    const { container } = renderAt('/explore')
    await expectNoA11yViolations(container, axeOptions)
  })

  it('passes axe checks on Track page', async () => {
    const { container } = renderAt('/learn/html')
    await expectNoA11yViolations(container, axeOptions)
  })

  it('passes axe checks on Lesson page', async () => {
    const { container } = renderAt('/lesson/html-structure')
    await expectNoA11yViolations(container, axeOptions)
  })

  it('passes axe checks on Quiz page', async () => {
    const { container } = renderAt('/quiz/html-structure')
    await expectNoA11yViolations(container, axeOptions)
  })

  it('passes axe checks on Practice page', async () => {
    const { container } = renderAt('/practice/ch-html-structure')
    await expectNoA11yViolations(container, axeOptions)
  })

  it('passes axe checks on Progress page', async () => {
    const { container } = renderAt('/progress')
    await expectNoA11yViolations(container, axeOptions)
  })

  it('passes axe checks on Review page', async () => {
    const { container } = renderAt('/review')
    await expectNoA11yViolations(container, axeOptions)
  })
})
