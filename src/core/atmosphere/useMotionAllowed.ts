import { useEffect, useState } from 'react'
import { useAppOptional } from '../../state/AppState'
import type { MotionPreference } from '../settings/appearance'

/**
 * Pure predicate determining whether motion/animations are allowed.
 * Rules:
 * - 'reduce' or 'reduced' -> false (motion disabled)
 * - 'full' -> true (explicit learner choice)
 * - 'system' or undefined -> follows OS prefers-reduced-motion media query
 */
export function isMotionAllowed(
  motion?: MotionPreference | string,
  osPrefersReduced = false
): boolean {
  if (motion === 'reduce' || motion === 'reduced') return false
  if (motion === 'full') return true
  return !osPrefersReduced
}

/**
 * Hook providing reactive motion allowance combining AppState settings and OS media query.
 */
export function useMotionAllowed(): boolean {
  const app = useAppOptional()
  const motionPref = app?.state?.settings?.motion ?? 'system'

  const [osReduced, setOsReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setOsReduced(e.matches)
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    } else if ('addListener' in mq) {
      (mq as unknown as { addListener: (cb: typeof onChange) => void }).addListener(onChange)
      return () => (mq as unknown as { removeListener: (cb: typeof onChange) => void }).removeListener(onChange)
    }
  }, [])

  return isMotionAllowed(motionPref, osReduced)
}
