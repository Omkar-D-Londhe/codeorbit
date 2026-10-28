import type { ReminderSettings } from '../../state/types'

export const REMINDER_BANNER_MESSAGE = 'Time for your daily practice'
export const REMINDER_LIMITATION_NOTE = 'Reminders appear while CodeOrbit is open.'
export const LAST_REMINDER_SHOWN_STORAGE_KEY = 'codeorbit_reminder_last_shown'

/**
 * Format local date as YYYY-MM-DD
 */
export function getLocalDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Determine if a study reminder is due to be shown.
 * - Respects user settings (enabled, days, time in HH:MM local format)
 * - Checks if not already shown today (based on local calendar date)
 * - Evaluates local time and days of week (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function isReminderDue(
  settings: ReminderSettings | undefined,
  nowMs: number,
  lastShownDate: string | null
): boolean {
  if (!settings || !settings.enabled) {
    return false
  }

  const now = new Date(nowMs)
  const todayKey = getLocalDateKey(now)

  // Already shown today
  if (lastShownDate === todayKey) {
    return false
  }

  // Day of week match (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDay = now.getDay()
  const activeDays = Array.isArray(settings.days) ? settings.days : [1, 2, 3, 4, 5]
  if (!activeDays.includes(currentDay)) {
    return false
  }

  // Time comparison (HH:MM local time)
  const timeStr =
    typeof settings.time === 'string' && /^\d{2}:\d{2}$/.test(settings.time)
      ? settings.time
      : '09:00'

  const [targetHStr, targetMStr] = timeStr.split(':')
  const targetH = parseInt(targetHStr, 10)
  const targetM = parseInt(targetMStr, 10)

  const currentH = now.getHours()
  const currentM = now.getMinutes()

  const currentMinutes = currentH * 60 + currentM
  const targetMinutes = targetH * 60 + targetM

  return currentMinutes >= targetMinutes
}

export function getLastReminderShown(): string | null {
  try {
    return localStorage.getItem(LAST_REMINDER_SHOWN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setLastReminderShown(dateKey: string): void {
  try {
    localStorage.setItem(LAST_REMINDER_SHOWN_STORAGE_KEY, dateKey)
  } catch {
    // Ignore storage failure
  }
}

/**
 * Trigger browser Notification if permitted.
 * Honest note: only works while page/worker is alive (per Decision C-10).
 */
export function notifyIfPermitted(title: string, options?: NotificationOptions): boolean {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      new Notification(title, options)
      return true
    } catch {
      return false
    }
  }
  return false
}
