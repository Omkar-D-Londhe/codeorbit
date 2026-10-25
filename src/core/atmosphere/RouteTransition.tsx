import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useMotionAllowed } from './useMotionAllowed'

export interface RouteTransitionProps {
  children: ReactNode
}

/**
 * 1.7 Cinematic Page Transitions
 * Subtle 220ms opacity + 8px rise transition between routes.
 * Skipped completely on first render and when motion is reduced.
 * Preserves focus management on <main> and does not interrupt skip links.
 */
export function RouteTransition({ children }: RouteTransitionProps) {
  const { pathname } = useLocation()
  const motionAllowed = useMotionAllowed()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    }
  }, [pathname])

  const shouldAnimate = motionAllowed && !isFirstRender.current

  return (
    <div
      key={pathname}
      className={`route-transition ${shouldAnimate ? 'route-transition--animate' : ''}`}
      style={{
        width: '100%',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  )
}
