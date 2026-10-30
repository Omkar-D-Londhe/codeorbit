import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { registerTracks } from '../app/registerTracks'
import { clearTracks, unregisterTrack } from '../core/content/registry'
import Explore from '../pages/Explore'
import Home from '../pages/Home'
import Track from '../pages/Track'
import { AppStateProvider } from '../state/AppState'

describe('Empty track registry handling', () => {
  beforeEach(() => {
    registerTracks()
  })

  afterEach(() => {
    registerTracks()
  })

  it('renders EmptyState on Home when available tracks are unregistered without crashing', () => {
    unregisterTrack('html')
    unregisterTrack('css')
    unregisterTrack('javascript')
    unregisterTrack('bootstrap')
    unregisterTrack('python')
    unregisterTrack('java')
    unregisterTrack('cpp')
    unregisterTrack('angular')

    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={['/']}>
          <Home />
        </MemoryRouter>
      </AppStateProvider>,
    )

    const emptyHeading = screen.getByRole('heading', { name: 'No learning tracks are available yet' })
    expect(emptyHeading).toBeInTheDocument()

    // Has no action buttons in the empty state
    const emptyStateContainer = emptyHeading.closest('.empty')
    expect(emptyStateContainer).not.toBeNull()
    const buttons = emptyStateContainer?.querySelectorAll('button, a')
    expect(buttons?.length ?? 0).toBe(0)
  })

  it('renders EmptyState on Explore when all tracks are cleared without crashing', () => {
    clearTracks()

    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={['/explore']}>
          <Explore />
        </MemoryRouter>
      </AppStateProvider>,
    )

    const emptyHeading = screen.getByRole('heading', { name: 'No learning tracks are available yet' })
    expect(emptyHeading).toBeInTheDocument()

    const emptyStateContainer = emptyHeading.closest('.empty')
    expect(emptyStateContainer).not.toBeNull()
    const buttons = emptyStateContainer?.querySelectorAll('button, a')
    expect(buttons?.length ?? 0).toBe(0)
  })

  it('redirects unknown :technologyId to /explore on Track page', () => {
    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={['/learn/unknown-tech']}>
          <Routes>
            <Route path="/learn/:technologyId" element={<Track />} />
            <Route path="/explore" element={<div data-testid="explore-page">Explore Page</div>} />
          </Routes>
        </MemoryRouter>
      </AppStateProvider>,
    )

    expect(screen.getByTestId('explore-page')).toBeInTheDocument()
  })
})
