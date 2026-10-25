import { useLocation } from 'react-router-dom'
import { useAppOptional } from '../../state/AppState'
import { useTrack } from '../content/useTrack'
import { Nebula } from './Nebula'
import { ConstellationGrid } from './ConstellationGrid'
import { CursorGlow } from './CursorGlow'
import { Particles } from './Particles'
import { DEFAULT_ATMOSPHERE_SETTINGS } from '../../state/types'

export interface AtmosphereProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * Atmosphere Layer Manager
 * Fixed background container rendered behind content at z-index: 0.
 * Pointer-events none and aria-hidden.
 * Composes:
 * - Nebula: on Home ('/') and Track ('/learn' routes)
 * - ConstellationGrid: on all pages (opt-out)
 * - CursorGlow: fine pointer devices (opt-in)
 * - Particles: hero area on Home only (opt-in)
 */
export function Atmosphere({ className = '', style }: AtmosphereProps) {
  const { pathname } = useLocation()
  const app = useAppOptional()
  const isHighContrast = app?.state?.settings?.contrast === 'high'
  const atmosphere = app?.state?.settings?.atmosphere ?? DEFAULT_ATMOSPHERE_SETTINGS
  const track = useTrack()

  // In high-contrast mode, all atmosphere layers are disabled per spec §9
  if (isHighContrast) return null

  // Nebula is visible on Home and Track/Learn routes only per spec §9
  const isHomeOrTrack = pathname === '/' || pathname.startsWith('/learn')
  const showNebula = atmosphere.nebula && isHomeOrTrack
  const showGrid = atmosphere.grid
  const showCursorGlow = atmosphere.cursorGlow
  const showParticles = atmosphere.particles && pathname === '/'

  const nebulaTint = track?.tint

  return (
    <div
      aria-hidden="true"
      className={`atmosphere-root ${className}`}
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
      {showNebula && <Nebula tint={nebulaTint} />}
      {showGrid && <ConstellationGrid />}
      {showParticles && <Particles />}
      {showCursorGlow && <CursorGlow />}
    </div>
  )
}
