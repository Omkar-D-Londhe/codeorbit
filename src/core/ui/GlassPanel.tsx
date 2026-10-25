import React, { forwardRef } from 'react'

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  {
    elevated = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const classes = ['glass-panel', elevated ? 'glass-panel--elevated' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})
