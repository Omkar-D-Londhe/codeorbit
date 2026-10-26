import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import Progress from '../../pages/Progress'
import { AppStateProvider } from '../../state/AppState'
import { ToastProvider, useToast } from '../../components/Toast'
import { XpAward } from '../../core/gamification/XpAward'
import { registerTrack, clearTracks } from '../../core/content/registry'
import { htmlTrack } from '../../tracks/html/track'
import { createDefaultState, saveState } from '../../lib/storage'

describe('Stage 11b Engagement UI & Integration (Catalog 8.1, 8.2, 8.6, 5.7, P-04)', () => {
  beforeEach(() => {
    localStorage.clear()
    clearTracks()
    registerTrack(htmlTrack)
  })

  it('renders XP bar, Daily challenge card, Personal bests, and Badge gallery on Progress page', () => {
    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Progress />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // XP progressbar
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText(/Level 0 · 0 XP/)).toBeInTheDocument()

    // Daily challenge summary link (Stage 12: canonical DailyChallengeCard is on Dashboard)
    expect(screen.getByText('Daily challenge')).toBeInTheDocument()
    expect(screen.getByText(/available on your dashboard/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Go to Dashboard/i })).toHaveAttribute('href', '/')

    // Personal bests
    expect(screen.getByRole('heading', { name: /Personal bests/i })).toBeInTheDocument()
    expect(screen.getByText(/Your best on this device/i)).toBeInTheDocument()

    // Achievements Badge gallery
    expect(screen.getByRole('heading', { name: /Achievements/i })).toBeInTheDocument()
    expect(screen.getByText('First Challenge Completed')).toBeInTheDocument()
    expect(screen.getByText('Pass every requirement of any practice challenge.')).toBeInTheDocument()
  })

  it('RULE P-04: Settings toggle off hides XP bar, badges, and personal bests, but keeps Daily challenge card', () => {
    const customState = createDefaultState()
    customState.settings.gamificationEnabled = false
    saveState(customState)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Progress />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Daily challenge card MUST remain visible (it is a core learning feature)
    expect(screen.getByText('Daily challenge')).toBeInTheDocument()

    // Gamification elements MUST be hidden
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Achievements/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Personal bests/i })).not.toBeInTheDocument()
  })

  it('XpAward component renders +N XP and respects motion preferences', () => {
    const fullMotionState = createDefaultState()
    fullMotionState.settings.motion = 'full'
    saveState(fullMotionState)

    const { unmount } = render(
      <MemoryRouter>
        <AppStateProvider>
          <XpAward amount={40} />
        </AppStateProvider>
      </MemoryRouter>
    )

    const el = screen.getByRole('status')
    expect(el).toHaveTextContent('+40 XP')
    expect(el).toHaveClass('xp-award--animated')
    unmount()

    // Reduced motion mode in fresh provider
    const reducedMotionState = createDefaultState()
    reducedMotionState.settings.motion = 'reduced'
    saveState(reducedMotionState)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <XpAward amount={40} />
        </AppStateProvider>
      </MemoryRouter>
    )
    expect(screen.getByRole('status')).toHaveClass('xp-award--static')
  })

  it('Toast deduplication prevents duplicate milestone messages with the same key', () => {
    function TestToastSender() {
      const toast = useToast()
      return (
        <button
          type="button"
          onClick={() => {
            toast.show('First Blood unlocked!', 'success', 'milestone-first-blood')
            toast.show('First Blood unlocked!', 'success', 'milestone-first-blood')
          }}
        >
          Send Toasts
        </button>
      )
    }

    render(
      <ToastProvider>
        <TestToastSender />
      </ToastProvider>
    )

    const btn = screen.getByRole('button', { name: 'Send Toasts' })
    act(() => {
      btn.click()
    })

    // Should only have 1 toast item, not 2
    const toasts = screen.getAllByText('First Blood unlocked!')
    expect(toasts).toHaveLength(1)
  })
})
