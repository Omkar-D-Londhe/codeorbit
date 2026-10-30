import React from 'react'
import type { PeerRaceSession, RaceStatus, PeerProgress } from './peerRace'
import { Icon } from '../../components/Icon'

export interface RaceHudProps {
  session: PeerRaceSession
  status: RaceStatus
  countdown: number
  opponentProgress: PeerProgress | null
  localPercent: number
  onLeave: () => void
}

export const RaceHud: React.FC<RaceHudProps> = ({
  session,
  status,
  countdown,
  opponentProgress,
  localPercent,
  onLeave,
}) => {
  if (status === 'idle') return null

  return (
    <div
      className="race-hud"
      role="region"
      aria-label="Multiplayer challenge race HUD"
      style={{
        background: 'var(--c-surface-1, #131722)',
        borderBottom: '2px solid var(--accent, #6366f1)',
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="chip chip--sm chip--accent">
            <Icon name="repeat" size={12} /> Room #{session.roomCode}
          </span>
          <span style={{ fontWeight: 600, fontSize: 'var(--fs-small)' }}>Challenge Race</span>
          {status === 'countdown' && (
            <span style={{ color: 'var(--c-warning, #f59e0b)', fontWeight: 700 }}>
              Starting in {countdown}...
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onLeave}
          title="Leave race"
        >
          <Icon name="x" size={14} /> Exit Race
        </button>
      </div>

      {status === 'opponent-disconnected' && (
        <div
          role="alert"
          style={{
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--c-danger, #ef4444)',
            borderRadius: 'var(--r-sm, 6px)',
            fontSize: 'var(--fs-small)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            Opponent disconnected. Waiting {session.disconnectGraceRemaining}s for reconnection...
            (Per Rule L-08: Zero synthetic bots or simulated opponents are used).
          </span>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={onLeave}
          >
            Claim Forfeit &amp; Exit
          </button>
        </div>
      )}

      {/* Progress Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* You */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span><strong>You</strong> ({session.displayName})</span>
            <span>{localPercent}%</span>
          </div>
          <div
            style={{
              height: '8px',
              background: 'var(--c-surface-2, #212638)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${localPercent}%`,
                height: '100%',
                background: 'var(--c-primary, #38bdf8)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Opponent */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span>
              <strong>{opponentProgress?.displayName || 'Waiting for racer...'}</strong>
            </span>
            <span>{opponentProgress?.percent ?? 0}%</span>
          </div>
          <div
            style={{
              height: '8px',
              background: 'var(--c-surface-2, #212638)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${opponentProgress?.percent ?? 0}%`,
                height: '100%',
                background: opponentProgress?.finished ? 'var(--c-success, #22c55e)' : 'var(--accent, #6366f1)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
