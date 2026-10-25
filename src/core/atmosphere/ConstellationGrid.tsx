import { useEffect, useRef, useState } from 'react'
import { useMotionAllowed } from './useMotionAllowed'
import { useAppOptional } from '../../state/AppState'

export interface ConstellationGridProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * 1.2 Constellation Grid Overlay
 * SVG grid pattern at 4-6% opacity with rAF-throttled cursor proximity brightening.
 * Active only on fine pointer devices and when motion is allowed.
 * Pointer-events none and aria-hidden.
 */
export function ConstellationGrid({ className = '', style }: ConstellationGridProps) {
  const motionAllowed = useMotionAllowed()
  const app = useAppOptional()
  const isHighContrast = app?.state?.settings?.contrast === 'high'

  const containerRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)
  const pendingPos = useRef<{ x: number; y: number } | null>(null)
  const [hasPointerFine, setHasPointerFine] = useState(false)

  // Detect pointer: fine capability
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: fine)')
    setHasPointerFine(mq.matches)
    const handler = (e: MediaQueryListEvent) => setHasPointerFine(e.matches)
    if (mq.addEventListener) {
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [])

  // Throttle cursor updates via requestAnimationFrame on pointer: fine devices
  useEffect(() => {
    if (!motionAllowed || !hasPointerFine) return

    const updateCssVar = () => {
      if (!pendingPos.current || !containerRef.current) {
        rafId.current = null
        return
      }
      const { x, y } = pendingPos.current
      containerRef.current.style.setProperty('--grid-cursor-x', `${x}px`)
      containerRef.current.style.setProperty('--grid-cursor-y', `${y}px`)
      rafId.current = null
    }

    const onPointerMove = (e: PointerEvent) => {
      if (document.hidden) return
      pendingPos.current = { x: e.clientX, y: e.clientY }
      if (rafId.current === null) {
        rafId.current = window.requestAnimationFrame(updateCssVar)
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden && rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
    }
  }, [motionAllowed, hasPointerFine])

  if (isHighContrast) return null

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`constellation-grid ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          color: 'var(--c-text, #ffffff)',
        }}
      >
        <defs>
          <pattern id="constellation-grid-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            {/* Small intersection marker */}
            <circle cx="0" cy="0" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#constellation-grid-pattern)" />
      </svg>

      {/* Proximity brightening layer - active only with fine pointer and motion */}
      {motionAllowed && hasPointerFine && (
        <div
          className="constellation-grid__proximity"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle 280px at var(--grid-cursor-x, -999px) var(--grid-cursor-y, -999px), rgba(154, 139, 255, 0.07) 0%, transparent 75%)',
          }}
        />
      )}
    </div>
  )
}
