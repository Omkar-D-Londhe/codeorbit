import React from 'react'

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

/**
 * Renders shortcut keys cleanly, formatting platform-specific symbols where applicable.
 */
export function Kbd({ children, className = '', ...props }: KbdProps) {
  return (
    <kbd className={`kbd ${className}`.trim()} {...props}>
      {children}
    </kbd>
  )
}
