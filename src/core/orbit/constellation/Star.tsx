import React from 'react'
import type { LayoutNode, NodeView } from './types'
import { Icon } from '../../../components/Icon'

export interface StarProps {
  node: LayoutNode
  view: NodeView
  topicTitle?: string
  isMastered?: boolean
  isRovingActive?: boolean
  zoom?: number
  onSelect: (topicId: string) => void
  onFocus?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export function Star({
  node,
  view,
  topicTitle,
  isMastered = false,
  isRovingActive = false,
  zoom = 1,
  onSelect,
  onFocus,
  onKeyDown,
}: StarProps) {
  const { topicId, state, parts, partsTotal, selected } = view
  const displayNum = String(node.index + 1).padStart(2, '0')
  const title = topicTitle || topicId

  let statusText = 'Ready to start'
  if (state === 'completed') {
    statusText = isMastered ? 'Mastered' : 'Completed'
  } else if (state === 'in-progress') {
    statusText = `${parts} of ${partsTotal} steps`
  } else if (state === 'locked') {
    statusText = 'Locked — prerequisite required'
  }

  const accessibleName = `${displayNum} ${title}. ${statusText}`
  const showFullLabel = zoom >= 0.9 || selected

  // Progress arc calculation for in-progress node
  const hasArc = state === 'in-progress' && parts > 0 && partsTotal > 0
  const circumference = 2 * Math.PI * 25 // radius 25
  const strokeDashoffset = hasArc ? circumference * (1 - parts / partsTotal) : circumference

  return (
    <button
      type="button"
      className={`constellation-star constellation-star--${state} ${selected ? 'is-selected' : ''}`}
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
      aria-label={accessibleName}
      aria-current={selected ? 'true' : undefined}
      tabIndex={isRovingActive ? 0 : -1}
      onClick={() => onSelect(topicId)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    >
      <div className="constellation-star__disc">
        {hasArc && (
          <svg
            className="constellation-star__arc"
            viewBox="0 0 56 56"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              transform: 'rotate(-90deg)',
              pointerEvents: 'none',
            }}
          >
            <circle
              cx="28"
              cy="28"
              r="25"
              fill="none"
              stroke="var(--accent, #9a8bff)"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
        )}

        <span className="constellation-star__num">{displayNum}</span>

        {state === 'completed' && (
          <span className="constellation-star__badge constellation-star__badge--success" aria-hidden="true">
            <Icon name={isMastered ? 'star' : 'check'} size={12} />
          </span>
        )}

        {state === 'locked' && (
          <span className="constellation-star__badge constellation-star__badge--lock" aria-hidden="true">
            <Icon name="lock" size={12} />
          </span>
        )}
      </div>

      <div className={`constellation-star__label constellation-star__label--${node.labelSide}`}>
        {showFullLabel ? (
          <>
            <span className="constellation-star__title">{title}</span>
            <span className="constellation-star__status-text">{statusText}</span>
          </>
        ) : (
          <span className="constellation-star__title">{displayNum}</span>
        )}
      </div>
    </button>
  )
}
