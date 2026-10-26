import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../../pages/Home'
import Progress from '../../pages/Progress'
import { AppStateProvider } from '../../state/AppState'
import { ToastProvider } from '../../components/Toast'
import { createDefaultState, saveState } from '../../lib/storage'
import { registerTrack, clearTracks } from '../../core/content/registry'
import { htmlTrack } from '../../tracks/html/track'
import type { CodeOrbitState } from '../../state/types'

describe('Dashboard Integration (Stage 12: Catalog 3.1–3.6, 15.3, REF-08)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    clearTracks()
    registerTrack(htmlTrack)
  })

  it('first-run dashboard shows no streak figure, no feed, and no fabricated numbers', () => {
    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Home />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Heading: honest first-run copy
    expect(screen.getByRole('heading', { level: 1, name: /learn html by exploring it/i })).toBeInTheDocument()

    // 3.1 Hero Ring: shows real 0 metrics without fabrication
    expect(screen.getByText(/0 of 12 topics complete/i)).toBeInTheDocument()
    expect(screen.getByText(/0 of 36 learning steps done/i)).toBeInTheDocument()

    // 3.2 Streak Calendar: shows "No activity recorded yet", zero streak figures
    expect(screen.getByText(/no activity recorded yet/i)).toBeInTheDocument()
    expect(screen.queryByText(/-day streak/i)).not.toBeInTheDocument()

    // 3.5 Activity Feed: completely hidden when empty
    expect(screen.queryByText(/activity feed/i)).not.toBeInTheDocument()

    // 3.3 Topic Group Cards: rendered for groups at 0%
    expect(screen.getByText('HTML Foundations')).toBeInTheDocument()
    expect(screen.getByText('Text and Content')).toBeInTheDocument()
    expect(screen.getByText('Links and Navigation')).toBeInTheDocument()
    expect(screen.getAllByText(/0% complete/i).length).toBeGreaterThan(0)

    // 3.4 Daily Challenge Card: present with honest device wording
    expect(screen.getByText('Daily challenge')).toBeInTheDocument()
    expect(screen.getByText(/picked from this device/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start challenge/i })).toBeInTheDocument()

    // 3.6 Quick Actions: present and keyboard-accessible
    expect(screen.getByRole('toolbar', { name: /quick actions/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start track/i })).toHaveAttribute('href', '/learn/html')
  })

  it('returning dashboard shows Welcome back, Resume, real Hero metrics, and Activity feed', () => {
    const s: CodeOrbitState = {
      ...createDefaultState(),
      topics: {
        'html-structure': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
      },
      lastVisited: { topicId: 'elements-attributes', activity: 'lesson', at: 1700000000000 },
      activityDays: ['2026-10-26'],
      activity: [
        {
          id: 'ev-1',
          type: 'lesson-complete',
          topicId: 'html-structure',
          at: 1700000000000,
        },
        {
          id: 'ev-2',
          type: 'quiz-finish',
          topicId: 'html-structure',
          at: 1700000050000,
          meta: { score: 3, total: 3 },
        },
      ],
    }
    saveState(s)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Home />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Returning copy
    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument()

    // Resume button
    const resumeLink = screen.getByRole('link', { name: /resume/i })
    expect(resumeLink).toHaveAttribute('href', '/lesson/elements-attributes')

    // 3.1 Hero Ring reflects real completed steps
    expect(screen.getByText(/2 of 36 learning steps done/i)).toBeInTheDocument()

    // 3.5 Activity Feed: displays real events with sentences and timestamps
    expect(screen.getByText(/activity feed/i)).toBeInTheDocument()
    expect(screen.getByText(/completed lesson: document structure/i)).toBeInTheDocument()
    expect(screen.getByText(/completed quiz: document structure \(3\/3\)/i)).toBeInTheDocument()

    // 3.2 Streak Calendar shows active streak
    expect(screen.getByText(/1-day streak/i)).toBeInTheDocument()
  })

  it('15.3 Smart NextStepCard explains why based on prerequisites', () => {
    const s: CodeOrbitState = {
      ...createDefaultState(),
      topics: {
        'html-structure': {
          lessonComplete: true,
          quizAttempts: 1,
          quizBest: { correct: 3, total: 3 },
        },
      },
      challenges: {
        'ch-html-structure': {
          completed: true,
          completedWithoutSolution: true,
          solutionRevealed: false,
          hintsRevealed: 0,
          attempts: 1,
          history: [],
        },
      },
    }
    saveState(s)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Home />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Next step is Elements and attributes because Document structure is complete
    expect(screen.getByText('Elements and attributes')).toBeInTheDocument()
    expect(
      screen.getByText(/because document structure is complete, you are ready for elements and attributes/i)
    ).toBeInTheDocument()
  })

  it('gamification toggle off hides streak calendar on dashboard (Rule P-04)', () => {
    const s = createDefaultState()
    s.settings.gamificationEnabled = false
    s.activityDays = ['2026-10-26']
    saveState(s)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Home />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Streak calendar is hidden
    expect(screen.queryByRole('table', { name: /activity calendar/i })).not.toBeInTheDocument()
    // Daily challenge card remains visible as a learning feature
    expect(screen.getByText('Daily challenge')).toBeInTheDocument()
  })

  it('Daily card appears exactly once across Home and Progress (reference defect 11)', () => {
    // 1. Check Home
    const { unmount: unmountHome } = render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Home />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // On Home: DailyChallengeCard is mounted
    expect(screen.getByText(/Picked from this device's date/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start challenge/i })).toBeInTheDocument()
    unmountHome()

    // 2. Check Progress
    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Progress />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // On Progress: no duplicate DailyChallengeCard; only summary link to dashboard
    expect(screen.queryByText(/Picked from this device's date/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /start challenge/i })).not.toBeInTheDocument()
    expect(screen.getByText(/available on your dashboard/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toHaveAttribute('href', '/')
  })
})
