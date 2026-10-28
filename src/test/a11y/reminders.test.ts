import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isReminderDue,
  getLocalDateKey,
  REMINDER_BANNER_MESSAGE,
  REMINDER_LIMITATION_NOTE,
  getLastReminderShown,
  setLastReminderShown,
  LAST_REMINDER_SHOWN_STORAGE_KEY,
} from '../../core/reminders/reminders'
import type { ReminderSettings } from '../../state/types'

describe('Local Reminder System (Catalog 14.3, Decision C-10)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('declares truthful limitation note without background push claims', () => {
    expect(REMINDER_BANNER_MESSAGE).toBe('Time for your daily practice')
    expect(REMINDER_LIMITATION_NOTE).toContain('Reminders appear while CodeOrbit is open.')
  })

  it('returns false when reminders are disabled or undefined', () => {
    const now = new Date(2026, 9, 27, 10, 0, 0).getTime() // Tuesday 10:00
    expect(isReminderDue(undefined, now, null)).toBe(false)
    expect(isReminderDue({ enabled: false, time: '09:00', days: [1, 2, 3, 4, 5] }, now, null)).toBe(false)
  })

  it('returns false when the current day is not in scheduled days', () => {
    // 2026-10-25 was a Sunday (day 0)
    const sundayDate = new Date(2026, 9, 25, 10, 0, 0).getTime()
    const settings: ReminderSettings = {
      enabled: true,
      time: '09:00',
      days: [1, 2, 3, 4, 5], // Monday - Friday only
    }
    expect(isReminderDue(settings, sundayDate, null)).toBe(false)
  })

  it('returns false when already shown on the current local day', () => {
    // 2026-10-27 is Tuesday (day 2)
    const tuesdayDate = new Date(2026, 9, 27, 10, 0, 0)
    const now = tuesdayDate.getTime()
    const todayKey = getLocalDateKey(tuesdayDate)
    const settings: ReminderSettings = {
      enabled: true,
      time: '09:00',
      days: [1, 2, 3, 4, 5],
    }

    // Already shown today
    expect(isReminderDue(settings, now, todayKey)).toBe(false)
    // Shown yesterday or another date
    expect(isReminderDue(settings, now, '2026-10-26')).toBe(true)
  })

  it('returns false before the scheduled time and true on or after the scheduled time', () => {
    const settings: ReminderSettings = {
      enabled: true,
      time: '09:30',
      days: [1, 2, 3, 4, 5],
    }

    // Tuesday at 09:15 (before scheduled 09:30)
    const beforeTime = new Date(2026, 9, 27, 9, 15, 0).getTime()
    expect(isReminderDue(settings, beforeTime, null)).toBe(false)

    // Tuesday at 09:30 (exact scheduled time)
    const exactTime = new Date(2026, 9, 27, 9, 30, 0).getTime()
    expect(isReminderDue(settings, exactTime, null)).toBe(true)

    // Tuesday at 14:00 (after scheduled time)
    const afterTime = new Date(2026, 9, 27, 14, 0, 0).getTime()
    expect(isReminderDue(settings, afterTime, null)).toBe(true)
  })

  it('evaluates local time and date keys properly', () => {
    const testDate = new Date(2026, 0, 5, 8, 30, 0) // 2026-01-05
    expect(getLocalDateKey(testDate)).toBe('2026-01-05')
  })

  it('reads and writes last shown date to localStorage', () => {
    expect(getLastReminderShown()).toBeNull()
    setLastReminderShown('2026-10-27')
    expect(localStorage.getItem(LAST_REMINDER_SHOWN_STORAGE_KEY)).toBe('2026-10-27')
    expect(getLastReminderShown()).toBe('2026-10-27')
  })
})
