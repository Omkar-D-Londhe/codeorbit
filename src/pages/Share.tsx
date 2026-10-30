import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { useToast } from '../components/Toast'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { ConfirmDialog } from '../components/Dialog'
import { CodeBlock } from '../components/CodeBlock'
import { decodeSnapshot, type SnapshotV1 } from '../core/share/snapshot'
import type { ChallengeV2 } from '../core/content/types'

function Card({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <section className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      {eyebrow && <p className="eyebrow" style={{ marginBottom: '4px' }}>{eyebrow}</p>}
      <h2 className="card__title" style={{ fontSize: '20px', marginBottom: '16px' }}>{title}</h2>
      {children}
    </section>
  )
}

function Button({
  variant = 'primary',
  size,
  children,
  onClick,
  disabled,
}: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger-ghost'
  size?: 'sm'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  const cls = `btn btn--${variant}${size ? ` btn--${size}` : ''}`
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default function Share() {
  const navigate = useNavigate()
  const toast = useToast()
  const { dispatch } = useApp()

  const [loading, setLoading] = useState(true)
  const [snapshot, setSnapshot] = useState<SnapshotV1 | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (!hash) {
        if (active) {
          setError('No snapshot token provided in the URL fragment.')
          setLoading(false)
        }
        return
      }

      const res = await decodeSnapshot(hash)
      if (!active) return

      if (res.ok && res.snapshot) {
        setSnapshot(res.snapshot)
        setError(null)
      } else {
        setError(res.error || 'Failed to decode challenge snapshot.')
        setSnapshot(null)
      }
      setLoading(false)
    }

    load()
    window.addEventListener('hashchange', load)
    return () => {
      active = false
      window.removeEventListener('hashchange', load)
    }
  }, [])

  const handleCopyChallenge = () => {
    if (!snapshot) return

    const newId = `custom:snapshot-${Date.now()}`
    const customChallenge: ChallengeV2 = {
      id: newId,
      trackId: snapshot.trackId,
      topicId: 'custom',
      title: snapshot.title,
      difficulty: 'beginner',
      prompt: `Shared challenge: ${snapshot.title}`,
      objective: `Complete the shared challenge tasks for ${snapshot.title}.`,
      files: snapshot.files.map((f) => ({
        name: f.name,
        language: snapshot.trackId,
        content: f.content,
      })),
      requirements: [
        {
          id: 'req-1',
          description: 'Valid HTML structure',
          explanation: 'Document structure must be valid.',
          rule: { kind: 'doctype' },
        },
      ],
      hints: [
        'Review the shared code carefully.',
        'Ensure all required tags are closed.',
        'Test your changes in the practice lab preview.',
      ],
      solution: {
        files: snapshot.files.map((f) => ({
          name: f.name,
          language: snapshot.trackId,
          content: f.content,
        })),
        explanation: 'Reference solution from shared snapshot.',
      },
    }

    dispatch({
      type: 'SAVE_CUSTOM_CHALLENGE',
      challenge: customChallenge,
    })

    toast.show(`"${snapshot.title}" saved to your workspace!`, 'success')
    navigate(`/practice/${newId}`)
  }

  return (
    <div className="page" style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px 64px' }}>
      <PageHeader
        title="Shared Challenge"
        lede="Inspect and import a challenge shared by a peer or instructor."
      />

      {loading ? (
        <Card title="Loading Snapshot">
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
            Decoding and validating challenge snapshot...
          </div>
        </Card>
      ) : error ? (
        <Card title="Invalid Snapshot">
          <div style={{ display: 'grid', gap: '16px', padding: '16px 0' }}>
            <div
              role="alert"
              style={{
                padding: '14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '14px',
              }}
            >
              <strong>Unable to load shared challenge:</strong> {error}
            </div>
            <div>
              <Link to="/explore" className="btn btn--secondary">
                Return to Explore
              </Link>
            </div>
          </div>
        </Card>
      ) : snapshot ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Read-Only Banner */}
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid var(--c-accent, #9a8bff)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="info" size={18} />
              <div>
                <strong>Shared Challenge Snapshot (Read-Only)</strong>
                <div className="small muted">
                  This code has not been executed. Review the source below and copy it to your workspace when ready.
                </div>
              </div>
            </div>
            <Button variant="primary" onClick={() => setConfirmOpen(true)}>
              <Icon name="copy" size={16} /> Try it in your workspace
            </Button>
          </div>

          <Card title={snapshot.title} eyebrow={`${snapshot.trackId.toUpperCase()} Track`}>
            <div style={{ display: 'grid', gap: '16px', marginTop: '12px' }}>
              <div className="small muted">
                Contains {snapshot.files.length} {snapshot.files.length === 1 ? 'file' : 'files'}:
              </div>

              {snapshot.files.map((file) => (
                <div key={file.name} style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{file.name}</div>
                  <CodeBlock code={file.content} label={file.name} />
                </div>
              ))}
            </div>
          </Card>

          <ConfirmDialog
            open={confirmOpen}
            title="Import Challenge to Workspace?"
            confirmLabel="Import to Workspace"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false)
              handleCopyChallenge()
            }}
          >
            <p>
              This will create a local copy of <strong>{snapshot.title}</strong> in your workspace so you can solve it, edit the code, and test requirements.
            </p>
          </ConfirmDialog>
        </div>
      ) : null}
    </div>
  )
}
