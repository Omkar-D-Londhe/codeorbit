export type Grade = 'again' | 'hard' | 'good' | 'easy'

export interface ReviewCardSource {
  kind: 'quiz' | 'error' | 'section'
  refId: string
}

export interface ReviewCard {
  id: string
  source: ReviewCardSource
  prompt?: string
  answer?: string
  topicId?: string
  due: string /* dayKey: YYYY-MM-DD */
  intervalDays: number
  ease: number
  lapses: number
  lastGrade?: Grade
  lastAt?: number
}

/**
 * Formats a Date or timestamp to 'YYYY-MM-DD' calendar day-key.
 */
export function toDayKey(d: string | number | Date = new Date()): string {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return d
  }
  const date = typeof d === 'number' || typeof d === 'string' ? new Date(d) : d
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Adds an integer number of days to a day-key safely across Daylight Saving Time (DST) boundaries.
 * Using UTC noon avoids midnight boundary jumps on ±1 hr clock adjustments.
 */
export function addDays(dayKey: string, days: number): string {
  const parts = dayKey.split('-').map(Number)
  const y = parts[0]
  const m = parts[1]
  const d = parts[2]
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  date.setUTCDate(date.getUTCDate() + days)
  const resY = date.getUTCFullYear()
  const resM = String(date.getUTCMonth() + 1).padStart(2, '0')
  const resD = String(date.getUTCDate()).padStart(2, '0')
  return `${resY}-${resM}-${resD}`
}

/**
 * Creates a brand new review card with default scheduling parameters.
 */
export function createReviewCard(
  init: Partial<ReviewCard> & Pick<ReviewCard, 'id' | 'source'>,
  nowDayKey: string = toDayKey()
): ReviewCard {
  return {
    prompt: init.prompt,
    answer: init.answer,
    topicId: init.topicId,
    due: init.due || nowDayKey,
    intervalDays: init.intervalDays ?? 0,
    ease: init.ease ?? 2.5,
    lapses: init.lapses ?? 0,
    ...init,
  }
}

/**
 * Schedules the next interval and due date for a review card based on SM-2 spaced repetition principles.
 * Documented intervals sequence: 1, 3, 7, 16... days on consecutive Good grades.
 */
export function schedule(
  card: ReviewCard,
  grade: Grade,
  now: string | number | Date = new Date()
): ReviewCard {
  const nowDayKey = toDayKey(now)
  const { intervalDays } = card
  let { ease, lapses } = card
  ease = ease || 2.5
  lapses = lapses || 0

  let nextInterval = 1

  switch (grade) {
    case 'again':
      lapses += 1
      nextInterval = 1
      ease = Math.max(1.3, Number((ease - 0.2).toFixed(2)))
      break

    case 'hard':
      ease = Math.max(1.3, Number((ease - 0.15).toFixed(2)))
      if (intervalDays <= 1) {
        nextInterval = 2
      } else if (intervalDays === 3) {
        nextInterval = 5
      } else if (intervalDays === 7) {
        nextInterval = 10
      } else {
        nextInterval = Math.max(intervalDays + 1, Math.round(intervalDays * 1.2))
      }
      break

    case 'good':
      if (intervalDays === 0) {
        nextInterval = 1
      } else if (intervalDays === 1) {
        nextInterval = 3
      } else if (intervalDays === 3) {
        nextInterval = 7
      } else if (intervalDays === 7) {
        nextInterval = 16
      } else {
        nextInterval = Math.round(intervalDays * ease)
      }
      break

    case 'easy':
      ease = Math.min(3.0, Number((ease + 0.15).toFixed(2)))
      if (intervalDays === 0) {
        nextInterval = 3
      } else if (intervalDays === 1) {
        nextInterval = 7
      } else if (intervalDays === 3) {
        nextInterval = 16
      } else {
        nextInterval = Math.round(intervalDays * ease * 1.3)
      }
      break
  }

  const nextDue = addDays(nowDayKey, nextInterval)

  return {
    ...card,
    due: nextDue,
    intervalDays: nextInterval,
    ease,
    lapses,
    lastGrade: grade,
    lastAt: typeof now === 'number' ? now : Date.now(),
  }
}

/**
 * Returns all cards due on or before `nowDayKey`, ordered by urgency:
 * overdue first, then by lapse count (descending) and interval (ascending).
 */
export function dueCards(
  cards: ReviewCard[] | Record<string, ReviewCard>,
  now: string | number | Date = new Date()
): ReviewCard[] {
  const list = Array.isArray(cards) ? cards : Object.values(cards)
  const today = toDayKey(now)

  return list
    .filter((c) => c && typeof c.due === 'string' && c.due <= today)
    .sort((a, b) => {
      // 1. Overdue cards first
      if (a.due !== b.due) {
        return a.due.localeCompare(b.due)
      }
      // 2. Higher lapses first
      if (b.lapses !== a.lapses) {
        return b.lapses - a.lapses
      }
      // 3. Shorter interval first
      if (a.intervalDays !== b.intervalDays) {
        return a.intervalDays - b.intervalDays
      }
      return a.id.localeCompare(b.id)
    })
}

/**
 * Finds the nearest upcoming due date for cards due in the future.
 */
export function nextDueDate(
  cards: ReviewCard[] | Record<string, ReviewCard>,
  now: string | number | Date = new Date()
): string | null {
  const list = Array.isArray(cards) ? cards : Object.values(cards)
  const today = toDayKey(now)
  const future = list
    .filter((c) => c && typeof c.due === 'string' && c.due > today)
    .map((c) => c.due)
    .sort()

  return future.length > 0 ? future[0] : null
}
