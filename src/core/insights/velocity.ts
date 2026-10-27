import type { CodeOrbitState } from '../../state/types'
import { dayKey } from '../gamification/streak'

export const VELOCITY_EMPTY_MESSAGE = 'Complete a lesson to see your pace'
export const VELOCITY_WINDOW_DAYS = 14

export interface VelocityDayPoint {
  date: string // YYYY-MM-DD
  label: string // Short label e.g. "Oct 27"
  count: number // Activity events count on that day
}

export interface VelocityData {
  hasActivity: boolean
  points: VelocityDayPoint[]
  totalEvents: number
  averagePerDay: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatShortDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

/**
 * Derives learning velocity data over the specified period (Catalog 12.1).
 * Empty state: returns hasActivity=false when zero activity exists (spec §10).
 */
export function calculateVelocity(
  state: CodeOrbitState,
  windowDays = VELOCITY_WINDOW_DAYS,
  nowMs = Date.now()
): VelocityData {
  const activityList = state.activity || []
  const hasActivity = activityList.length > 0 || (state.activityDays && state.activityDays.length > 0)

  if (!hasActivity) {
    return {
      hasActivity: false,
      points: [],
      totalEvents: 0,
      averagePerDay: 0,
    }
  }

  // Count events per day key
  const countsByDay: Record<string, number> = {}
  for (const evt of activityList) {
    if (typeof evt.at === 'number' && Number.isFinite(evt.at)) {
      const k = dayKey(evt.at)
      countsByDay[k] = (countsByDay[k] || 0) + 1
    }
  }

  // Generate date points for the last windowDays ending today
  const points: VelocityDayPoint[] = []
  let totalEventsInWindow = 0

  for (let i = windowDays - 1; i >= 0; i--) {
    const targetMs = nowMs - i * 86_400_000
    const targetDate = new Date(targetMs)
    const k = dayKey(targetMs)
    const count = countsByDay[k] || 0
    totalEventsInWindow += count

    points.push({
      date: k,
      label: formatShortDate(targetDate),
      count,
    })
  }

  const averagePerDay = Math.round((totalEventsInWindow / windowDays) * 10) / 10

  return {
    hasActivity: true,
    points,
    totalEvents: totalEventsInWindow,
    averagePerDay,
  }
}
