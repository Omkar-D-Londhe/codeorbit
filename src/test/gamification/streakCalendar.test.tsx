import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakCalendar } from '../../core/gamification/StreakCalendar'

describe('StreakCalendar Component (Catalog 3.2, REF-08)', () => {
  const today = '2026-10-26'

  it('renders semantic table with caption, weekday headers, and 84 cells max', () => {
    const { container } = render(<StreakCalendar days={['2026-10-26']} today={today} weeks={12} />)

    // Semantic table and caption
    const table = screen.getByRole('table', { name: /activity calendar/i })
    expect(table).toBeInTheDocument()
    expect(screen.getByText(/activity calendar for the last 12 weeks/i)).toBeInTheDocument()

    // Weekday headers (Mon, Wed, Fri etc)
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()

    // Total cells: exactly 84 cells (12 weeks * 7 days)
    const cells = container.querySelectorAll('.streak-cell')
    expect(cells).toHaveLength(84)

    // Legend
    expect(screen.getByText(/no activity/i)).toBeInTheDocument()
    expect(screen.getByText(/active day/i)).toBeInTheDocument()
  })

  it('calendar active days equal activityDays exactly', () => {
    const activityDays = ['2026-10-24', '2026-10-26']
    const { container } = render(<StreakCalendar days={activityDays} today={today} weeks={12} />)

    const activeCells = container.querySelectorAll('.streak-cell--active')
    expect(activeCells).toHaveLength(2)

    // Cell for 26 October
    const todayCell = screen.getByLabelText(/26 October: active/i)
    expect(todayCell).toBeInTheDocument()
    expect(todayCell).toHaveClass('streak-cell--active')

    // Cell for 24 October
    const prevCell = screen.getByLabelText(/24 October: active/i)
    expect(prevCell).toBeInTheDocument()
    expect(prevCell).toHaveClass('streak-cell--active')

    // Inactive cell on 25 October
    const inactiveCell = screen.getByLabelText(/25 October: no activity/i)
    expect(inactiveCell).toBeInTheDocument()
    expect(inactiveCell).toHaveClass('streak-cell--inactive')
  })

  it('hides streak figures and shows honest empty message when activityDays is empty', () => {
    const { container } = render(<StreakCalendar days={[]} today={today} weeks={12} />)

    // Honest empty message
    expect(screen.getByText(/no activity recorded yet/i)).toBeInTheDocument()

    // No fabricated streak number
    expect(screen.queryByText(/0-day streak/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/streak: 0/i)).not.toBeInTheDocument()

    // All cells inactive
    const activeCells = container.querySelectorAll('.streak-cell--active')
    expect(activeCells).toHaveLength(0)
  })
})
