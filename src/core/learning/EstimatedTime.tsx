import { Icon } from '../../components/Icon'
import { estimateLessonReadingTime } from '../../lib/readingTime'
import type { Lesson } from '../../data/types'

export interface EstimatedTimeProps {
  lesson: Lesson
  className?: string
}

/**
 * Lesson Estimated Time Display (4.6).
 * Renders an accessible reading time estimate indicator.
 */
export function EstimatedTime({ lesson, className = '' }: EstimatedTimeProps) {
  const estimate = estimateLessonReadingTime(lesson)

  return (
    <div
      className={`estimated-time ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: 'var(--fs-meta, 12px)',
        color: 'var(--c-text-muted, #c4c1d4)',
      }}
      aria-label={`Reading time: ${estimate}`}
    >
      <Icon name="clock" size={14} />
      <span>{estimate}</span>
    </div>
  )
}
