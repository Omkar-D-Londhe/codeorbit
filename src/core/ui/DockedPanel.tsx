import React, { forwardRef, useEffect, useRef } from 'react'

export interface DockedPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
}

export const DockedPanel = forwardRef<HTMLDivElement, DockedPanelProps>(function DockedPanel(
  {
    open = true,
    className = '',
    children,
    ...props
  },
  ref
) {
  if (!open) return null

  return (
    <div
      ref={ref}
      className={`docked-panel ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
})

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Drawer({ open, onClose, title, children, className = '' }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="drawer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`drawer-content ${className}`.trim()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-4)' }}>
          <h2 style={{ fontSize: 'var(--fs-title)', margin: 0 }}>{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
