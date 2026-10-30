import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { ComplexityDisplay } from './ComplexityDisplay'
import type { CorrectnessCheck, OptimisationSuggestion } from './types'
import './analysis.css'

export interface OptimisationPanelProps {
  suggestions: OptimisationSuggestion[]
  onApplySuggestion: (suggestion: OptimisationSuggestion) => void
  onVerifySuggestion?: (suggestion: OptimisationSuggestion) => Promise<void>
  verificationStatus?: Record<string, CorrectnessCheck>
  isVerifying?: boolean
}

export function OptimisationPanel({
  suggestions,
  onApplySuggestion,
  onVerifySuggestion,
  verificationStatus = {},
  isVerifying = false,
}: OptimisationPanelProps): ReactNode {
  if (suggestions.length === 0) {
    return (
      <div className="analysis-empty-card" data-testid="optimisation-empty">
        <Icon name="bulb" size={24} />
        <h3>No optimisation suggestions</h3>
        <p>No actionable scaling or efficiency rewrites were identified for this code.</p>
      </div>
    )
  }

  return (
    <div className="analysis-container" data-testid="optimisation-panel">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {suggestions.map((s) => {
          const check = verificationStatus[s.id]
          const isVerified = check?.passed === true

          return (
            <div
              key={s.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1rem',
                border: '1px solid var(--c-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{s.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* Verification Badge */}
                  {isVerified ? (
                    <span
                      className="badge badge--success"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                    >
                      <Icon name="check" size={12} />
                      Verified on {check.cases.length} cases
                    </span>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--c-text-muted)',
                      }}
                    >
                      <Icon name="info" size={12} />
                      Unverified suggestion
                    </span>
                  )}

                  {/* Risk Badge */}
                  <span
                    className={`badge ${s.risk === 'none' ? 'badge--success' : s.risk === 'low' ? 'badge--info' : 'badge--warning'}`}
                    style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                  >
                    {s.risk} risk
                  </span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--c-text-muted)' }}>{s.rationale}</p>

              {/* Expected Complexity */}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.82rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--c-surface-1, rgba(255,255,255,0.02))',
                  borderRadius: 'var(--radius-sm, 4px)',
                }}
              >
                {s.expected.time && (
                  <div>
                    <span style={{ color: 'var(--c-text-muted)' }}>Expected time: </span>
                    <ComplexityDisplay value={s.expected.time} />
                  </div>
                )}
                {s.expected.auxiliarySpace && (
                  <div>
                    <span style={{ color: 'var(--c-text-muted)' }}>Expected space: </span>
                    <ComplexityDisplay value={s.expected.auxiliarySpace} />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                {onVerifySuggestion && (
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    disabled={isVerifying}
                    onClick={() => onVerifySuggestion(s)}
                  >
                    <Icon name="check" size={14} />
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => onApplySuggestion(s)}
                  title="Creates a new draft file solution-optimised without overwriting your original code."
                >
                  <Icon name="code" size={14} />
                  Apply as new draft
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
