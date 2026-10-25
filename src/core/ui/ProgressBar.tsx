export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  className = ''
}: ProgressBarProps) {
  const clamped = Math.min(max, Math.max(0, value))
  const percent = max > 0 ? Math.round((clamped / max) * 100) : 0

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `${percent}% complete`}
      className={`progress-bar-track ${className}`.trim()}
    >
      <div
        className="progress-bar-fill"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
