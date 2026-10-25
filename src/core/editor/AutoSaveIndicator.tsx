import { useEffect, useState } from 'react'
import { useApp } from '../../state/AppState'

export interface AutoSaveIndicatorProps {
  className?: string
  style?: React.CSSProperties
  title?: string
}

/**
 * Auto-Save Indicator (6.3)
 * Displays current draft persistence status using saveStatus from AppState.
 * Updates relative timestamp every 10s.
 * Green when saved, amber on storage failure ("Draft not saved").
 */
export function AutoSaveIndicator({ className = '', style, title }: AutoSaveIndicatorProps) {
  const { saveStatus } = useApp()
  const [, setTick] = useState(0)

  // Update relative time display every 10 seconds while mounted
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(timer)
  }, [])

  let statusText = 'Auto-save ready'
  let dotColor = 'var(--c-text-muted, #85839b)'

  if (saveStatus.kind === 'saved' && saveStatus.at) {
    const elapsedSec = Math.max(0, Math.floor((Date.now() - saveStatus.at) / 1000))
    if (elapsedSec < 5) {
      statusText = 'Saved just now'
    } else if (elapsedSec < 60) {
      statusText = `Saved ${elapsedSec}s ago`
    } else {
      const mins = Math.floor(elapsedSec / 60)
      statusText = `Saved ${mins}m ago`
    }
    dotColor = 'var(--c-success, #10b981)'
  } else if (saveStatus.kind === 'error') {
    statusText = 'Draft not saved'
    dotColor = 'var(--c-warning, #f59e0b)'
  }

  return (
    <div
      role="status"
      aria-live="polite"
      title={title}
      className={`auto-save-indicator ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: 'var(--fs-small, 12.8px)',
        color: saveStatus.kind === 'error' ? 'var(--c-warning, #f59e0b)' : 'var(--c-text-muted, #85839b)',
        ...style,
      }}
    >
      <span
        className="auto-save-dot"
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          transition: 'background-color var(--t-fast, 140ms ease)',
        }}
      />
      <span>{statusText}</span>
    </div>
  )
}
