import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider } from '../state/AppState'
import { reducer } from '../state/reducer'
import { createDefaultState, saveState } from '../lib/storage'
import { DueReview } from '../core/learning/DueReview'
import Review from '../pages/Review'
import { createReviewCard, toDayKey } from '../core/learning/spaced'
import type { ErrorEntry } from '../state/types'

describe('Stage 18a - DueReview & Spaced Repetition Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reducer: ADD_REVIEW_CARD adds a review card', () => {
    const s0 = createDefaultState()
    const card = createReviewCard({
      id: 'rc-1',
      source: { kind: 'section', refId: 'html-structure#meta' },
      topicId: 'html-structure',
      prompt: 'What does meta viewport do?',
      answer: 'Controls the viewport sizing on mobile browsers.',
    })

    const s1 = reducer(s0, { type: 'ADD_REVIEW_CARD', card })
    expect(s1.review['rc-1']).toBeDefined()
    expect(s1.review['rc-1'].prompt).toBe('What does meta viewport do?')

    // Idempotent add
    const s2 = reducer(s1, { type: 'ADD_REVIEW_CARD', card })
    expect(Object.keys(s2.review).length).toBe(1)
  })

  it('reducer: ANSWER_REVIEW_CARD logs meaningful activity, schedules card, and NEVER alters topic mastery', () => {
    const s0 = createDefaultState()
    s0.topics['html-structure'] = {
      lessonComplete: false,
      quizAttempts: 1,
      quizBest: { correct: 1, total: 3 },
    }
    const card = createReviewCard({
      id: 'rc-1',
      source: { kind: 'section', refId: 'html-structure#meta' },
      topicId: 'html-structure',
      prompt: 'What does meta viewport do?',
      answer: 'Controls viewport.',
    })
    const s1 = reducer(s0, { type: 'ADD_REVIEW_CARD', card })

    const today = toDayKey(new Date())
    const s2 = reducer(s1, {
      type: 'ANSWER_REVIEW_CARD',
      cardId: 'rc-1',
      grade: 'good',
    })

    // 1. Spaced repetition updated: interval bumped to 1, lastGrade = 'good'
    expect(s2.review['rc-1'].intervalDays).toBe(1)
    expect(s2.review['rc-1'].lastGrade).toBe('good')
    expect(s2.review['rc-1'].due).toBeDefined()

    // 2. Meaningful activity recorded (today present in activityDays, activity event logged)
    expect(s2.activityDays).toContain(today)
    expect(s2.activity.some((a) => a.type === 'review-answer')).toBe(true)

    // 3. Topic mastery is 100% untouched
    expect(s2.topics['html-structure']).toEqual(s0.topics['html-structure'])
    expect(s2.topics['html-structure'].lessonComplete).toBe(false)
  })

  it('reducer: ADD_ERROR automatically creates corresponding review card', () => {
    const s0 = createDefaultState()
    const error: ErrorEntry = {
      id: 'err-42',
      source: 'quiz',
      topicId: 'html-structure',
      refId: 'q-1',
      title: 'Doctype mistake',
      detail: 'Forgot <!DOCTYPE html>',
      status: 'open',
      createdAt: Date.now(),
    }

    const s1 = reducer(s0, { type: 'ADD_ERROR', entry: error })
    const card = s1.review['error:err-42']
    expect(card).toBeDefined()
    expect(card.source).toEqual({ kind: 'error', refId: 'err-42' })
    expect(card.topicId).toBe('html-structure')
    expect(card.prompt).toContain('Doctype mistake')
    expect(card.answer).toContain('Forgot <!DOCTYPE html>')
  })

  it('renders "Nothing due today" empty state when no cards are due', () => {
    const s0 = createDefaultState()
    saveState(s0)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <DueReview />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Nothing due today')).toBeInTheDocument()
  })

  it('renders due card, reveals answer on Show Answer, and allows rating', () => {
    const s0 = createDefaultState()
    const today = toDayKey(new Date())
    const card = createReviewCard({
      id: 'rc-test-1',
      source: { kind: 'section', refId: 'sec-1' },
      topicId: 'html-structure',
      prompt: 'What is semantic HTML?',
      answer: 'Using HTML markup to reinforce the semantics of the information.',
      due: today,
    })
    s0.review[card.id] = card
    saveState(s0)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <DueReview />
        </AppStateProvider>
      </MemoryRouter>
    )

    // Initial state: prompt visible, answer hidden
    expect(screen.getByText('What is semantic HTML?')).toBeInTheDocument()
    expect(screen.queryByText(/Using HTML markup to reinforce/)).not.toBeInTheDocument()

    // Click Show answer
    const showBtn = screen.getByRole('button', { name: /Show answer/i })
    fireEvent.click(showBtn)

    // Answer is now visible
    expect(screen.getByText(/Using HTML markup to reinforce/)).toBeInTheDocument()

    // 4 rating buttons visible
    const goodBtn = screen.getByRole('button', { name: /Good/i })
    expect(goodBtn).toBeInTheDocument()
    fireEvent.click(goodBtn)

    // Session finished -> empty state
    expect(screen.getByText('Nothing due today')).toBeInTheDocument()
  })

  it('supports keyboard shortcuts Space to reveal and 3 for Good', () => {
    const s0 = createDefaultState()
    const today = toDayKey(new Date())
    const card = createReviewCard({
      id: 'rc-key-1',
      source: { kind: 'section', refId: 'sec-1' },
      topicId: 'html-structure',
      prompt: 'Keyboard shortcut prompt',
      answer: 'Keyboard shortcut answer',
      due: today,
    })
    s0.review[card.id] = card
    saveState(s0)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <DueReview />
        </AppStateProvider>
      </MemoryRouter>
    )

    // Space reveals answer
    fireEvent.keyDown(window, { key: ' ' })
    expect(screen.getByText('Keyboard shortcut answer')).toBeInTheDocument()

    // '3' presses Good
    fireEvent.keyDown(window, { key: '3' })
    expect(screen.getByText('Nothing due today')).toBeInTheDocument()
  })

  it('Review page renders "Due today" tab and badge', () => {
    const s0 = createDefaultState()
    const today = toDayKey(new Date())
    const card = createReviewCard({
      id: 'rc-badge',
      source: { kind: 'section', refId: 's1' },
      topicId: 'html-structure',
      prompt: 'Badge prompt',
      answer: 'Badge answer',
      due: today,
    })
    s0.review[card.id] = card
    saveState(s0)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <Review />
        </AppStateProvider>
      </MemoryRouter>
    )

    // Tab list contains Due today (1)
    expect(screen.getByRole('tab', { name: /Due today \(1\)/i })).toBeInTheDocument()
  })
})
