import { describe, it, expect } from 'vitest'
import {
  toDayKey,
  addDays,
  schedule,
  dueCards,
  createReviewCard,
  type ReviewCard,
} from '../core/learning/spaced'

describe('Stage 18a: Spaced Repetition Scheduler (spaced.ts)', () => {
  describe('1. Day-Key Calculations & DST Safety', () => {
    it('formats dates consistently to YYYY-MM-DD day keys', () => {
      const d = new Date(2026, 9, 28) // Oct 28 2026
      expect(toDayKey(d)).toBe('2026-10-28')
    })

    it('adds days accurately across month and leap-year boundaries', () => {
      expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
      expect(addDays('2026-10-28', 7)).toBe('2026-11-04')
      expect(addDays('2026-10-28', 16)).toBe('2026-11-13')
    })

    it('remains resilient across Daylight Saving Time (DST) transitions', () => {
      // Spring forward transition (e.g. late March)
      const springKey = '2026-03-28'
      expect(addDays(springKey, 1)).toBe('2026-03-29')
      expect(addDays(springKey, 2)).toBe('2026-03-30')
      expect(addDays(springKey, 7)).toBe('2026-04-04')

      // Fall back transition (e.g. late October)
      const autumnKey = '2026-10-24'
      expect(addDays(autumnKey, 1)).toBe('2026-10-25')
      expect(addDays(autumnKey, 2)).toBe('2026-10-26')
      expect(addDays(autumnKey, 7)).toBe('2026-10-31')
      expect(addDays(autumnKey, 16)).toBe('2026-11-09')
    })
  })

  describe('2. Documented Intervals Progression (1, 3, 7, 16... days)', () => {
    it('schedules initial card at 1 day on first Good grade', () => {
      const card = createReviewCard({
        id: 'card-1',
        source: { kind: 'quiz', refId: 'q-1' },
      })
      expect(card.intervalDays).toBe(0)
      expect(card.lapses).toBe(0)

      const s1 = schedule(card, 'good', '2026-10-28')
      expect(s1.intervalDays).toBe(1)
      expect(s1.due).toBe('2026-10-29')
      expect(s1.lastGrade).toBe('good')
    })

    it('advances through documented progression 1 -> 3 -> 7 -> 16 days on consecutive Good grades', () => {
      const card = createReviewCard({
        id: 'card-progression',
        source: { kind: 'error', refId: 'err-1' },
      })

      // Step 1: Good -> 1 day
      const s1 = schedule(card, 'good', '2026-10-28')
      expect(s1.intervalDays).toBe(1)
      expect(s1.due).toBe('2026-10-29')

      // Step 2: Good -> 3 days
      const s2 = schedule(s1, 'good', '2026-10-29')
      expect(s2.intervalDays).toBe(3)
      expect(s2.due).toBe('2026-11-01')

      // Step 3: Good -> 7 days
      const s3 = schedule(s2, 'good', '2026-11-01')
      expect(s3.intervalDays).toBe(7)
      expect(s3.due).toBe('2026-11-08')

      // Step 4: Good -> 16 days
      const s4 = schedule(s3, 'good', '2026-11-08')
      expect(s4.intervalDays).toBe(16)
      expect(s4.due).toBe('2026-11-24')

      // Step 5: Multiplied by ease factor (default 2.5 -> 16 * 2.5 = 40 days)
      const s5 = schedule(s4, 'good', '2026-11-24')
      expect(s5.intervalDays).toBe(40)
      expect(s5.due).toBe('2027-01-03')
    })
  })

  describe('3. Lapse / Reset Behavior on Again', () => {
    it('resets interval to 1 day, increments lapses, and decreases ease on Again grade', () => {
      const matureCard: ReviewCard = {
        id: 'mature-1',
        source: { kind: 'quiz', refId: 'q-mature' },
        due: '2026-10-28',
        intervalDays: 16,
        ease: 2.5,
        lapses: 0,
      }

      const lapsed = schedule(matureCard, 'again', '2026-10-28')
      expect(lapsed.intervalDays).toBe(1)
      expect(lapsed.due).toBe('2026-10-29')
      expect(lapsed.lapses).toBe(1)
      expect(lapsed.ease).toBeLessThan(2.5)
      expect(lapsed.lastGrade).toBe('again')
    })

    it('enforces minimum ease factor floor of 1.30 after repeated lapses', () => {
      let card: ReviewCard = {
        id: 'struggling-card',
        source: { kind: 'error', refId: 'e-1' },
        due: '2026-10-28',
        intervalDays: 7,
        ease: 1.4,
        lapses: 3,
      }

      // Repeated again grades
      card = schedule(card, 'again', '2026-10-28')
      expect(card.ease).toBe(1.3)
      card = schedule(card, 'again', '2026-10-29')
      expect(card.ease).toBe(1.3) // Clamped at 1.3
    })
  })

  describe('4. Grades Differentiation (Hard, Good, Easy)', () => {
    it('Hard grade produces conservative intervals and reduces ease', () => {
      const card: ReviewCard = {
        id: 'card-hard',
        source: { kind: 'section', refId: 'html-structure#head' },
        due: '2026-10-28',
        intervalDays: 3,
        ease: 2.5,
        lapses: 0,
      }

      const hardResult = schedule(card, 'hard', '2026-10-28')
      expect(hardResult.intervalDays).toBe(5) // Less than 7 (Good)
      expect(hardResult.ease).toBe(2.35)
      expect(hardResult.lastGrade).toBe('hard')
    })

    it('Easy grade grants bonus interval and increases ease', () => {
      const card: ReviewCard = {
        id: 'card-easy',
        source: { kind: 'quiz', refId: 'q-easy' },
        due: '2026-10-28',
        intervalDays: 1,
        ease: 2.5,
        lapses: 0,
      }

      const easyResult = schedule(card, 'easy', '2026-10-28')
      expect(easyResult.intervalDays).toBe(7) // Skips 3 days straight to 7
      expect(easyResult.ease).toBe(2.65)
      expect(easyResult.lastGrade).toBe('easy')
    })
  })

  describe('5. Due Cards Query & Ordering', () => {
    const today = '2026-10-28'
    const cards: ReviewCard[] = [
      { id: 'future-1', source: { kind: 'quiz', refId: 'q1' }, due: '2026-10-30', intervalDays: 3, ease: 2.5, lapses: 0 },
      { id: 'due-today-1', source: { kind: 'quiz', refId: 'q2' }, due: '2026-10-28', intervalDays: 7, ease: 2.5, lapses: 0 },
      { id: 'overdue-1', source: { kind: 'error', refId: 'e1' }, due: '2026-10-26', intervalDays: 1, ease: 2.5, lapses: 1 },
      { id: 'due-today-lapsed', source: { kind: 'quiz', refId: 'q3' }, due: '2026-10-28', intervalDays: 1, ease: 2.1, lapses: 2 },
    ]

    it('filters out cards that are not yet due', () => {
      const result = dueCards(cards, today)
      expect(result.map((c) => c.id)).not.toContain('future-1')
      expect(result.length).toBe(3)
    })

    it('sorts overdue cards first, then by urgency (lapses & interval)', () => {
      const result = dueCards(cards, today)
      // overdue-1 is from 2026-10-26 (most overdue)
      expect(result[0].id).toBe('overdue-1')
      // due-today-lapsed has higher lapses than due-today-1
      expect(result[1].id).toBe('due-today-lapsed')
      expect(result[2].id).toBe('due-today-1')
    })

    it('returns empty array when no cards are due or list is empty', () => {
      expect(dueCards([], today)).toEqual([])
      expect(dueCards([{ id: 'far', source: { kind: 'quiz', refId: 'q' }, due: '2027-01-01', intervalDays: 30, ease: 2.5, lapses: 0 }], today)).toEqual([])
    })
  })
})
