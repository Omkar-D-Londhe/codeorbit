import React, { forwardRef, useState, useEffect } from 'react'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  icon: React.ReactNode
  tooltip?: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    tooltip,
    className = '',
    'aria-label': ariaLabel,
    disabled,
    ...props
  },
  ref
) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [timeoutId, setTimeoutId] = useState<number | null>(null)

  const handleMouseEnter = () => {
    if (!tooltip) return
    const id = window.setTimeout(() => setShowTooltip(true), 500)
    setTimeoutId(id)
  }

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setShowTooltip(false)
  }

  const handleFocus = () => {
    if (!tooltip) return
    setShowTooltip(true)
  }

  const handleBlur = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setShowTooltip(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTooltip) {
        setShowTooltip(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showTooltip])

  const classes = ['icon-btn', className].filter(Boolean).join(' ')
  const tooltipId = tooltip ? `tooltip-${ariaLabel.toLowerCase().replace(/\s+/g, '-')}` : undefined

  return (
    <div className="tooltip-trigger" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        ref={ref}
        type="button"
        className={classes}
        aria-label={ariaLabel}
        aria-describedby={showTooltip && tooltip ? tooltipId : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        aria-disabled={disabled ? 'true' : undefined}
        {...props}
      >
        {icon}
      </button>
      {showTooltip && tooltip && (
        <span id={tooltipId} role="tooltip" className="tooltip-bubble">
          {tooltip}
        </span>
      )}
    </div>
  )
})
