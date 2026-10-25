import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('Dev route isolation', () => {
  it('renders __ui in dev mode or NotFound in non-dev mode', async () => {
    render(
      <MemoryRouter initialEntries={['/__ui']}>
        <App />
      </MemoryRouter>
    )

    if (import.meta.env.DEV) {
      expect(await screen.findByText(/UI Component & Constellation Gallery/i)).toBeInTheDocument()
    } else {
      expect(await screen.findByText(/Page not found/i)).toBeInTheDocument()
    }
  })
})
