import { describe, it, expect } from 'vitest'
import { render, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Progress from '../../pages/Progress'
import Mastery from '../../pages/Mastery'
import { AppStateProvider } from '../../state/AppState'

describe('Analytics Suite Integration (Stage 15c)', () => {
  it('renders all 5 analytics sections on Progress page with correct initial empty states', () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <AppStateProvider>
          <Progress />
        </AppStateProvider>
      </MemoryRouter>
    )

    // 1. Learning Velocity Chart (empty state)
    expect(getByText('Learning Velocity (Last 14 Days)')).toBeDefined()
    expect(getByText('Complete a lesson to see your pace')).toBeDefined()

    // 2. Time Estimates vs Actual (P-07 gate)
    expect(getByText('Time Estimates vs Actual Time')).toBeDefined()
    const estimatesTable = getByRole('table', { name: /Topic time estimates vs actual measurements/i })
    expect(estimatesTable).toBeDefined()
    expect(within(estimatesTable).getAllByText(/Needs ≥ 3 sessions/i).length).toBeGreaterThan(0)

    // 3. Quiz Performance Breakdown
    expect(getByText('Quiz Performance Breakdown')).toBeDefined()
    const quizTable = getByRole('table', { name: /Quiz scores and attempt history/i })
    expect(quizTable).toBeDefined()

    // 4. Challenge Attempt Heat Table
    expect(getByText('Challenge Attempt Heat Table')).toBeDefined()
    expect(getByText('Export CSV')).toBeDefined()
    const heatTable = getByRole('table', { name: /Challenge attempt heat table/i })
    expect(heatTable).toBeDefined()

    // 5. Progress Sharing Card
    expect(getByText('Progress Sharing Card')).toBeDefined()
    expect(getByText('Download Progress Card (PNG)')).toBeDefined()
    expect(getByRole('region', { name: /Progress sharing card textual alternative/i })).toBeDefined()
  })

  it('renders estimated track remaining time and recommendations on Mastery page', () => {
    const { getByText, getByRole } = render(
      <MemoryRouter initialEntries={['/learn/html/mastery']}>
        <AppStateProvider>
          <Routes>
            <Route path="/learn/:technologyId/mastery" element={<Mastery />} />
          </Routes>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Track estimate pill
    expect(getByText(/remaining \(estimate\)/i)).toBeDefined()

    // Next recommendation banner
    const recBanner = getByRole('region', { name: /Recommended next topic/i })
    expect(recBanner).toBeDefined()
    expect(within(recBanner).getByText(/Recommended Next Step/i)).toBeDefined()
    expect(within(recBanner).getByRole('link', { name: /Document structure/i })).toBeDefined()
  })
})
