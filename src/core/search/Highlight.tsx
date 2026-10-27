import React from 'react'

export interface HighlightProps {
  text: string
  ranges?: Array<[number, number]>
  className?: string
}

/**
 * Renders text with matched fuzzy ranges highlighted via semantic <mark> tags (FC-02).
 */
export function Highlight({ text, ranges = [], className = '' }: HighlightProps) {
  if (!ranges || ranges.length === 0) {
    return <span className={className}>{text}</span>
  }

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  ranges.forEach(([start, end], idx) => {
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start))
    }
    parts.push(
      <mark key={idx} className="search-highlight">
        {text.slice(start, end)}
      </mark>
    )
    lastIndex = end
  })

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <span className={className}>{parts}</span>
}
