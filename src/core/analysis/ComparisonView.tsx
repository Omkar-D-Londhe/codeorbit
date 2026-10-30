import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { ComplexityDisplay } from './ComplexityDisplay'
import { compareComplexity } from './complexityOrder'
import type { Comparison } from './types'
import './analysis.css'

export interface ComparisonViewProps {
  comparison: Comparison
}

function renderDelta(beforeVal?: string, afterVal?: string): ReactNode {
  const cmp = compareComplexity(beforeVal, afterVal)
  if (cmp === undefined) return <span className="comparison-change--unchanged">= Indeterminate</span>
  if (cmp > 0) return <span className="comparison-change--improved">▲ Improved</span>
  if (cmp < 0) return <span className="comparison-change--regressed">▼ Regressed</span>
  return <span className="comparison-change--unchanged">= Unchanged</span>
}

export function ComparisonView({ comparison }: ComparisonViewProps): ReactNode {
  const { before, after, correctness, measurement } = comparison

  const beforeTime = before.time.worst || before.time.average || before.time.best
  const afterTime = after.time.worst || after.time.average || after.time.best

  return (
    <div className="analysis-container" data-testid="comparison-view">
      <div className="analysis-section">
        <h4 className="analysis-section-title">Before vs After Comparison</h4>
        <div style={{ overflowX: 'auto', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-md)' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Before</th>
                <th>After</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Time Complexity</td>
                <td><ComplexityDisplay value={beforeTime} /></td>
                <td><ComplexityDisplay value={afterTime} /></td>
                <td>{renderDelta(beforeTime, afterTime)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Auxiliary Space</td>
                <td><ComplexityDisplay value={before.auxiliarySpace} /></td>
                <td><ComplexityDisplay value={after.auxiliarySpace} /></td>
                <td>{renderDelta(before.auxiliarySpace, after.auxiliarySpace)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Correctness Check Results */}
      <div className="analysis-section">
        <h4 className="analysis-section-title">Correctness Verification</h4>
        <div
          className="card"
          style={{
            padding: '0.75rem 1rem',
            background: correctness.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${correctness.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Icon name={correctness.passed ? 'check' : 'alert'} size={18} />
            <strong>{correctness.passed ? 'All Equivalence Checks Passed' : 'Equivalence Check Failed'}</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>{correctness.coverageNote}</p>

          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.82rem' }}>
            {correctness.cases.map((c, i) => (
              <li key={i} style={{ color: c.passed ? 'var(--c-text-muted)' : '#fca5a5' }}>
                {c.name}: {c.passed ? 'Passed' : `Failed (${c.detail || 'Output mismatch'})`}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Optional Measured Timings */}
      {measurement && (
        <div className="analysis-section">
          <h4 className="analysis-section-title">Empirical Benchmark Measurements</h4>
          <div style={{ overflowX: 'auto', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-md)' }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Input Size (n)</th>
                  <th>Before (ms)</th>
                  <th>After (ms)</th>
                </tr>
              </thead>
              <tbody>
                {measurement.inputSizes.map((size, idx) => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td>{measurement.beforeMs[idx]?.toFixed(2) ?? '—'}</td>
                    <td>{measurement.afterMs[idx]?.toFixed(2) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', marginTop: '0.35rem' }}>
            <strong>Environment note:</strong> {measurement.environmentNote}
          </div>
          <div className="analysis-disclaimer" style={{ marginTop: '0.5rem' }}>
            <Icon name="info" size={14} />
            <span>Measured timings are dependent on the test environment and are not an asymptotic proof.</span>
          </div>
        </div>
      )}
    </div>
  )
}
