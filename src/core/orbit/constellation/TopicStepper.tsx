import type { Topic, NodeState } from './types'
import { Icon } from '../../../components/Icon'

export interface TopicStepperProps {
  topics: Topic[]
  selectedIndex: number
  nodeStates?: Record<string, NodeState>
  onSelectIndex: (index: number) => void
}

export function TopicStepper({
  topics,
  selectedIndex,
  nodeStates = {},
  onSelectIndex,
}: TopicStepperProps) {
  const n = topics.length
  if (n <= 1) return null

  const canPrev = selectedIndex > 0
  const canNext = selectedIndex < n - 1

  return (
    <nav
      className="constellation-stepper"
      aria-label="Constellation topic stepper"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: 'var(--surface-raised, rgba(36, 34, 53, 0.85))',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border, #3a3556)',
        borderRadius: 'var(--r-full, 9999px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        disabled={!canPrev}
        onClick={() => onSelectIndex(selectedIndex - 1)}
        aria-label="Previous topic"
        style={{ padding: '4px 8px', minHeight: '32px' }}
      >
        <Icon name="arrow-left" size={14} />
      </button>

      {n <= 14 ? (
        <>
          <div className="constellation-stepper-dots" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} role="tablist">
            {topics.map((t, i) => {
              const isSelected = i === selectedIndex
              const state = nodeStates[t.id] ?? 'available'
              const title = `${i + 1}. ${t.title} (${state})`

              let dotColor = 'var(--border-hover, #5a547a)'
              if (state === 'completed') dotColor = 'var(--success, #48c78e)'
              else if (state === 'in-progress') dotColor = 'var(--accent, #9a8bff)'
              else if (state === 'locked') dotColor = 'var(--border, #2d2a42)'

              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-current={isSelected ? 'true' : undefined}
                  aria-label={title}
                  title={title}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => onSelectIndex(i)}
                  style={{
                    width: isSelected ? '18px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    background: isSelected ? 'var(--accent, #9a8bff)' : dotColor,
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outlineOffset: '2px',
                  }}
                />
              )
            })}
          </div>
          <span className="constellation-stepper-counter" style={{ fontSize: '12px', fontWeight: 600, padding: '0 6px', display: 'none' }}>
            {selectedIndex + 1} / {n}
          </span>
        </>
      ) : (
        <span className="constellation-stepper-counter" style={{ fontSize: '12px', fontWeight: 600, padding: '0 6px' }}>
          Topic {selectedIndex + 1} of {n}
        </span>
      )}

      <button
        type="button"
        className="btn btn--ghost btn--sm"
        disabled={!canNext}
        onClick={() => onSelectIndex(selectedIndex + 1)}
        aria-label="Next topic"
        style={{ padding: '4px 8px', minHeight: '32px' }}
      >
        <Icon name="arrow-right" size={14} />
      </button>
    </nav>
  )
}
