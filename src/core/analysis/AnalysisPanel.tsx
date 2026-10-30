import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { ComplexityDisplay } from './ComplexityDisplay'
import type { AnalysisError, Bottleneck, ComplexityEstimate, Confidence, SourceRange } from './types'
import './analysis.css'

export interface AnalysisPanelProps {
  language: string
  hasCapability: boolean
  providerAvailable: boolean
  estimate?: ComplexityEstimate | null
  error?: AnalysisError | null
  isLoading?: boolean
  onRunAnalysis?: () => void
  onHighlightRange?: (range: SourceRange) => void
  onSelectBottleneck?: (bottleneck: Bottleneck) => void
}

function methodLabel(method: ComplexityEstimate['method']): string {
  switch (method) {
    case 'static-ast':
      return 'Static AST analysis'
    case 'instrumented-measurement':
      return 'Instrumented measurement'
    case 'hybrid':
      return 'Hybrid analysis'
    default:
      return method
  }
}

function ConfidenceChip({ confidence }: { confidence: Confidence }) {
  const icon = confidence === 'high' ? 'check' : confidence === 'medium' ? 'info' : 'alert'
  const text = `${confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence`

  return (
    <span className={`analysis-confidence-chip analysis-confidence-chip--${confidence}`}>
      <Icon name={icon} size={14} />
      <span>{text}</span>
    </span>
  )
}

/**
 * Analysis Panel Component.
 * Displays truthful complexity estimates, assumptions, limitations, bottlenecks,
 * and explanation steps. Shows honest 'not available' states when no provider exists.
 */
export function AnalysisPanel({
  language,
  hasCapability,
  providerAvailable,
  estimate,
  error,
  isLoading,
  onRunAnalysis,
  onHighlightRange,
  onSelectBottleneck,
}: AnalysisPanelProps): ReactNode {
  // Honest unavailable state 1: capability missing
  if (!hasCapability) {
    const isPython = language.toLowerCase() === 'python'
    return (
      <div className="analysis-container">
        <div className="analysis-empty-card" data-testid="analysis-no-capability">
          <Icon name="info" size={24} />
          <h3>{isPython ? 'Complexity analysis is not available for Python yet' : 'Complexity analysis not available'}</h3>
          <p>
            {isPython
              ? 'Algorithmic complexity analysis for Python is currently pending approval gate O-03.'
              : 'This track does not support algorithmic complexity analysis.'}
          </p>
        </div>
      </div>
    )
  }

  // Honest unavailable state 2: capability exists but no provider registered
  if (!providerAvailable) {
    const langDisplay = language ? language.toUpperCase() : 'this language'
    return (
      <div className="analysis-container">
        <div className="analysis-empty-card" data-testid="analysis-no-provider">
          <Icon name="info" size={24} />
          <h3>Complexity analysis is not available for {langDisplay} yet.</h3>
          <p>No analysis provider is registered for {langDisplay}.</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="analysis-container">
        <div className="analysis-empty-card" data-testid="analysis-loading">
          <Icon name="clock" size={24} />
          <h3>Analyzing code complexity...</h3>
          <p>Running estimator and identifying potential bottlenecks.</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="analysis-container">
        <div className="analysis-error-card" role="alert" data-testid="analysis-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Icon name="alert" size={20} />
            <strong>Analysis could not be completed</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{error.message}</p>
        </div>
        {onRunAnalysis && (
          <button type="button" className="btn btn--secondary btn--sm" onClick={onRunAnalysis}>
            <Icon name="reset" size={16} />
            Retry analysis
          </button>
        )}
      </div>
    )
  }

  // Ready to run but not run yet
  if (!estimate) {
    return (
      <div className="analysis-container">
        <div className="analysis-empty-card" data-testid="analysis-ready">
          <Icon name="compass" size={24} />
          <h3>Algorithmic Complexity</h3>
          <p>Analyze runtime complexity and auxiliary memory scaling for your solution.</p>
          {onRunAnalysis && (
            <button
              type="button"
              className="btn btn--primary"
              style={{ marginTop: '1rem' }}
              onClick={onRunAnalysis}
            >
              Run analysis
            </button>
          )}
        </div>
      </div>
    )
  }

  // Full estimate display
  return (
    <div className="analysis-container" data-testid="analysis-results">
      {/* Overview Cards */}
      <div className="analysis-grid">
        <div className="analysis-metric-card">
          <div className="analysis-metric-label">Time Complexity (Worst)</div>
          <div className="analysis-metric-value">
            <ComplexityDisplay value={estimate.time.worst || estimate.time.average || estimate.time.best} />
          </div>
          {estimate.time.average && estimate.time.average !== estimate.time.worst && (
            <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', marginTop: '0.25rem' }}>
              Average: <ComplexityDisplay value={estimate.time.average} />
            </div>
          )}
        </div>

        <div className="analysis-metric-card">
          <div className="analysis-metric-label">Auxiliary Space</div>
          <div className="analysis-metric-value">
            <ComplexityDisplay value={estimate.auxiliarySpace} />
          </div>
        </div>
      </div>

      {/* Confidence and Method Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <ConfidenceChip confidence={estimate.confidence} />
        <span style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>
          Method: {methodLabel(estimate.method)}
        </span>
      </div>

      {/* Assumptions */}
      <div className="analysis-section">
        <h4 className="analysis-section-title">Assumptions</h4>
        <ul className="analysis-list">
          {estimate.assumptions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Limitations */}
      <div className="analysis-section">
        <h4 className="analysis-section-title">Limitations</h4>
        <ul className="analysis-list">
          {estimate.limitations.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Bottlenecks List */}
      {estimate.bottlenecks.length > 0 && (
        <div className="analysis-section">
          <h4 className="analysis-section-title">Bottlenecks ({estimate.bottlenecks.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {estimate.bottlenecks.map((b) => (
              <div key={b.rank} className="analysis-bottleneck-item">
                <div className="analysis-bottleneck-header">
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Rank #{b.rank} — <ComplexityDisplay value={b.contributes} />
                  </span>
                  <button
                    type="button"
                    className="analysis-range-chip"
                    onClick={() => {
                      onHighlightRange?.(b.range)
                      onSelectBottleneck?.(b)
                    }}
                    aria-label={`Highlight line ${b.range.startLine} to ${b.range.endLine} in ${b.range.file}`}
                  >
                    <Icon name="code" size={12} />
                    {b.range.file}:{b.range.startLine}
                  </button>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>{b.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation Steps */}
      {estimate.explanation.steps.length > 0 && (
        <div className="analysis-section">
          <h4 className="analysis-section-title">Explanation Steps</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {estimate.explanation.steps.map((step, idx) => (
              <div key={idx} className="analysis-step-item">
                <div style={{ flex: 1, fontSize: '0.88rem' }}>
                  {step.text}
                  {step.contributes && (
                    <span style={{ marginLeft: '0.5rem', color: 'var(--c-text-muted)', fontSize: '0.8rem' }}>
                      (<ComplexityDisplay value={step.contributes} />)
                    </span>
                  )}
                </div>
                {step.range && (
                  <button
                    type="button"
                    className="analysis-range-chip"
                    onClick={() => onHighlightRange?.(step.range!)}
                    aria-label={`Highlight lines ${step.range.startLine}-${step.range.endLine} in ${step.range.file}`}
                  >
                    <Icon name="code" size={12} />
                    {step.range.file}:{step.range.startLine}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Heuristic Disclaimer (L-09 / STAGE_20 §13) */}
      <div className="analysis-disclaimer">
        <Icon name="info" size={16} />
        <span>Heuristic estimate, not a formal proof.</span>
      </div>
    </div>
  )
}
