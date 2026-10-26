import React, { useEffect, useId, useRef, useState } from 'react'
import type { LessonTerm } from '../../data/types'

export interface DefinitionTermProps {
  id: string
  term: string
  definition: string
}

/**
 * Definition Tooltip (4.5).
 * Accessible button popover with aria-describedby, keyboard toggling, and Esc dismissal.
 */
export function DefinitionTerm({ term, definition }: DefinitionTermProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <span className="definition-term">
      <button
        ref={triggerRef}
        type="button"
        className="definition-term__trigger"
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {term}
      </button>
      {isOpen && (
        <span
          ref={popoverRef}
          id={tooltipId}
          role="tooltip"
          className="definition-term__popover"
        >
          <strong className="definition-term__title">{term}</strong>
          <span className="definition-term__body">{definition}</span>
        </span>
      )}
    </span>
  )
}

/**
 * Safely parses `{{term:termId}}` markers in authored lesson prose without HTML injection.
 */
export function renderTextWithTerms(
  text: string,
  terms?: Record<string, LessonTerm>
): React.ReactNode {
  if (!terms || Object.keys(terms).length === 0 || !text.includes('{{term:')) {
    return text
  }

  const parts = text.split(/(\{\{term:[a-zA-Z0-9_-]+\}\})/g)

  return parts.map((part, index) => {
    const match = part.match(/^\{\{term:([a-zA-Z0-9_-]+)\}\}$/)
    if (match) {
      const termId = match[1]
      const termObj = terms[termId]
      if (termObj) {
        return (
          <DefinitionTerm
            key={`term-${termId}-${index}`}
            id={termId}
            term={termObj.term}
            definition={termObj.definition}
          />
        )
      }
    }
    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}
