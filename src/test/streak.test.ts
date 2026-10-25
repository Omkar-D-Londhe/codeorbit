import { describe, it, expect } from 'vitest'
import {
  dayKey,
  epochDay,
  addDay,
  streakInfo,
  nextStreakBest
} from '../core/gamification/streak'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()

describe('date keys and streaks (ported from reference/streak.ts)', () => {
  it('1. formats local calendar days with zero padding', () => {
    expect(dayKey(at(2026, 1, 5))).toBe('2026-01-05')
    expect(dayKey(at(2026, 12, 31, 23))).toBe('2026-12-31')
  })

  it('2. does day arithmetic by calendar, including month/year/leap boundaries', () => {
    expect(epochDay('2026-03-01') - epochDay('2026-02-28')).toBe(1)
    expect(epochDay('2024-03-01') - epochDay('2024-02-28')).toBe(2)
    expect(epochDay('2027-01-01') - epochDay('2026-12-31')).toBe(1)
    expect(epochDay('1970-01-01')).toBe(0)
  })

  it('3. addDay keeps days unique, sorted and bounded, and returns the same array when unchanged', () => {
    const a = addDay([], '2026-10-02')
    expect(addDay(a, '2026-10-02')).toBe(a)
    expect(addDay(a, '2026-10-01')).toEqual(['2026-10-01', '2026-10-02'])
    expect(addDay(['2026-01-01', '2026-01-02'], '2026-01-03', 2)).toEqual(['2026-01-02', '2026-01-03'])
  })

  it('4. has no streak with no activity', () => {
    expect(streakInfo([], '2026-10-24')).toEqual({ current: 0, longest: 0, activeToday: false })
  })

  it('5. counts consecutive days ending today', () => {
    const r = streakInfo(['2026-10-22', '2026-10-23', '2026-10-24'], '2026-10-24')
    expect(r).toMatchObject({ current: 3, longest: 3, activeToday: true })
  })

  it('6. keeps the streak alive when the last activity was yesterday', () => {
    expect(streakInfo(['2026-10-22', '2026-10-23'], '2026-10-24')).toMatchObject({ current: 2, activeToday: false })
  })

  it('7. resets the current streak after a missed day but remembers the longest', () => {
    const r = streakInfo(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-20'], '2026-10-24')
    expect(r).toMatchObject({ current: 0, longest: 4, lastActive: '2026-10-20' })
  })

  it('8. handles gaps inside history and unsorted/duplicate input', () => {
    const r = streakInfo(['2026-10-24', '2026-10-22', '2026-10-24', '2026-10-23', '2026-10-10'], '2026-10-24')
    expect(r).toMatchObject({ current: 3, longest: 3 })
  })

  it('9. counts across month and year boundaries', () => {
    expect(streakInfo(['2026-12-30', '2026-12-31', '2027-01-01'], '2027-01-01').current).toBe(3)
  })

  it('nextStreakBest preserves all-time record even if activityDays list is capped or reset', () => {
    const info = streakInfo(['2026-10-24'], '2026-10-24')
    expect(nextStreakBest(10, info)).toBe(10)
    const newBest = nextStreakBest(10, { current: 12, longest: 12, activeToday: true })
    expect(newBest).toBe(12)
  })
})
