import { useState } from 'react'
import type { CheckResult } from '../../lib/validators'
import type { Challenge } from '../../data/types'
import type { CheckHistoryEntry } from '../../state/types'
import { RequirementRow } from './RequirementRow'
import { CoachNote } from './CoachNote'
import { Icon } from '../../components/Icon'
import { Link } from 'react-router-dom'
import { lessonPath, trackPath } from '../../lib/routes'
import { getTopic } from '../../data/curriculum'

export interface FeedbackPanelProps {
  result: CheckResult | null
  challenge: Challenge
  history?: CheckHistoryEntry[]
  onSaveError?: () => void
  hasErrorSaved?: boolean
  onAskHint?: () => void
  parseError?: boolean
  className?: string
}

function formatTime(timestamp: number): string {
  try {
    const d = new Date(timestamp)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

/**
 * FeedbackPanel component (7.2, 7.4, 7.6).
 * Combines Requirement Progress Bar, grouped Requirement Rows,
 * Code Coach persona notes, and Check History (last 20 checks).
 */
export function FeedbackPanel({
  result,
  challenge,
  history = [],
  onSaveError,
  hasErrorSaved = false,
  onAskHint,
  parseError = false,
  className = '',
}: FeedbackPanelProps) {
  const [selectedHistory, setSelectedHistory] = useState<CheckHistoryEntry | null>(null)
  const topic = getTopic(challenge.topicId)

  // Empty state before first check
  if (!result && !parseError) {
    return (
      <div className={`feedback-panel ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-small, 13px)' }}>
          Run Check to see how your code measures up.
        </p>
        {history.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <span className="muted small" style={{ fontWeight: 600 }}>Previous checks for this challenge ({history.length}):</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {history.slice(-5).reverse().map((h, i) => (
                <li key={i} className="muted small" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{formatTime(h.at)}</span>
                  <span>{h.passed} / {h.total} met</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // Parse error state
  if (parseError) {
    return (
      <div className={`feedback-panel ${className}`} style={{ padding: '12px', borderRadius: 'var(--r-md, 6px)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--c-danger, #ef4444)', fontSize: 'var(--fs-small, 13px)' }}>
          Could not read this HTML
        </p>
        <p className="muted small" style={{ margin: '4px 0 0 0' }}>
          Please verify your HTML syntax for unclosed tags or invalid characters.
        </p>
      </div>
    )
  }

  const passed = result?.passed ?? 0
  const total = result?.total ?? 0
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0
  const allPassed = result?.allPassed ?? false
  const results = result?.results ?? []

  // Group into unmet and met
  const unmetResults = results.filter((r) => r.status === 'fail' || r.met === false)
  const metResults = results.filter((r) => r.status === 'pass' || r.met === true)

  const nextFailed = unmetResults[0]

  return (
    <div
      className={`feedback-panel ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      role="region"
      aria-label="Challenge Feedback"
    >
      {/* 7.2 Requirement Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className={`coach__summary ${allPassed ? 'is-good' : ''}`} style={{ margin: 0, fontWeight: 650, fontSize: 'var(--fs-small, 13px)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name={allPassed ? 'check' : 'info'} size={16} />
            {passed} of {total} requirements met{allPassed ? ' — challenge complete.' : '.'}
          </p>
          <span className="muted small" style={{ fontWeight: 600, fontSize: 'var(--fs-meta, 11px)' }}>
            {percentage}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={passed}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${passed} of ${total} requirements met`}
          style={{
            height: '8px',
            width: '100%',
            backgroundColor: 'var(--c-surface-2, #1f1d2e)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              backgroundColor: allPassed ? 'var(--c-success, #10b981)' : 'var(--c-accent, #9a8bff)',
              transition: 'width 200ms ease-out',
            }}
          />
        </div>
      </div>

      {/* 7.6 Code Coach Persona Note */}
      <CoachNote
        allPassed={allPassed}
        passedCount={passed}
        totalCount={total}
        nextFailedDescription={nextFailed?.description}
        actions={
          <>
            {!allPassed && topic && (
              <Link to={lessonPath(challenge.topicId)} className="btn btn--ghost btn--sm" style={{ fontSize: 'var(--fs-meta, 11px)', padding: '2px 8px' }}>
                Review lesson
              </Link>
            )}
            {!allPassed && onAskHint && (
              <button type="button" className="btn btn--ghost btn--sm" style={{ fontSize: 'var(--fs-meta, 11px)', padding: '2px 8px' }} onClick={onAskHint}>
                Ask for a hint
              </button>
            )}
            {!allPassed && onSaveError && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                style={{ fontSize: 'var(--fs-meta, 11px)', padding: '2px 8px' }}
                onClick={onSaveError}
                disabled={hasErrorSaved}
              >
                {hasErrorSaved ? 'Saved to Error Notebook' : 'Save to Error Notebook'}
              </button>
            )}
            {allPassed && topic && (
              <Link to={trackPath(topic.technologyId)} className="btn btn--primary btn--sm" style={{ fontSize: 'var(--fs-meta, 11px)', padding: '2px 10px' }}>
                Next topic on Orbit
              </Link>
            )}
          </>
        }
      />

      {/* 7.3 Grouped Requirement Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {unmetResults.length > 0 && (
          <div>
            <span className="muted small" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Not met ({unmetResults.length})
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {unmetResults.map((r) => {
                const reqDef = challenge.requirements.find((cr) => cr.id === r.id)
                return <RequirementRow key={r.id} result={r} explainText={reqDef?.explain ?? reqDef?.explanation} />
              })}
            </ul>
          </div>
        )}

        {metResults.length > 0 && (
          <div>
            <span className="muted small" style={{ fontWeight: 600, display: 'block', marginBottom: '6px', marginTop: unmetResults.length > 0 ? '6px' : 0 }}>
              Met ({metResults.length})
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {metResults.map((r) => {
                const reqDef = challenge.requirements.find((cr) => cr.id === r.id)
                return <RequirementRow key={r.id} result={r} explainText={reqDef?.explain ?? reqDef?.explanation} />
              })}
            </ul>
          </div>
        )}
      </div>

      {/* 7.4 Check History (per Challenge, last 20) */}
      {history.length > 0 && (
        <div style={{ borderTop: '1px solid var(--c-border, #1f1d2e)', paddingTop: '10px', marginTop: '4px' }}>
          <details style={{ fontSize: 'var(--fs-small, 12px)' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--c-text-muted, #c4c1d4)', userSelect: 'none' }}>
              Feedback History ({history.length} check{history.length === 1 ? '' : 's'})
            </summary>
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {history.slice(-20).reverse().map((entry, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--r-sm, 4px)',
                    backgroundColor: 'var(--c-surface-2, #161524)',
                    fontSize: 'var(--fs-meta, 11px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="muted">{formatTime(entry.at)}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontWeight: 600,
                        backgroundColor: entry.passed === entry.total ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: entry.passed === entry.total ? 'var(--c-success, #10b981)' : 'var(--c-danger, #ef4444)',
                      }}
                    >
                      {entry.passed} / {entry.total} met
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    style={{ fontSize: '10px', padding: '1px 6px', minHeight: '20px' }}
                    onClick={() => setSelectedHistory(entry)}
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </details>

          {/* Read-only History Entry Details Modal / Flyout */}
          {selectedHistory && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 10px',
                borderRadius: 'var(--r-sm, 4px)',
                border: '1px solid var(--c-border, #1f1d2e)',
                backgroundColor: 'var(--c-surface-1, #0f0e1a)',
                fontSize: 'var(--fs-meta, 11px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Check from {formatTime(selectedHistory.at)}</span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ fontSize: '10px', padding: '0 4px', minHeight: '18px' }}
                  onClick={() => setSelectedHistory(null)}
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
              <p style={{ margin: '2px 0' }}>
                Score: {selectedHistory.passed} of {selectedHistory.total} requirements passed.
              </p>
              {selectedHistory.failedIds.length > 0 ? (
                <p className="muted" style={{ margin: '2px 0' }}>
                  Unmet requirement IDs: {selectedHistory.failedIds.join(', ')}
                </p>
              ) : (
                <p style={{ margin: '2px 0', color: 'var(--c-success, #10b981)' }}>
                  All requirements passed in this check.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
