import React, { forwardRef, useId } from 'react'

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
  description?: React.ReactNode
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  {
    label,
    description,
    id: customId,
    className = '',
    disabled,
    checked,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const id = customId || `toggle-${generatedId}`
  const descId = description ? `${id}-desc` : undefined

  return (
    <label htmlFor={id} className={`toggle-wrapper ${className}`.trim()}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        className="toggle-input"
        checked={checked}
        disabled={disabled}
        aria-describedby={descId}
        onChange={onChange}
        {...props}
      />
      <span className="toggle-switch" aria-hidden="true" />
      <span className="toggle-label-group">
        <span className="toggle-label">{label}</span>
        {description && (
          <>
            {' '}
            <span id={descId} className="toggle-desc muted small">
              {description}
            </span>
          </>
        )}
      </span>
    </label>
  )
})
