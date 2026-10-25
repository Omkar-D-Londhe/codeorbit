import { useAppOptional } from '../../state/AppState'
import { useMotionAllowed } from './useMotionAllowed'
import './nebula.css'

export interface NebulaProps {
  tint?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * 1.1 Dynamic Nebula Background
 * 3 stacked radial gradients tinted by --nebula-tint (or prop tint).
 * Restrained opacity (meets WCAG AA text contrast).
 * Single transform/opacity loop 90-120s.
 * Fully disabled / static in reduced motion and absent in high-contrast mode.
 */
export function Nebula({ tint, className = '', style }: NebulaProps) {
  const motionAllowed = useMotionAllowed()
  const app = useAppOptional()
  const isHighContrast = app?.state?.settings?.contrast === 'high'

  if (isHighContrast) return null

  const customStyle: React.CSSProperties = {
    ...style,
    ...(tint ? ({ '--nebula-tint': tint } as React.CSSProperties) : {}),
  }

  const animatedClass = motionAllowed ? 'nebula-glow--animated' : ''

  return (
    <div
      aria-hidden="true"
      className={`nebula-backdrop ${className}`}
      style={customStyle}
    >
      <div className={`nebula-glow nebula-glow--primary ${animatedClass}`} />
      <div className={`nebula-glow nebula-glow--secondary ${animatedClass}`} />
      <div className={`nebula-glow nebula-glow--tertiary ${animatedClass}`} />
    </div>
  )
}
