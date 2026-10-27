import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { useActiveTime, ACTIVE_TIME_LABEL, formatActiveTime } from '../../core/insights/activeTime'
import { AppStateProvider, useApp } from '../../state/AppState'

function TestComponent({ topicId }: { topicId?: string }) {
  useActiveTime(topicId)
  const { state } = useApp()
  return (
    <div>
      <span data-testid="seconds">{state.timeSpent[topicId || ''] || 0}</span>
      <span data-testid="sessions">{state.timeSpentSessions[topicId || ''] || 0}</span>
      <span data-testid="streak">{state.streakBest}</span>
      <span data-testid="activity-count">{state.activity.length}</span>
    </div>
  )
}

describe('Active-Time Tracking (Stage 15c, Enhancement 11.3 / 12.2)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('provides the authoritative device measurement label and formats time truthfully', () => {
    expect(ACTIVE_TIME_LABEL).toBe('measured on this device')
    expect(formatActiveTime(0)).toBe('0 min')
    expect(formatActiveTime(45)).toBe('< 1 min')
    expect(formatActiveTime(120)).toBe('2 min')
    expect(formatActiveTime(3600)).toBe('1 h')
    expect(formatActiveTime(3900)).toBe('1 h 5 min')
  })

  it('batches updates every 30 seconds during active engagement', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent topicId="html-structure" />
      </AppStateProvider>
    )

    expect(getByTestId('seconds').textContent).toBe('0')

    // Advance 29 seconds - not yet flushed
    act(() => {
      vi.advanceTimersByTime(29000)
    })
    expect(getByTestId('seconds').textContent).toBe('0')

    // Advance 1 more second to reach 30s batch threshold
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(getByTestId('seconds').textContent).toBe('30')

    // User activity at 30s resets idle window
    act(() => {
      window.dispatchEvent(new Event('mousemove'))
      vi.advanceTimersByTime(30000)
    })
    expect(getByTestId('seconds').textContent).toBe('60')
  })

  it('idles after 60 seconds without input and resumes when activity is detected', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent topicId="html-structure" />
      </AppStateProvider>
    )

    // User active at start and at 30s
    act(() => {
      vi.advanceTimersByTime(30000)
      window.dispatchEvent(new Event('keydown'))
      vi.advanceTimersByTime(30000)
    })
    expect(getByTestId('seconds').textContent).toBe('60')

    // Advance 60 seconds without any user events (becomes idle)
    act(() => {
      vi.advanceTimersByTime(60000)
    })
    // No new seconds should be recorded while idle
    expect(getByTestId('seconds').textContent).toBe('60')

    // User moves mouse -> resets idle timer
    act(() => {
      window.dispatchEvent(new Event('mousemove'))
    })

    // Advance 30 seconds of fresh activity
    act(() => {
      vi.advanceTimersByTime(30000)
    })
    expect(getByTestId('seconds').textContent).toBe('90')
  })

  it('pauses tracking when the window is blurred and resumes on focus', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent topicId="html-structure" />
      </AppStateProvider>
    )

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    // Window blur event
    act(() => {
      window.dispatchEvent(new Event('blur'))
      vi.advanceTimersByTime(30000)
    })
    // Still 0 flushed because window was blurred
    expect(getByTestId('seconds').textContent).toBe('0')

    // Window focus event with user interaction
    act(() => {
      window.dispatchEvent(new Event('focus'))
      window.dispatchEvent(new Event('mousemove'))
      vi.advanceTimersByTime(20000)
    })
    // 10s pre-blur + 20s post-focus = 30s -> batch flush!
    expect(getByTestId('seconds').textContent).toBe('30')
  })

  it('flushes uncommitted seconds on unmount', () => {
    function ParentComponent({ showChild }: { showChild: boolean }) {
      const { state } = useApp()
      return (
        <div>
          {showChild && <TestComponent topicId="html-structure" />}
          <span data-testid="total-seconds">{state.timeSpent['html-structure'] || 0}</span>
        </div>
      )
    }

    const { getByTestId, rerender } = render(
      <AppStateProvider>
        <ParentComponent showChild={true} />
      </AppStateProvider>
    )

    // Advance 12 seconds
    act(() => {
      vi.advanceTimersByTime(12000)
    })
    expect(getByTestId('total-seconds').textContent).toBe('0')

    // Unmount child component before reaching 30s batch threshold
    rerender(
      <AppStateProvider>
        <ParentComponent showChild={false} />
      </AppStateProvider>
    )

    expect(getByTestId('total-seconds').textContent).toBe('12')
  })

  it('never creates streaks or records activity events merely from active time', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent topicId="html-structure" />
      </AppStateProvider>
    )

    act(() => {
      vi.advanceTimersByTime(90000)
    })

    expect(Number(getByTestId('seconds').textContent)).toBeGreaterThan(0)
    expect(getByTestId('streak').textContent).toBe('0')
    expect(getByTestId('activity-count').textContent).toBe('0')
  })

  describe('Measured Session Qualification Rules (P-07)', () => {
    it('counts exactly 1 session during a continuous visit across multiple batch flushes', () => {
      const { getByTestId } = render(
        <AppStateProvider>
          <TestComponent topicId="html-structure" />
        </AppStateProvider>
      )

      expect(getByTestId('sessions').textContent).toBe('0')

      // First batch (30s)
      act(() => {
        vi.advanceTimersByTime(30000)
      })
      expect(getByTestId('seconds').textContent).toBe('30')
      expect(getByTestId('sessions').textContent).toBe('1')

      // Second batch (60s total, user active)
      act(() => {
        window.dispatchEvent(new Event('mousemove'))
        vi.advanceTimersByTime(30000)
      })
      expect(getByTestId('seconds').textContent).toBe('60')
      // Still exactly 1 session counted for this continuous visit
      expect(getByTestId('sessions').textContent).toBe('1')
    })

    it('does not qualify a session for brief bounces under 5 seconds', () => {
      function NavigationHost({ topic }: { topic?: string }) {
        const { state } = useApp()
        return (
          <div>
            {topic && <TestComponent topicId={topic} />}
            <span data-testid="bounce-sec">{state.timeSpent['html-structure'] || 0}</span>
            <span data-testid="bounce-sess">{state.timeSpentSessions['html-structure'] || 0}</span>
          </div>
        )
      }

      const { getByTestId, rerender } = render(
        <AppStateProvider>
          <NavigationHost topic="html-structure" />
        </AppStateProvider>
      )

      // User spends only 3 seconds then leaves (< 5s threshold)
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      // Navigates away
      rerender(
        <AppStateProvider>
          <NavigationHost topic={undefined} />
        </AppStateProvider>
      )

      // Time is recorded, but session count remains 0
      expect(getByTestId('bounce-sec').textContent).toBe('3')
      expect(getByTestId('bounce-sess').textContent).toBe('0')
    })

    it('qualifies distinct sessions across multiple visits to the same topic', () => {
      function MultiVisitHost({ topic }: { topic: string }) {
        const { state } = useApp()
        return (
          <div>
            <TestComponent topicId={topic} />
            <span data-testid="struct-sess">{state.timeSpentSessions['html-structure'] || 0}</span>
            <span data-testid="elem-sess">{state.timeSpentSessions['elements-attributes'] || 0}</span>
          </div>
        )
      }

      const { getByTestId, rerender } = render(
        <AppStateProvider>
          <MultiVisitHost topic="html-structure" />
        </AppStateProvider>
      )

      // Visit 1 to html-structure: 10s (> 5s threshold)
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Navigate to elements-attributes
      rerender(
        <AppStateProvider>
          <MultiVisitHost topic="elements-attributes" />
        </AppStateProvider>
      )

      // html-structure has 1 session
      expect(getByTestId('struct-sess').textContent).toBe('1')

      // Visit 1 to elements-attributes: 10s
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Navigate back to html-structure (Visit 2)
      rerender(
        <AppStateProvider>
          <MultiVisitHost topic="html-structure" />
        </AppStateProvider>
      )

      expect(getByTestId('elem-sess').textContent).toBe('1')

      // Stay on html-structure for 10s (Visit 2 active)
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Switch away to flush uncommitted
      rerender(
        <AppStateProvider>
          <MultiVisitHost topic="elements-attributes" />
        </AppStateProvider>
      )

      // html-structure now has exactly 2 distinct measured sessions!
      expect(getByTestId('struct-sess').textContent).toBe('2')
    })

    it('does not create duplicate sessions during idle periods or window blur', () => {
      const { getByTestId } = render(
        <AppStateProvider>
          <TestComponent topicId="html-structure" />
        </AppStateProvider>
      )

      // 10 seconds of activity (qualifies 1 session)
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Blur window for 60 seconds
      act(() => {
        window.dispatchEvent(new Event('blur'))
        vi.advanceTimersByTime(60000)
      })

      // Focus window and idle for 70 seconds
      act(() => {
        window.dispatchEvent(new Event('focus'))
        vi.advanceTimersByTime(70000)
      })

      // Resume activity for 20 seconds
      act(() => {
        window.dispatchEvent(new Event('mousemove'))
        vi.advanceTimersByTime(20000)
      })

      // Flushes first batch (10s + 20s = 30s)
      expect(getByTestId('seconds').textContent).toBe('30')
      // Still strictly 1 session
      expect(getByTestId('sessions').textContent).toBe('1')
    })
  })
})
