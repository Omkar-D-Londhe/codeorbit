import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon'

export interface CoachNoteProps {
  allPassed: boolean
  passedCount: number
  totalCount: number
  nextFailedDescription?: string
  actions?: ReactNode
  className?: string
}

/**
 * Code Coach persona component (7.6, L-05).
 * Deterministic and transparent rule-based assistant.
 * Strict copy rules:
 * - Label: 'Code Coach · rule-based, specific to this challenge'
 * - Never claims to be AI or to have reviewed code.
 * - Suggests the next smallest step without grading the learner.
 */
export function CoachNote({
  allPassed,
  passedCount: _passedCount,
  totalCount: _totalCount,
  nextFailedDescription,
  actions,
  className = '',
}: CoachNoteProps) {
  const stateClass = allPassed ? 'coach-note--passed' : 'coach-note--in-progress'

  return (
    <div className={`coach-note ${stateClass} ${className}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: allPassed ? 'var(--c-success, #10b981)' : 'var(--c-accent, #9a8bff)',
              color: '#0d0d17',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <Icon name={allPassed ? 'check' : 'compass'} size={14} />
          </span>
          <span style={{ fontWeight: 650, fontSize: 'var(--fs-small, 13px)', color: 'var(--c-text, #f1f0f7)' }}>
            Code Coach
          </span>
        </div>
        <span
          className="muted small"
          style={{ fontSize: 'var(--fs-meta, 11px)' }}
        >
          Code Coach · rule-based, specific to this challenge
        </span>
      </div>

      <div style={{ fontSize: 'var(--fs-small, 13px)', lineHeight: 1.45, color: 'var(--c-text-muted, #c4c1d4)' }}>
        {allPassed ? (
          <p style={{ margin: 0 }}>
            All requirements verified for this challenge. You are ready to explore the next topic on the Learning Orbit or take the topic quiz.
          </p>
        ) : (
          <p style={{ margin: 0 }}>
            {nextFailedDescription
              ? `Suggested next step: resolve “${nextFailedDescription}”, then check again.`
              : 'Check requirements to see which steps remain.'}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  )
}
