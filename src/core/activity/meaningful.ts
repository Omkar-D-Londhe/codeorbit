/**
 * Meaningful activity rule table (L-19, REF-03).
 *
 * Activity day and events are recorded ONLY when genuine learning effort is made:
 * - A lesson is marked COMPLETE (not un-complete)
 * - A quiz is FINISHED (submitted with a score)
 * - A challenge check is RUN (pass or fail)
 *
 * Activity is NEVER recorded for:
 * - Visiting pages or selecting topics
 * - Un-marking lessons
 * - Saving drafts or editing code without checking
 * - Adding/editing notes or bookmarks
 * - Changing settings or preferences
 * - Importing, exporting, or clearing state
 */

export const MEANINGFUL_ACTIVITY_TYPES = [
  'lesson-complete',
  'quiz-finish',
  'challenge-check',
  'review-answer'
] as const

export type MeaningfulActivityType = (typeof MEANINGFUL_ACTIVITY_TYPES)[number]

export function isMeaningfulActivity(type: string): type is MeaningfulActivityType {
  return MEANINGFUL_ACTIVITY_TYPES.includes(type as MeaningfulActivityType)
}
