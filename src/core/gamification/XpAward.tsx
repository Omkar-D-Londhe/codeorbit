import { useEffect, useState } from 'react'
import { useMotionAllowed } from '../atmosphere/useMotionAllowed'
import { useApp } from '../../state/AppState'

export interface XpAwardProps {
  amount: number
  onComplete?: () => void
}

/**
 * Floating XP award indicator (Catalog 5.7).
 * Lasts no longer than 600ms; displays as static inline text when reduced motion is preferred.
 * Completely hidden when gamification is disabled.
 */
export function XpAward({ amount, onComplete }: XpAwardProps) {
  const { state } = useApp()
  const motionAllowed = useMotionAllowed()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 600)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible || amount <= 0 || state.settings.gamificationEnabled === false) {
    return null
  }

  return (
    <span
      className={`xp-award ${motionAllowed ? 'xp-award--animated' : 'xp-award--static'}`}
      role="status"
      aria-label={`+${amount} XP`}
    >
      +{amount} XP
    </span>
  )
}
