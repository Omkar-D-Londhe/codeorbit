import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RouteSkeleton } from '../core/ui/Skeletons'
import App from '../App'

describe('Route-Level Code Splitting (Stage 17a, 16.1)', () => {
  beforeAll(() => {
    ;(globalThis as unknown as { __USE_REAL_LAZY__?: boolean }).__USE_REAL_LAZY__ = true
  })

  afterAll(() => {
    ;(globalThis as unknown as { __USE_REAL_LAZY__?: boolean }).__USE_REAL_LAZY__ = false
  })
  it('renders accessible RouteSkeleton with status role, aria-busy, and label', () => {
    const { container } = render(<RouteSkeleton label="Loading review page..." />)

    const statusEl = screen.getByRole('status')
    expect(statusEl).toBeDefined()
    expect(statusEl.getAttribute('aria-busy')).toBe('true')
    expect(statusEl.getAttribute('aria-label')).toBe('Loading review page...')
    expect(screen.getByText('Loading review page...')).toBeDefined()

    expect(container.querySelector('.skeleton-header')).not.toBeNull()
    expect(container.querySelector('.skeleton-grid')).not.toBeNull()
  })

  it('eagerly renders Home route without throwing', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    // Home should be eagerly loaded and visible
    expect(await screen.findByRole('main')).toBeDefined()
  })

  it('renders lazy routes via Suspense when navigated directly', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>
    )

    // Lazy Settings page resolves successfully
    expect(await screen.findByRole('heading', { name: /settings/i })).toBeDefined()
  })
})
