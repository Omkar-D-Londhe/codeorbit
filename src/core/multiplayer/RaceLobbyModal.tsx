import React, { useState } from 'react'
import { generateRoomCode, type PeerRaceSession, type RaceStatus, type PeerProgress } from './peerRace'
import { Icon } from '../../components/Icon'

export interface RaceLobbyModalProps {
  open: boolean
  session: PeerRaceSession
  status: RaceStatus
  opponent: PeerProgress | null
  onClose: () => void
  onStartRace: () => void
}

export const RaceLobbyModal: React.FC<RaceLobbyModalProps> = ({
  open,
  session,
  status,
  opponent,
  onClose,
  onStartRace,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [inputCode, setInputCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleCreate = () => {
    const code = generateRoomCode()
    setCreatedCode(code)
    session.join(code, true)
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    session.join(inputCode.trim(), false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && status === 'idle') onClose()
      }}
    >
      <div
        className="card card--modal"
        role="dialog"
        aria-labelledby="lobby-h"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--c-surface-1, #131722)',
          border: '1px solid var(--c-border, #2d3548)',
          borderRadius: 'var(--r-lg, 12px)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span className="chip chip--sm chip--accent" style={{ marginBottom: '6px' }}>
              Multiplayer (Gate O-07)
            </span>
            <h2 id="lobby-h" className="card__title" style={{ margin: 0 }}>
              Live Peer Challenge Race
            </h2>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <p className="muted small" style={{ margin: '0 0 16px 0' }}>
          Compete in a real-time coding race against another student on your local network or via WebRTC.
          In accordance with Rule L-08: zero synthetic bots or simulated opponents are ever used.
        </p>

        {status === 'idle' ? (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={`btn btn--sm ${tab === 'create' ? 'btn--primary' : 'btn--ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setTab('create')}
              >
                Create Race Room
              </button>
              <button
                type="button"
                className={`btn btn--sm ${tab === 'join' ? 'btn--primary' : 'btn--ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setTab('join')}
              >
                Join with Code
              </button>
            </div>

            {tab === 'create' ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p className="muted small" style={{ marginBottom: '16px' }}>
                  Generate a 6-character room code to invite a peer to race on this challenge.
                </p>
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={handleCreate}
                >
                  <Icon name="sparkles" size={16} /> Create Room &amp; Host Race
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: 'var(--fs-small)' }}>
                  Enter 6-character Room Code:
                  <input
                    type="text"
                    maxLength={6}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 7K9X2P"
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: '6px',
                      padding: '8px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--c-surface-2, #1b2030)',
                      border: '1px solid var(--c-border)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn--primary btn--block"
                  disabled={inputCode.length !== 6}
                >
                  Join Race
                </button>
              </form>
            )}
          </div>
        ) : (
          <div style={{ padding: '16px 0', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="muted small">ROOM CODE</span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  color: 'var(--c-primary, #38bdf8)',
                  margin: '4px 0',
                }}
              >
                #{session.roomCode}
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={handleCopy}
              >
                <Icon name={copied ? 'check' : 'copy'} size={14} />
                {copied ? 'Copied code!' : 'Copy invite code'}
              </button>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--c-surface-2, #1b2030)',
                marginBottom: '16px',
                fontSize: 'var(--fs-small)',
              }}
            >
              {opponent ? (
                <div style={{ color: 'var(--c-success, #22c55e)', fontWeight: 600 }}>
                  ✓ {opponent.displayName} connected! Ready to start.
                </div>
              ) : (
                <div style={{ color: 'var(--c-warning, #f59e0b)' }}>
                  Waiting for another racer to join with code #{session.roomCode}...
                </div>
              )}
            </div>

            {session.isHost && opponent && (
              <button
                type="button"
                className="btn btn--primary btn--block btn--lg"
                onClick={onStartRace}
              >
                <Icon name="play" size={18} /> Start Countdown (3-2-1)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
