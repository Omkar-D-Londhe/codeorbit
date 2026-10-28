import { useState, useEffect, useRef, useCallback, createContext, useContext, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../state/AppState'
import { TOUR_STEPS, type TourStep, type TourPlacement } from './steps'
import { Icon } from '../../components/Icon'

interface TourContextType {
  isActive: boolean
  startTour: () => void
  closeTour: () => void
}

const TourContext = createContext<TourContextType>({
  isActive: false,
  startTour: () => {},
  closeTour: () => {},
})

export const useTour = (): TourContextType => useContext(TourContext)

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

function getTargetRect(selector: string): SpotlightRect | null {
  try {
    const el = document.querySelector(selector)
    if (!el) return null
    const r = el.getBoundingClientRect()
    const width = r.width > 0 ? r.width : 120
    const height = r.height > 0 ? r.height : 44
    const top = (r.width > 0 || r.height > 0 ? r.top : 80) + window.scrollY
    const left = (r.width > 0 || r.height > 0 ? r.left : 40) + window.scrollX
    return {
      top,
      left,
      width,
      height,
    }
  } catch {
    return null
  }
}

function calculatePopoverCoords(
  rect: SpotlightRect,
  placement: TourPlacement,
  popoverWidth = 320,
  popoverHeight = 220
): { top: number; left: number } {
  const margin = 14
  let top = 0
  let left = 0

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const screenTargetTop = rect.top - window.scrollY
  const screenTargetLeft = rect.left - window.scrollX

  switch (placement) {
    case 'bottom':
      top = screenTargetTop + rect.height + margin
      left = screenTargetLeft + (rect.width - popoverWidth) / 2
      break
    case 'top':
      top = screenTargetTop - popoverHeight - margin
      left = screenTargetLeft + (rect.width - popoverWidth) / 2
      break
    case 'right':
      top = screenTargetTop + (rect.height - popoverHeight) / 2
      left = screenTargetLeft + rect.width + margin
      break
    case 'left':
      top = screenTargetTop + (rect.height - popoverHeight) / 2
      left = screenTargetLeft - popoverWidth - margin
      break
  }

  // Constrain within viewport boundaries
  const maxLeft = Math.max(16, viewportWidth - popoverWidth - 16)
  const maxTop = Math.max(16, viewportHeight - popoverHeight - 16)
  left = Math.max(16, Math.min(left, maxLeft))
  top = Math.max(16, Math.min(top, maxTop))

  return { top, left }
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useApp()
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null)
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 100, left: 100 })

  const popoverRef = useRef<HTMLDivElement>(null)
  const nextBtnRef = useRef<HTMLButtonElement>(null)
  const previousFocusedElement = useRef<HTMLElement | null>(null)
  const hasAutoStarted = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()

  // First-run automatic trigger: once per profile on home page, prevented on reload if already dismissed
  useEffect(() => {
    if (hasAutoStarted.current) return
    if (location.pathname !== '/') return

    const ob = state.settings?.onboarding
    const isCompleted = ob?.completed === true
    const isSkipped = typeof ob?.skippedAt === 'number'

    if (!isCompleted && !isSkipped) {
      hasAutoStarted.current = true
      // Small tick delay to let initial DOM mount
      const t = setTimeout(() => {
        previousFocusedElement.current = document.activeElement as HTMLElement | null
        setStepIndex(0)
        setIsActive(true)
      }, 350)
      return () => clearTimeout(t)
    }
  }, [state.settings?.onboarding, location.pathname])

  const findNextValidStep = useCallback(
    (startIdx: number, direction: 'forward' | 'backward' = 'forward'): number => {
      let idx = startIdx
      while (idx >= 0 && idx < TOUR_STEPS.length) {
        const step = TOUR_STEPS[idx]
        const el = document.querySelector(step.selector)
        if (el) return idx
        idx = direction === 'forward' ? idx + 1 : idx - 1
      }
      return -1
    },
    []
  )

  const closeTour = useCallback(() => {
    setIsActive(false)
    setSpotlightRect(null)
    if (previousFocusedElement.current && typeof previousFocusedElement.current.focus === 'function') {
      previousFocusedElement.current.focus()
    }
  }, [])

  const handleFinish = useCallback(() => {
    dispatch({
      type: 'SET_ONBOARDING',
      patch: { completed: true },
    })
    closeTour()
  }, [dispatch, closeTour])

  const handleSkip = useCallback(() => {
    dispatch({
      type: 'SET_ONBOARDING',
      patch: { completed: true, skippedAt: Date.now() },
    })
    closeTour()
  }, [dispatch, closeTour])

  const startTour = useCallback(() => {
    previousFocusedElement.current = document.activeElement as HTMLElement | null
    navigate('/')
    setTimeout(() => {
      setStepIndex(0)
      setIsActive(true)
    }, 150)
  }, [navigate])

  // Update spotlight and popover coords whenever stepIndex or isActive changes
  useEffect(() => {
    if (!isActive) return

    const validIdx = findNextValidStep(stepIndex, 'forward')
    if (validIdx === -1) {
      // If no steps have matching targets, gracefully finish
      closeTour()
      return
    }

    if (validIdx !== stepIndex) {
      setStepIndex(validIdx)
      return
    }

    const currentStep = TOUR_STEPS[validIdx]
    const el = document.querySelector(currentStep.selector)
    if (el) {
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
      const rect = getTargetRect(currentStep.selector)
      if (rect) {
        setSpotlightRect(rect)
        const coords = calculatePopoverCoords(rect, currentStep.placement)
        setPopoverCoords(coords)
      }
    }

    // Move focus inside popover after render
    const t = setTimeout(() => {
      nextBtnRef.current?.focus()
    }, 50)
    return () => clearTimeout(t)
  }, [isActive, stepIndex, findNextValidStep, closeTour])

  // Reposition on window resize or scroll
  useEffect(() => {
    if (!isActive) return
    const handleUpdate = () => {
      const step = TOUR_STEPS[stepIndex]
      if (!step) return
      const rect = getTargetRect(step.selector)
      if (rect) {
        setSpotlightRect(rect)
        setPopoverCoords(calculatePopoverCoords(rect, step.placement))
      }
    }
    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)
    return () => {
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
    }
  }, [isActive, stepIndex])

  // Keyboard navigation & focus trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleSkip()
      return
    }
    if (e.key === 'Tab') {
      const focusable = popoverRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable || focusable.length === 0) return
      const firstEl = focusable[0]
      const lastEl = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }
  }

  const handleNext = () => {
    const nextIdx = findNextValidStep(stepIndex + 1, 'forward')
    if (nextIdx !== -1) {
      setStepIndex(nextIdx)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    const prevIdx = findNextValidStep(stepIndex - 1, 'backward')
    if (prevIdx !== -1) {
      setStepIndex(prevIdx)
    }
  }

  const currentStep: TourStep | undefined = TOUR_STEPS[stepIndex]
  const totalSteps = TOUR_STEPS.length
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1 || findNextValidStep(stepIndex + 1, 'forward') === -1

  return (
    <TourContext.Provider value={{ isActive, startTour, closeTour }}>
      {children}
      {isActive && currentStep && (
        <div
          className="tour-overlay-root"
          role="region"
          aria-label="Product onboarding tour"
          onKeyDown={handleKeyDown}
        >
          {/* Dim backdrop with spotlight cutout */}
          <div
            className="tour-backdrop"
            onClick={handleSkip}
            aria-hidden="true"
            style={
              spotlightRect
                ? {
                    clipPath: `polygon(
                      0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                      ${spotlightRect.left - window.scrollX}px ${spotlightRect.top - window.scrollY}px,
                      ${spotlightRect.left - window.scrollX + spotlightRect.width}px ${spotlightRect.top - window.scrollY}px,
                      ${spotlightRect.left - window.scrollX + spotlightRect.width}px ${spotlightRect.top - window.scrollY + spotlightRect.height}px,
                      ${spotlightRect.left - window.scrollX}px ${spotlightRect.top - window.scrollY + spotlightRect.height}px,
                      ${spotlightRect.left - window.scrollX}px ${spotlightRect.top - window.scrollY}px
                    )`,
                  }
                : undefined
            }
          />

          {/* Spotlight outline indicator */}
          {spotlightRect && (
            <div
              className="tour-spotlight-box"
              aria-hidden="true"
              style={{
                top: `${spotlightRect.top - window.scrollY - 4}px`,
                left: `${spotlightRect.left - window.scrollX - 4}px`,
                width: `${spotlightRect.width + 8}px`,
                height: `${spotlightRect.height + 8}px`,
              }}
            />
          )}

          {/* 320px Tour Popover */}
          <div
            ref={popoverRef}
            className={`tour-popover tour-popover--${currentStep.placement}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-step-title"
            aria-describedby="tour-step-body"
            style={{
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
            }}
          >
            <div className="tour-popover__header">
              <span className="tour-popover__step">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <button
                type="button"
                className="icon-btn tour-popover__close"
                aria-label="Close tour"
                onClick={handleSkip}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="tour-popover__content">
              <h3 id="tour-step-title" className="tour-popover__title">
                {currentStep.title}
              </h3>
              <p id="tour-step-body" className="tour-popover__body">
                {currentStep.body}
              </p>
            </div>

            <div className="tour-popover__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm tour-btn-skip"
                onClick={handleSkip}
              >
                Skip
              </button>
              <div className="tour-popover__nav-btns">
                {!isFirst && (
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                )}
                <button
                  ref={nextBtnRef}
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={handleNext}
                >
                  {isLast ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>

            {/* Visual arrow pointer */}
            <div className={`tour-popover__arrow tour-popover__arrow--${currentStep.placement}`} aria-hidden="true" />
          </div>
        </div>
      )}
    </TourContext.Provider>
  )
}
