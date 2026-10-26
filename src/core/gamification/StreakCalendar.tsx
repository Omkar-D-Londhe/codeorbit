import { Card } from '../ui/Card'
import { streakInfo } from './streak'

export interface StreakCalendarProps {
  days: readonly string[]
  today: string
  weeks?: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * 3.2 Streak Calendar: Accessible 12-week activity grid.
 * Renders a semantic table with caption, weekday headers, and exact active days.
 * Hides streak figures and shows "No activity recorded yet" when days list is empty.
 */
export function StreakCalendar({ days, today, weeks = 12 }: StreakCalendarProps) {
  const hasActivity = days && days.length > 0
  const streak = hasActivity ? streakInfo(days, today) : null
  const activeSet = new Set(days || [])

  // Parse today in UTC to avoid timezone shifts
  const [ty, tm, td] = today.split('-').map(Number)
  const todayDate = new Date(Date.UTC(ty, tm - 1, td))

  // Align grid to weeks ending on Sunday of current week
  const dayOfWeek = (todayDate.getUTCDay() + 6) % 7 // 0 = Mon, 6 = Sun
  const daysUntilEndOfWeek = 6 - dayOfWeek
  const endMs = todayDate.getTime() + daysUntilEndOfWeek * 86_400_000
  const totalDays = weeks * 7 // Max 84 cells
  const startMs = endMs - (totalDays - 1) * 86_400_000

  // Build 12 columns of 7 days each
  const gridWeeks: Array<Array<{ key: string; dayNum: number; monthIndex: number; isActive: boolean; isFuture: boolean }>> = []
  const monthLabels: Array<{ name: string; colSpan: number }> = []

  let currentMonth = -1
  let currentMonthSpan = 0

  for (let w = 0; w < weeks; w++) {
    const weekDays: Array<{ key: string; dayNum: number; monthIndex: number; isActive: boolean; isFuture: boolean }> = []
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d
      const cellDate = new Date(startMs + idx * 86_400_000)
      const y = cellDate.getUTCFullYear()
      const m = cellDate.getUTCMonth()
      const dt = cellDate.getUTCDate()
      const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(dt).padStart(2, '0')}`
      const isFuture = cellDate.getTime() > todayDate.getTime()
      const isActive = activeSet.has(key)

      weekDays.push({ key, dayNum: dt, monthIndex: m, isActive, isFuture })

      // Track month transitions on first day of each week for header
      if (d === 0) {
        if (m !== currentMonth) {
          if (currentMonth !== -1) {
            monthLabels.push({ name: SHORT_MONTH_NAMES[currentMonth], colSpan: currentMonthSpan })
          }
          currentMonth = m
          currentMonthSpan = 1
        } else {
          currentMonthSpan++
        }
      }
    }
    gridWeeks.push(weekDays)
  }
  if (currentMonthSpan > 0) {
    monthLabels.push({ name: SHORT_MONTH_NAMES[currentMonth], colSpan: currentMonthSpan })
  }

  return (
    <Card className="streak-calendar-card" eyebrow="Activity" title="Learning streak">
      <div className="streak-calendar-body">
        {hasActivity && streak ? (
          <div className="streak-headline">
            <h3 className="streak-title">
              {streak.current > 0 ? `${streak.current}-day streak` : 'No active streak'}
            </h3>
            <p className="muted small">
              {streak.current > 0
                ? `${streak.activeToday ? 'You were active today.' : 'Keep it going today.'} Longest: ${streak.longest} ${streak.longest === 1 ? 'day' : 'days'}.`
                : `Last active ${streak.lastActive || 'previously'}. Complete an activity today to start a new streak.`}
            </p>
          </div>
        ) : (
          <div className="streak-headline">
            <p className="muted small streak-empty-msg">
              No activity recorded yet. Complete a lesson, finish a quiz or run a check to start a streak.
            </p>
          </div>
        )}

        <div className="streak-table-wrapper">
          <table className="streak-table" role="table" aria-label="Activity calendar for the last 12 weeks">
            <caption className="sr-only">Activity calendar for the last 12 weeks</caption>
            <thead>
              <tr className="streak-month-row">
                <th scope="col" className="streak-th-corner" aria-hidden="true" />
                {monthLabels.map((ml, idx) => (
                  <th key={idx} scope="col" colSpan={ml.colSpan} className="streak-month-th">
                    {ml.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKDAY_NAMES.map((weekdayName, dayIdx) => (
                <tr key={weekdayName} className="streak-row">
                  <th scope="row" className="streak-weekday-th">
                    <span aria-hidden="true">{dayIdx % 2 === 0 ? weekdayName[0] : ''}</span>
                    <span className="sr-only">{weekdayName}</span>
                  </th>
                  {gridWeeks.map((week, weekIdx) => {
                    const day = week[dayIdx]
                    const statusText = day.isActive ? 'active' : 'no activity'
                    const label = `${day.dayNum} ${MONTH_NAMES[day.monthIndex]}: ${statusText}`

                    return (
                      <td
                        key={weekIdx}
                        className={`streak-cell ${day.isActive ? 'streak-cell--active' : 'streak-cell--inactive'}${day.isFuture ? ' streak-cell--future' : ''}`}
                        aria-label={label}
                      >
                        <span className="streak-cell__shape" aria-hidden="true" />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="streak-legend" aria-hidden="true">
            <span className="muted small">No activity</span>
            <span className="streak-legend-swatch streak-legend-swatch--inactive" />
            <span className="streak-legend-swatch streak-legend-swatch--active" />
            <span className="muted small">Active day</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
