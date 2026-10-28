import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoA11yViolations } from './a11y'
import { AppStateProvider, useApp } from '../state/AppState'
import { ToastProvider } from '../components/Toast'
import { TourProvider, useTour } from '../core/onboarding/Tour'
import { TOUR_STEPS } from '../core/onboarding/steps'
import { reducer } from '../state/reducer'
import { sanitizeState, createDefaultState } from '../lib/storage'
import Settings from '../pages/Settings'

function TestTourConsumer() {
  const { isActive, startTour, closeTour } = useTour()
  const { state } = useApp()
  return (
    <div>
      <span data-testid="tour-active">{isActive ? 'active' : 'inactive'}</span>
      <span data-testid="onboarding-completed">{state.settings.onboarding?.completed ? 'yes' : 'no'}</span>
      <span data-testid="onboarding-skipped">{state.settings.onboarding?.skippedAt ? 'yes' : 'no'}</span>
      <button data-testid="start-tour-btn" onClick={startTour}>Start Tour</button>
      <button data-testid="close-tour-btn" onClick={closeTour}>Close Tour</button>

      {/* Authored target elements for testing */}
      <div data-tour="orbit" style={{ width: 100, height: 40 }}>Orbit Node</div>
      <div data-tour="lesson" style={{ width: 100, height: 40 }}>Lesson Node</div>
      <div data-tour="practice" style={{ width: 100, height: 40 }}>Practice Node</div>
      <div data-tour="review" style={{ width: 100, height: 40 }}>Review Node</div>
      <div data-tour="search" style={{ width: 100, height: 40 }}>Search Node</div>
      <div data-tour="settings" style={{ width: 100, height: 40 }}>Settings Node</div>
    </div>
  )
}

describe('Onboarding Tour Sub-Stage 17b (15.1)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('1. State & Storage Sanitization', () => {
    it('sanitizes valid onboarding state correctly', () => {
      const raw = {
        ...createDefaultState(),
        settings: {
          ...createDefaultState().settings,
          onboarding: { completed: true, skippedAt: 1700000000 },
        },
      }
      const { state, repaired } = sanitizeState(raw)
      expect(repaired).toBe(false)
      expect(state.settings.onboarding).toEqual({ completed: true, skippedAt: 1700000000 })
    })

    it('repairs malformed onboarding settings gracefully', () => {
      const raw = {
        ...createDefaultState(),
        settings: {
          ...createDefaultState().settings,
          onboarding: { completed: 'yes' as unknown as boolean, skippedAt: -50 },
        },
      }
      const { state, repaired } = sanitizeState(raw)
      expect(repaired).toBe(true)
      expect(state.settings.onboarding).toEqual({ completed: false })
    })

    it('SET_ONBOARDING reducer action updates onboarding state', () => {
      const s0 = createDefaultState()
      expect(s0.settings.onboarding?.completed).toBe(false)

      const s1 = reducer(s0, {
        type: 'SET_ONBOARDING',
        patch: { completed: true, skippedAt: 12345 },
      })
      expect(s1.settings.onboarding).toEqual({ completed: true, skippedAt: 12345 })

      const s2 = reducer(s1, {
        type: 'SET_ONBOARDING',
        patch: { completed: false, skippedAt: undefined },
      })
      expect(s2.settings.onboarding?.completed).toBe(false)
    })
  })

  describe('2. First-Run Auto-Trigger & Single-Run Invariant', () => {
    it('auto-starts tour on fresh profile after initial delay', () => {
      render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <TestTourConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('tour-active').textContent).toBe('inactive')

      // Advance timers past initial mount delay (350ms + 50ms)
      act(() => {
        vi.advanceTimersByTime(450)
      })

      expect(screen.getByTestId('tour-active').textContent).toBe('active')
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
    })

    it('does not auto-start if profile is already marked completed', () => {
      const s = createDefaultState()
      s.settings.onboarding = { completed: true }
      localStorage.setItem('codeorbit:state', JSON.stringify(s))

      render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <TestTourConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(screen.getByTestId('tour-active').textContent).toBe('inactive')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('does not auto-start if profile has skippedAt recorded', () => {
      const s = createDefaultState()
      s.settings.onboarding = { completed: true, skippedAt: 9999 }
      localStorage.setItem('codeorbit:state', JSON.stringify(s))

      render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <TestTourConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(screen.getByTestId('tour-active').textContent).toBe('inactive')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('3. Step Navigation, Completion & Skip', () => {
    it('advances through authored steps, allows Back, and finishes on last step', () => {
      render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <TestTourConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      act(() => {
        vi.advanceTimersByTime(450)
      })

      // Step 1
      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
      expect(screen.getByText(TOUR_STEPS[0].title)).toBeInTheDocument()

      // Click Next -> Step 2
      const nextBtn = screen.getByRole('button', { name: 'Next' })
      act(() => {
        fireEvent.click(nextBtn)
        vi.advanceTimersByTime(100)
      })
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
      expect(screen.getByText(TOUR_STEPS[1].title)).toBeInTheDocument()

      // Back button appears on step 2
      const backBtn = screen.getByRole('button', { name: 'Back' })
      expect(backBtn).toBeInTheDocument()

      act(() => {
        fireEvent.click(backBtn)
        vi.advanceTimersByTime(100)
      })
      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()

      // Navigate to step 6 (last step)
      for (let i = 1; i <= 5; i++) {
        act(() => {
          fireEvent.click(screen.getByRole('button', { name: 'Next' }))
          vi.advanceTimersByTime(100)
        })
      }

      expect(screen.getByText('Step 6 of 6')).toBeInTheDocument()
      const finishBtn = screen.getByRole('button', { name: 'Finish' })
      expect(finishBtn).toBeInTheDocument()

      act(() => {
        fireEvent.click(finishBtn)
      })

      expect(screen.getByTestId('tour-active').textContent).toBe('inactive')
      expect(screen.getByTestId('onboarding-completed').textContent).toBe('yes')
    })

    it('clicking Skip immediately dismisses tour and records skippedAt timestamp', () => {
      render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <TestTourConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      act(() => {
        vi.advanceTimersByTime(450)
      })

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      const skipBtn = screen.getByRole('button', { name: 'Skip' })
      act(() => {
        fireEvent.click(skipBtn)
      })

      expect(screen.getByTestId('tour-active').textContent).toBe('inactive')
      expect(screen.getByTestId('onboarding-completed').textContent).toBe('yes')
      expect(screen.getByTestId('onboarding-skipped').textContent).toBe('yes')
    })

    it('pressing Escape key dismisses tour and restores focus', () => {
      render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <TestTourConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      act(() => {
        vi.advanceTimersByTime(450)
      })

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()

      act(() => {
        fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
      })

      expect(screen.getByTestId('tour-active').textContent).toBe('inactive')
      expect(screen.getByTestId('onboarding-completed').textContent).toBe('yes')
    })
  })

  describe('4. Focus Trapping & Replay from Settings', () => {
    it('traps focus inside the popover during keyboard Tab navigation', () => {
      render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <TestTourConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      act(() => {
        vi.advanceTimersByTime(450)
      })

      const dialog = screen.getByRole('dialog')
      const closeBtn = screen.getByRole('button', { name: 'Close tour' })
      const skipBtn = screen.getByRole('button', { name: 'Skip' })
      const nextBtn = screen.getByRole('button', { name: 'Next' })
      expect(skipBtn).toBeInTheDocument()

      // Focus last element (next button) and press Tab -> should wrap to closeBtn
      nextBtn.focus()
      expect(document.activeElement).toBe(nextBtn)

      act(() => {
        fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: false })
      })
      expect(document.activeElement).toBe(closeBtn)

      // Shift+Tab from closeBtn -> should wrap to nextBtn
      act(() => {
        fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
      })
      expect(document.activeElement).toBe(nextBtn)
    })

    it('Settings page contains Replay onboarding tour button that restarts the tour', () => {
      const s = createDefaultState()
      s.settings.onboarding = { completed: true }
      localStorage.setItem('codeorbit:state', JSON.stringify(s))

      render(
        <MemoryRouter initialEntries={['/settings']}>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <div>
                  <div data-tour="orbit">Orbit Target</div>
                  <Settings />
                </div>
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      const replayBtn = screen.getByRole('button', { name: /Replay onboarding tour/i })
      expect(replayBtn).toBeInTheDocument()

      act(() => {
        fireEvent.click(replayBtn)
        vi.advanceTimersByTime(250)
      })

      // Tour started
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
    })
  })

  describe('5. Missing Target Handling & Graceful Degradation', () => {
    it('silently skips steps whose target element is missing from the DOM', () => {
      function PartialTargetConsumer() {
        return (
          <div>
            {/* Only steps 1 (orbit) and 3 (practice) are in the DOM */}
            <div data-tour="orbit">Orbit Element</div>
            <div data-tour="practice">Practice Element</div>
          </div>
        )
      }

      render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <PartialTargetConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      act(() => {
        vi.advanceTimersByTime(450)
      })

      // Step 1 (orbit) is found
      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()

      // Click Next: step 2 (lesson) is missing, so it automatically skips to step 3 (practice)!
      const nextBtn = screen.getByRole('button', { name: 'Next' })
      act(() => {
        fireEvent.click(nextBtn)
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByText('Step 3 of 6')).toBeInTheDocument()
      expect(screen.getByText('Practice Lab')).toBeInTheDocument()
    })
  })

  describe('6. Accessibility Compliance', () => {
    it('popover dialog passes automated axe accessibility checks with 0 violations', async () => {
      const { container } = render(
        <MemoryRouter>
          <AppStateProvider>
            <ToastProvider>
              <TourProvider>
                <TestTourConsumer />
              </TourProvider>
            </ToastProvider>
          </AppStateProvider>
        </MemoryRouter>
      )

      act(() => {
        vi.advanceTimersByTime(450)
      })

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'tour-step-title')
      expect(dialog).toHaveAttribute('aria-describedby', 'tour-step-body')

      vi.useRealTimers()
      await expectNoA11yViolations(container)
    })
  })
})
