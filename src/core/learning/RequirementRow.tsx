import type { RequirementResult } from '../../lib/validators'
import { Icon } from '../../components/Icon'
import { useMotionAllowed } from '../atmosphere/useMotionAllowed'

export interface RequirementRowProps {
  result: RequirementResult
  explainText?: string
  className?: string
}

/**
 * RequirementRow component (7.3, 7.5).
 * Renders an accessible requirement row with status badge, line indicator,
 * expandable explanation accordion, and smooth state transition (disabled under reduced motion).
 */
export function RequirementRow({
  result,
  explainText,
  className = '',
}: RequirementRowProps) {
  const motionAllowed = useMotionAllowed()
  const isPass = result.status === 'pass' || result.met === true
  const explanation = explainText ?? result.explanation

  return (
    <li
      className={`coach__row coach__row--${result.status} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px 12px',
        minHeight: '44px',
        borderRadius: 'var(--r-md, 6px)',
        border: `1px solid ${isPass ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
        backgroundColor: isPass ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)',
        transition: motionAllowed ? 'background-color 150ms ease, border-color 150ms ease, transform 150ms ease' : 'none',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
          <span
            className="coach__status"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: 'var(--r-sm, 4px)',
              fontSize: 'var(--fs-meta, 11px)',
              fontWeight: 600,
              backgroundColor: isPass ? 'var(--c-success, #10b981)' : 'var(--c-danger, #ef4444)',
              color: '#0d0d17',
              flexShrink: 0,
              marginTop: '1px',
            }}
          >
            <Icon name={isPass ? 'check' : 'x'} size={12} />
            {isPass ? 'Met' : 'Not met'}
          </span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 'var(--fs-small, 13px)', fontWeight: 550, color: 'var(--c-text, #f1f0f7)' }}>
              {result.description}
            </span>
            {result.line && !isPass && (
              <span
                className="muted small"
                style={{ marginLeft: '6px', fontSize: 'var(--fs-meta, 11px)' }}
                aria-label={`Line ${result.line}: ${result.description}`}
              >
                (Line {result.line})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Explanation (7.5) */}
      {explanation && (
        <details
          className="req-explanation"
          style={{
            marginTop: '2px',
            fontSize: 'var(--fs-small, 12px)',
            color: 'var(--c-text-muted, #c4c1d4)',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              color: 'var(--c-accent, #9a8bff)',
              fontWeight: 500,
              userSelect: 'none',
              padding: '2px 0',
              outlineOffset: '2px',
            }}
          >
            Explain this requirement
          </summary>
          <p
            style={{
              margin: '6px 0 2px 0',
              padding: '6px 8px',
              borderRadius: 'var(--r-sm, 4px)',
              backgroundColor: 'var(--c-surface-2, #161524)',
              lineHeight: 1.45,
            }}
          >
            {explanation}
          </p>
        </details>
      )}
    </li>
  )
}
