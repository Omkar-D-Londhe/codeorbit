import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'

export interface QuizTimerProps {
  initialSeconds: number
  onExpire: () => void
  onTick?: (secondsLeft: number) => void
  active?: boolean
  className?: string
}

/**
 * Opt-in Calm Quiz Timer (5.5).
 * - Displays calm text chip with clock icon
 * - role="timer"
 * - Changes text weight (font-weight: 700) when under 10s without red panic colors
 * - Pauses automatically when tab is hidden (document.hidden)
 * - Expiry triggers onExpire callback
 */
export function QuizTimer({
  initialSeconds,
  onExpire,
  onTick,
  active = true,
  className = '',
}: QuizTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (!active || seconds <= 0) return

    let isPaused = typeof document !== 'undefined' && document.hidden

    const onVisibilityChange = () => {
      isPaused = document.hidden
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    const interval = setInterval(() => {
      if (isPaused) return

      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpire()
          return 0
        }
        const next = prev - 1
        if (onTick) onTick(next)
        return next
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [active, seconds, onExpire, onTick])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const isUrgent = seconds <= 10

  return (
    <div
      className={`quiz-timer ${className}`}
      role="timer"
      aria-label={`Time remaining: ${formatted}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: 'var(--surface-raised, #242235)',
        border: '1px solid var(--border, #3a3556)',
        borderRadius: 'var(--r-full, 9999px)',
        fontSize: 'var(--fs-small, 13px)',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: isUrgent ? 700 : 500,
        color: 'var(--text, #f0eff7)',
      }}
    >
      <Icon name="clock" size={14} />
      <span>{formatted}</span>
    </div>
  )
}
