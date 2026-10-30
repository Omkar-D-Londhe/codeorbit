import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider } from '../state/AppState'
import { ToastProvider } from '../components/Toast'
import Settings from '../pages/Settings'

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <AppStateProvider>
        <ToastProvider>
          <Settings />
        </ToastProvider>
      </AppStateProvider>
    </MemoryRouter>
  )
}

describe('Stage 28: Settings Connected Services UI & Honesty', () => {
  it('renders the Connected Services card with explanatory copy', () => {
    renderSettings()

    const heading = screen.getByRole('heading', { name: /Connected Services/i })
    expect(heading).toBeInTheDocument()

    expect(
      screen.getByText(/CodeOrbit is an offline-first learning platform/i)
    ).toBeInTheDocument()
  })

  it('renders each gated external service as Not connected with privacy disclosures', () => {
    renderSettings()

    // 1. W3C Validator
    expect(screen.getByRole('heading', { name: /W3C HTML Validator/i })).toBeInTheDocument()
    const w3cStatus = screen.getByTestId('service-status-w3c-validator')
    expect(w3cStatus.textContent).toBe('Not connected')

    // 2. AI Hints
    expect(screen.getByRole('heading', { name: /AI-Powered Hint Expansion/i })).toBeInTheDocument()
    const aiStatus = screen.getByTestId('service-status-ai-hints')
    expect(aiStatus.textContent).toBe('Not connected')

    // 3. Multiplayer
    expect(screen.getByRole('heading', { name: /Multiplayer Challenge Race/i })).toBeInTheDocument()
    const multiStatus = screen.getByTestId('service-status-multiplayer')
    expect(multiStatus.textContent).toBe('Not connected')

    // Disclosures are visible
    expect(screen.getByText(/Nu HTML Checker service/i)).toBeInTheDocument()
    expect(screen.getByText(/Requires an owner-managed backend proxy/i)).toBeInTheDocument()
    expect(screen.getByText(/opponent progress is never fabricated or simulated/i)).toBeInTheDocument()
  })

  it('renders disabled action controls preventing unapproved connections', () => {
    renderSettings()

    const buttons = screen.getAllByRole('button', { name: /Not configured/i })
    expect(buttons.length).toBe(3)
    for (const btn of buttons) {
      expect(btn).toBeDisabled()
    }
  })

  it('proves that no active AI API key inputs or secret storage forms exist in Settings', () => {
    renderSettings()

    // Ensure no API key inputs are present
    expect(screen.queryByPlaceholderText(/api key/i)).toBeNull()
    expect(screen.queryByLabelText(/openai/i)).toBeNull()
    expect(screen.queryByLabelText(/gemini/i)).toBeNull()
  })
})
