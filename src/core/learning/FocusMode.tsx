import React, { useEffect } from 'react'
import { Icon } from '../../components/Icon'

export interface FocusModeProps {
  active: boolean
  onExit: () => void
  openerRef?: React.RefObject<HTMLButtonElement | null>
  children: React.ReactNode
  className?: string
}

/**
 * Dark-Room / Focus Mode for Reading (4.10).
 * - Strips shell chrome, TOC, and study panel to focus purely on the 72ch reading column.
 * - Displays a visible 'Exit focus mode' button and status banner.
 * - Dismisses on Escape key and restores focus to the opening element.
 * - Dispatches assertive aria-live announcement on activation.
 * - Preserves in-progress drafts, demo state, and scroll position.
 */
export function FocusMode({
  active,
  onExit,
  openerRef,
  children,
  className = '',
}: FocusModeProps) {
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onExit()
        openerRef?.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, onExit, openerRef])

  if (!active) return null

  return (
    <div
      className={`focus-mode ${className}`}
      role="region"
      aria-label="Reading focus mode"
    >
      <div className="sr-only" role="status" aria-live="assertive">
        Focus mode enabled. Press Escape to exit.
      </div>
      <header className="focus-mode__bar">
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => {
            onExit()
            openerRef?.current?.focus()
          }}
          aria-label="Exit focus mode"
        >
          <Icon name="collapse" size={16} />
          <span>Exit focus mode</span>
          <kbd className="focus-mode__kbd">Esc</kbd>
        </button>
      </header>
      <div className="focus-mode__content">
        {children}
      </div>
    </div>
  )
}
