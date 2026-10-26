import type { Lesson } from '../data/types'

/**
 * Calculates estimated reading minutes based on word count (200 words per minute)
 * plus a 1-minute allowance per interactive demo (4.6).
 * Rounded up to the nearest minute, minimum 1 minute.
 */
export function calculateReadingMinutes(text: string, demoCount = 0): number {
  const words = (text.trim().match(/\S+/g) || []).length
  const readingMinutes = words / 200
  const demoMinutes = demoCount * 1
  return Math.max(1, Math.ceil(readingMinutes + demoMinutes))
}

/**
 * Formats reading minutes with truthful estimate labelling (4.6, L-05).
 */
export function formatEstimatedTime(minutes: number): string {
  return `about ${minutes} min (estimate)`
}

/**
 * Estimates reading time for a full Lesson, respecting authored override if provided.
 */
export function estimateLessonReadingTime(lesson: Lesson): string {
  if (lesson.estimatedMinutes && lesson.estimatedMinutes > 0) {
    return formatEstimatedTime(lesson.estimatedMinutes)
  }

  let corpus = lesson.objective + ' '

  for (const s of lesson.sections) {
    corpus += s.heading + ' '
    corpus += s.body.join(' ') + ' '
    if (s.code) corpus += s.code.code + ' '
    if (s.callout) corpus += s.callout.text + ' '
  }

  if (lesson.takeaways) {
    corpus += lesson.takeaways.join(' ') + ' '
  }
  if (lesson.a11yNotes) {
    corpus += lesson.a11yNotes.join(' ') + ' '
  }

  const demoCount = lesson.demos?.length ?? 0
  const minutes = calculateReadingMinutes(corpus, demoCount)
  return formatEstimatedTime(minutes)
}
