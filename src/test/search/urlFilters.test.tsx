import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Track from '../../pages/Track'
import Explore from '../../pages/Explore'
import { AppStateProvider } from '../../state/AppState'

describe('URL Filter and Tag System (Catalog 9.3)', () => {
  it('restores filter state from URL query parameters on Track page', () => {
    // Mount with ?tag=forms
    render(
      <MemoryRouter initialEntries={['/learn/html?tag=forms']}>
        <AppStateProvider>
          <Routes>
            <Route path="/learn/:technologyId" element={<Track />} />
          </Routes>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Tag select should reflect 'forms'
    const tagSelect = screen.getByLabelText(/filter by tag/i) as HTMLSelectElement
    expect(tagSelect.value).toBe('forms')

    // Live announcer should reflect matched count
    const liveRegion = screen.getByTestId('orbit-filter-announcer')
    expect(liveRegion.textContent).toMatch(/\d+ topics match/)
  })

  it('updates URL filter parameters when user selects a tag or types search on Track', () => {
    render(
      <MemoryRouter initialEntries={['/learn/html']}>
        <AppStateProvider>
          <Routes>
            <Route path="/learn/:technologyId" element={<Track />} />
          </Routes>
        </AppStateProvider>
      </MemoryRouter>
    )

    const searchInput = screen.getByPlaceholderText(/filter topics by name or keyword/i)
    fireEvent.change(searchInput, { target: { value: 'headings' } })
    expect(searchInput).toHaveValue('headings')

    // Live region announces matched count
    const liveRegion = screen.getByTestId('orbit-filter-announcer')
    expect(liveRegion.textContent).toMatch(/\d+ topics match/)

    // Clear filters button appears and resets search
    const clearBtn = screen.getByRole('button', { name: /clear active filters/i })
    expect(clearBtn).toBeInTheDocument()
    fireEvent.click(clearBtn)
    expect(searchInput).toHaveValue('')
  })

  it('round-trips filters through the URL on Explore page', () => {
    render(
      <MemoryRouter initialEntries={['/explore?status=available&difficulty=beginner']}>
        <AppStateProvider>
          <Routes>
            <Route path="/explore" element={<Explore />} />
          </Routes>
        </AppStateProvider>
      </MemoryRouter>
    )

    const statusSelect = screen.getByLabelText(/filter by track status/i) as HTMLSelectElement
    expect(statusSelect.value).toBe('available')

    const diffSelect = screen.getByLabelText(/filter by challenge difficulty/i) as HTMLSelectElement
    expect(diffSelect.value).toBe('beginner')
  })
})
