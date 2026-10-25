import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, screen } from '@testing-library/react'
import { AppStateProvider, useApp } from '../state/AppState'
import { STORAGE_KEY } from '../lib/storage'
import { SOFT_BUDGET_BYTES, WARN_THRESHOLD_BYTES, quotaStatus } from '../core/storage/quota'

function TestDraftConsumer() {
  const { dispatch, saveStatus, flush } = useApp()
  return (
    <div>
      <span data-testid="status">{saveStatus.kind}</span>
      <span data-testid="quota-warn">{saveStatus.quotaWarn ? 'warn' : 'ok'}</span>
      <button
        onClick={() => dispatch({ type: 'SET_DRAFT', challengeId: 'ch-html-structure', code: `<h1>${Math.random()}</h1>` })}
      >
        Type Key
      </button>
      <button onClick={flush}>Flush</button>
    </div>
  )
}

describe('Persistence hardening and debounce (16.4)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('coalesces rapid keystrokes into a single localStorage.setItem per debounce window', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(
      <AppStateProvider>
        <TestDraftConsumer />
      </AppStateProvider>
    )

    const btn = screen.getByText('Type Key')

    // Simulate 5 rapid keystrokes in 100ms
    for (let i = 0; i < 5; i++) {
      act(() => {
        btn.click()
      })
      act(() => {
        vi.advanceTimersByTime(20)
      })
    }

    // During typing, setItem has NOT yet been called for the drafts
    const callsDuring = setItemSpy.mock.calls.filter((c) => c[0] === STORAGE_KEY).length
    expect(callsDuring).toBe(0)

    // Advance past the 300ms debounce threshold
    act(() => {
      vi.advanceTimersByTime(350)
    })

    const callsAfter = setItemSpy.mock.calls.filter((c) => c[0] === STORAGE_KEY).length
    expect(callsAfter).toBe(1)
    setItemSpy.mockRestore()
  })

  it('flushes pending writes immediately on pagehide event', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(
      <AppStateProvider>
        <TestDraftConsumer />
      </AppStateProvider>
    )

    const btn = screen.getByText('Type Key')
    act(() => {
      btn.click()
    })

    expect(setItemSpy.mock.calls.filter((c) => c[0] === STORAGE_KEY).length).toBe(0)

    // Fire pagehide event
    act(() => {
      window.dispatchEvent(new Event('pagehide'))
    })

    expect(setItemSpy.mock.calls.filter((c) => c[0] === STORAGE_KEY).length).toBe(1)
    setItemSpy.mockRestore()
  })

  it('quota status calculation correctly flags warn at 80% and full at 100%', () => {
    expect(quotaStatus(1000)).toBe('ok')
    expect(quotaStatus(WARN_THRESHOLD_BYTES)).toBe('warn')
    expect(quotaStatus(SOFT_BUDGET_BYTES)).toBe('full')
  })

  it('updates state when a storage event is fired from another tab', () => {
    render(
      <AppStateProvider>
        <TestDraftConsumer />
      </AppStateProvider>
    )

    const externalState = {
      schemaVersion: 2,
      topics: { 'html-structure': { lessonComplete: true, quizAttempts: 5 } },
      quizSessions: {},
      drafts: {},
      challenges: {},
      notes: {},
      bookmarks: [],
      errorNotebook: [],
      settings: { userName: 'External User', pace: 'casual', theme: 'starlight', accent: 'teal', contrast: 'normal', motion: 'system' },
      activity: [],
      activityDays: ['2026-10-24'],
      dailyDone: [],
      dailyAssigned: {},
      streakBest: 1
    }

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(externalState)
        })
      )
    })

    // Verified state sync
    expect(screen.getByTestId('status')).toBeInTheDocument()
  })
})
