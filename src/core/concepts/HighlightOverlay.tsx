import { useEffect, useState, useRef, useCallback, useContext } from 'react'
import { UNSAFE_LocationContext } from 'react-router-dom'
import {
  getPendingHighlight,
  clearPendingHighlight,
  subscribeHighlight,
  type HighlightTarget,
} from './highlight'
import { useMotionAllowed } from '../atmosphere/useMotionAllowed'
import './conceptAtlas.css'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function useOptionalLocation() {
  const ctx = useContext(UNSAFE_LocationContext)
  return ctx ? ctx.location : null
}

export function HighlightOverlay() {
  const [target, setTarget] = useState<HighlightTarget | null>(() => getPendingHighlight())
  const [rect, setRect] = useState<Rect | null>(null)
  const [resolvedSelector, setResolvedSelector] = useState<string>('')
  const [timedOut, setTimedOut] = useState(false)
  const motionAllowed = useMotionAllowed()
  const dismissBtnRef = useRef<HTMLButtonElement>(null)
  const activeElementRef = useRef<HTMLElement | null>(null)
  const location = useOptionalLocation()
  const activePathRef = useRef<string | null>(null)

  // Route lifecycle: dismiss immediately on route changes or when navigating away
  useEffect(() => {
    if (!target) {
      activePathRef.current = null
      return
    }

    const currentPath = location?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '')
    if (activePathRef.current === null) {
      activePathRef.current = currentPath
    } else if (activePathRef.current !== currentPath) {
      clearPendingHighlight()
      return
    }

    if (target.route) {
      const targetPath = target.route.split('?')[0].replace(/\/$/, '')
      const cleanCurrent = currentPath.replace(/\/$/, '')
      if (cleanCurrent && targetPath && cleanCurrent !== targetPath) {
        clearPendingHighlight()
      }
    }
  }, [location?.pathname, target])

  useEffect(() => {
    return subscribeHighlight((next) => {
      setTarget(next)
      setRect(null)
      setResolvedSelector('')
      setTimedOut(false)
      activeElementRef.current = null
    })
  }, [])

  const measureElement = useCallback((el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    })
  }, [])

  // Reactive MutationObserver and polling retry loop (up to 1,500ms, UI-21)
  useEffect(() => {
    if (!target) {
      setRect(null)
      setResolvedSelector('')
      setTimedOut(false)
      return
    }

    const selectorsToTry = Array.from(
      new Set([
        target.selector,
        ...(target.candidateSelectors || []),
      ])
    ).filter(Boolean)

    let isSubscribed = true
    const startTime = Date.now()

    const attemptFind = (): boolean => {
      if (!isSubscribed) return false

      for (const sel of selectorsToTry) {
        try {
          const el = document.querySelector(sel) as HTMLElement | null
          const isVisible =
            el &&
            (el.offsetParent !== null ||
              (typeof window !== 'undefined' && window.getComputedStyle(el).display !== 'none'))
          if (el && isVisible) {
            activeElementRef.current = el
            setResolvedSelector(sel)
            measureElement(el)
            setTimedOut(false)
            el.scrollIntoView({
              behavior: motionAllowed ? 'smooth' : 'auto',
              block: 'nearest',
            })
            return true
          }
        } catch {
          // ignore selector syntax errors
        }
      }
      return false
    }

    // Immediate try
    if (attemptFind()) return

    // MutationObserver watches for DOM rendering (e.g. after React route changes)
    const observer = new MutationObserver(() => {
      if (attemptFind()) {
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    // Fallback interval polling up to 1,500ms
    const interval = setInterval(() => {
      if (attemptFind()) {
        clearInterval(interval)
        observer.disconnect()
      } else if (Date.now() - startTime >= 1500) {
        clearInterval(interval)
        observer.disconnect()
        if (isSubscribed) {
          // Auto-dismiss cleanly rather than showing a broken clamped card
          clearPendingHighlight()
        }
      }
    }, 60)

    return () => {
      isSubscribed = false
      observer.disconnect()
      clearInterval(interval)
    }
  }, [target, motionAllowed, measureElement])

  // ResizeObserver and scroll listener: re-measure or auto-dismiss when scrolled away/unmounted
  useEffect(() => {
    if (!target) return

    const handleUpdate = () => {
      if (!activeElementRef.current) return

      // Auto-dismiss if element was detached from DOM
      if (!document.body.contains(activeElementRef.current)) {
        clearPendingHighlight()
        return
      }

      // Auto-dismiss if element was scrolled completely out of viewport
      const r = activeElementRef.current.getBoundingClientRect()
      if (
        r.bottom <= 0 ||
        r.top >= window.innerHeight ||
        r.right <= 0 ||
        r.left >= window.innerWidth
      ) {
        clearPendingHighlight()
        return
      }

      measureElement(activeElementRef.current)
    }

    let resizeObserver: ResizeObserver | null = null
    if (activeElementRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleUpdate)
      resizeObserver.observe(activeElementRef.current)
    }

    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
    }
  }, [target, resolvedSelector, measureElement])

  // Outside click and Escape key dismissal
  useEffect(() => {
    if (!target) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        clearPendingHighlight()
      }
    }

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const callout = document.querySelector('[data-testid="concept-highlight-callout"]')
      if (callout && !callout.contains(e.target as Node)) {
        clearPendingHighlight()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const timer = setTimeout(() => {
      window.addEventListener('pointerdown', handlePointerDown)
    }, 120)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [target])

  if (!target) return null

  // Calculate callout position
  let calloutStyle: React.CSSProperties = {
    top: '24px',
    right: '24px',
  }

  if (rect) {
    if (rect.height > 350) {
      // Tall element: dock callout to top right to avoid obstructing content
      calloutStyle = {
        top: '28px',
        right: '28px',
      }
    } else {
      const spaceBelow = window.innerHeight - (rect.top + rect.height)
      const placeAbove = spaceBelow < 180 && rect.top > 180

      const top = placeAbove
        ? Math.max(16, rect.top - 160)
        : Math.min(window.innerHeight - 170, rect.top + rect.height + 14)

      const left = Math.max(16, Math.min(window.innerWidth - 380, rect.left))

      calloutStyle = {
        top: `${top}px`,
        left: `${left}px`,
      }
    }
  }

  return (
    <>
      {rect && (
        <div
          className="concept-highlight-box"
          style={{
            top: `${Math.max(0, rect.top - 4)}px`,
            left: `${Math.max(0, rect.left - 4)}px`,
            width: `${rect.width + 8}px`,
            height: `${rect.height + 8}px`,
          }}
          data-testid="concept-highlight-box"
          aria-hidden="true"
        />
      )}

      <div
        className={`concept-highlight-callout ${timedOut && !rect ? 'concept-highlight-callout--fallback' : ''}`}
        style={calloutStyle}
        role="dialog"
        aria-label="Concept application highlight"
        data-testid="concept-highlight-callout"
      >
        <div className="concept-highlight-callout__header">
          <span className="concept-highlight-callout__tag">Applied in CodeOrbit</span>
          <button
            ref={dismissBtnRef}
            type="button"
            className="concept-highlight-dismiss-btn"
            onClick={clearPendingHighlight}
            aria-label="Dismiss concept highlight"
          >
            Dismiss
          </button>
        </div>
        <h4 className="concept-highlight-callout__title">{target.label}</h4>
        {rect ? (
          <p className="concept-highlight-callout__desc">
            Selector: <code className="concept-card__code-tag">{resolvedSelector || target.selector}</code>
          </p>
        ) : (
          <p className="concept-highlight-callout__desc">
            {timedOut
              ? `Feature not visible in current view. ${target.route ? `Navigate to ${target.route} to inspect.` : ''}`
              : `Locating component: ${target.selector}...`}
          </p>
        )}
      </div>
    </>
  )
}
