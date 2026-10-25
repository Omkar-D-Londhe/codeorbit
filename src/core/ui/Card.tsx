import React, { forwardRef } from 'react'

export type CardVariant = 'default' | 'feature' | 'quiet' | 'glass'

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: CardVariant
  title?: React.ReactNode
  eyebrow?: React.ReactNode
  footer?: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'default',
    title,
    eyebrow,
    footer,
    className = '',
    children,
    ...props
  },
  ref
) {
  const variantClass = variant !== 'default' ? `card--${variant}` : ''
  const classes = ['card', variantClass, className].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={classes} {...props}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      {title && <h3 className="card__title">{title}</h3>}
      {children}
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  )
})
