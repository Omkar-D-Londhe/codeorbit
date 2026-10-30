import type { ReactNode } from 'react'
import { formatComplexityAriaLabel, splitComplexityForDisplay } from './complexityOrder'

export interface ComplexityDisplayProps {
  value?: string | null
  className?: string
}

/**
 * Renders Big-O complexity classes with <sup> tags (e.g. O(n<sup>2</sup>))
 * and spoken aria-label attributes (e.g. aria-label="O of n squared").
 * Directly satisfies Stage 20 Acceptance Criteria §13.
 */
export function ComplexityDisplay({ value, className }: ComplexityDisplayProps): ReactNode {
  const parts = splitComplexityForDisplay(value)
  const ariaLabel = formatComplexityAriaLabel(value)

  if (parts.sup) {
    return (
      <span className={className} aria-label={ariaLabel}>
        {parts.prefix}
        <sup>{parts.sup}</sup>
        {parts.suffix}
      </span>
    )
  }

  return (
    <span className={className} aria-label={ariaLabel}>
      {parts.prefix}
    </span>
  )
}
