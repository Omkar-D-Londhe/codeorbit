import { useState, useEffect } from 'react'
import { Icon } from '../../components/Icon'
import { useToast } from '../../components/Toast'
import { encodeSnapshot, MAX_SNAPSHOT_LINK_BYTES, type SnapshotV1 } from './snapshot'

export interface ShareModalProps {
  open: boolean
  onClose: () => void
  snapshot: SnapshotV1
}

export function ShareModal({ open, onClose, snapshot }: ShareModalProps) {
  const toast = useToast()
  const [url, setUrl] = useState('')
  const [size, setSize] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    let active = true
    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const baseUrl = `${origin}/share`
        const res = await encodeSnapshot(snapshot, baseUrl)
        if (!active) return
        if (res.ok && res.url) {
          setUrl(res.url)
          setSize(res.size)
        } else {
          setError(res.error || 'Failed to generate share link.')
          setSize(res.size)
        }
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to encode snapshot.')
      } finally {
        if (active) setLoading(false)
      }
    }

    run()
    return () => {
      active = false
    }
  }, [open, snapshot])

  const handleCopy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      toast.show('Share link copied to clipboard!', 'success')
    } catch {
      toast.show('Could not copy link automatically. Please select and copy manually.', 'warning')
    }
  }

  const kbUsed = (size / 1024).toFixed(1)
  const kbMax = (MAX_SNAPSHOT_LINK_BYTES / 1024).toFixed(1)
  const percentUsed = Math.min(100, Math.round((size / MAX_SNAPSHOT_LINK_BYTES) * 100))

  if (!open) return null

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="share-dialog-title" style={{ maxWidth: '540px', width: '100%' }}>
        <h2 id="share-dialog-title" className="dialog__title">Share Challenge Snapshot</h2>
        <div className="dialog__body">
          <div style={{ display: 'grid', gap: '16px', padding: '8px 0' }}>
            <p className="small muted" style={{ margin: 0 }}>
              Shareable links encode the complete challenge directly in the URL fragment using client-side compression. No backend database or tracking is involved.
            </p>

            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                Generating compressed snapshot link...
              </div>
            ) : error ? (
              <div
                role="alert"
                style={{
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '13px',
                }}
              >
                <strong>Cannot share challenge:</strong> {error}
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="share-url-input" className="field-label small" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Share Link
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="share-url-input"
                      type="text"
                      readOnly
                      value={url}
                      className="form-input"
                      style={{ width: '100%', fontSize: '12px', fontFamily: 'monospace' }}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button type="button" className="btn btn--primary btn--sm" onClick={handleCopy}>
                      <Icon name="copy" size={14} /> Copy
                    </button>
                  </div>
                </div>

                {/* Size meter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span className="muted">Link size:</span>
                    <strong>
                      {kbUsed} KB of {kbMax} KB ({percentUsed}%)
                    </strong>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'var(--c-surface-2, #212433)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentUsed}%`,
                        height: '100%',
                        background: percentUsed > 90 ? '#ef4444' : percentUsed > 70 ? '#facc15' : 'var(--c-accent, #9a8bff)',
                        transition: 'width 200ms ease',
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="dialog__actions" style={{ marginTop: '8px' }}>
              <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
