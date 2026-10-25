import { useMemo } from 'react'
import { starPositions, type StarDensity } from './starfield.ts'
import { useMotionAllowed } from './useMotionAllowed.ts'
import { useAppOptional } from '../../state/AppState'

export * from './starfield.ts'

export interface StarfieldProps {
  seed?: string | number
  density?: StarDensity | number
  className?: string
  style?: React.CSSProperties
}

/**
 * Reusable, deterministic static star layer for backdrops.
 * Deterministic dot generation based on seed.
 * Aria-hidden and completely absent in high-contrast mode.
 * Twinkle animation is applied to <= 12 dots only when motion is allowed.
 */
export function Starfield({
  seed = 'codeorbit',
  density = 'normal',
  className = '',
  style,
}: StarfieldProps) {
  const motionAllowed = useMotionAllowed()
  const app = useAppOptional()
  const isHighContrast = app?.state?.settings?.contrast === 'high'

  const stars = useMemo(() => starPositions(seed, density), [seed, density])

  // Starfield is absent in high contrast per FC-15 / spec §13
  if (isHighContrast) return null

  return (
    <svg
      aria-hidden="true"
      className={`starfield ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        ...style,
      }}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
    >
      {stars.map((star) => (
        <circle
          key={star.id}
          cx={star.x * 10}
          cy={star.y * 10}
          r={star.size}
          fill="currentColor"
          color="var(--c-text, #ffffff)"
          opacity={star.opacity}
          className={star.twinkle && motionAllowed ? 'starfield__twinkle' : undefined}
          style={
            star.twinkle && motionAllowed && star.twinkleDuration
              ? {
                  animationDuration: `${star.twinkleDuration}s`,
                  animationDelay: `${star.twinkleDelay ?? 0}s`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  )
}
