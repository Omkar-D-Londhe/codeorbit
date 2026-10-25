import { useEffect, useRef, useState } from 'react'
import { useMotionAllowed } from './useMotionAllowed'
import { useAppOptional } from '../../state/AppState'

export interface CursorGlowProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * 1.3 Cursor Glow / Parallax Aura
 * Fixed radial gradient following the pointer with 120ms trailing on pointer-fine devices.
 * Transform-only animation on the compositor thread.
 * Cleaned up on unmount and paused when document.hidden.
 * Pointer-events none and aria-hidden.
 */
export function CursorGlow({ className = '', style }: CursorGlowProps) {
  const motionAllowed = useMotionAllowed()
  const app = useAppOptional()
  const isHighContrast = app?.state?.settings?.contrast === 'high'

  const glowRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)
  const pendingPos = useRef<{ x: number; y: number } | null>(null)
  const [hasPointerFine, setHasPointerFine] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

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

  useEffect(() => {
    if (!motionAllowed || !hasPointerFine) return

    const updatePosition = () => {
      if (!pendingPos.current || !glowRef.current) {
        rafId.current = null
        return
      }
      const { x, y } = pendingPos.current
      glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (!isVisible) setIsVisible(true)
      rafId.current = null
    }

    const onPointerMove = (e: PointerEvent) => {
      if (document.hidden) return
      pendingPos.current = { x: e.clientX, y: e.clientY }
      if (rafId.current === null) {
        rafId.current = window.requestAnimationFrame(updatePosition)
      }
    }

    const onPointerLeave = () => {
      setIsVisible(false)
    }

    const onVisibilityChange = () => {
      if (document.hidden && rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
    }
  }, [motionAllowed, hasPointerFine, isVisible])

  if (isHighContrast || !motionAllowed || !hasPointerFine) return null

  return (
    <div
      aria-hidden="true"
      className={`cursor-glow-layer ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        ...style,
      }}
    >
      <div
        ref={glowRef}
        className="cursor-glow"
        style={{
          position: 'absolute',
          top: -190,
          left: -190,
          width: 380,
          height: 380,
          borderRadius: '50%',
          pointerEvents: 'none',
          willChange: 'transform',
          background: 'radial-gradient(circle, var(--c-accent-glow, rgba(139, 92, 246, 0.12)) 0%, transparent 70%)',
          transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease',
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  )
}
