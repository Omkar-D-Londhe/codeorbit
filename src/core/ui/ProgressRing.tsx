import React from 'react'

export interface ProgressRingProps {
  value: number // 0 to 100
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  children?: React.ReactNode
  className?: string
}

export function ProgressRing({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  label,
  children,
  className = ''
}: ProgressRingProps) {
  const clampedValue = Math.min(max, Math.max(0, value))
  const percent = max > 0 ? (clampedValue / max) * 100 : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `${Math.round(percent)}% complete`}
      className={`progress-ring-container ${className}`.trim()}
      style={{ width: size, height: size, position: 'relative', display: 'inline-grid', placeItems: 'center' }}
    >
      <svg
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="progress-ring__circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring__circle-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {children && <div style={{ position: 'absolute' }}>{children}</div>}
    </div>
  )
}
