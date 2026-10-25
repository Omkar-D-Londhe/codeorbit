import React, { forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'danger-ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    leadingIcon,
    trailingIcon,
    loading = false,
    loadingText = 'Loading...',
    fullWidth = false,
    className = '',
    children,
    disabled,
    ...props
  },
  ref
) {
  const variantClass = `btn--${variant}`
  const sizeClass = size !== 'md' ? `btn--${size}` : ''
  const blockClass = fullWidth ? 'btn--block' : ''
  const classes = ['btn', variantClass, sizeClass, blockClass, className].filter(Boolean).join(' ')

  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled ? 'true' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {leadingIcon && <span className="btn__icon-leading" aria-hidden="true">{leadingIcon}</span>}
          {children}
          {trailingIcon && <span className="btn__icon-trailing" aria-hidden="true">{trailingIcon}</span>}
        </>
      )}
    </button>
  )
})
