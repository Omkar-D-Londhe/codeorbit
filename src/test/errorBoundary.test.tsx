import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import * as exportNotes from '../core/storage/exportNotes'

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test explosive crash in component')
  }
  return <div>Component rendered safely</div>
}

describe('ErrorBoundary with Recovery UI (Stage 17a, 16.5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children without interference when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Component rendered safely')).toBeDefined()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('catches render error, displays reassurance message, and exposes all 4 recovery actions', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeDefined()
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText(/Your saved progress, completed topics, and settings are stored safely/i)).toBeDefined()
    expect(screen.getByText(/Test explosive crash in component/i)).toBeDefined()

    // 4 recovery actions
    expect(screen.getByRole('button', { name: 'Reload CodeOrbit' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Reset this screen' })).toBeDefined()
    expect(screen.getByRole('button', { name: /Copy diagnostic info/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Export my data/i })).toBeDefined()
  })

  it('copies sanitized diagnostics to clipboard excluding learner code and notes', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const copyBtn = screen.getByRole('button', { name: /Copy diagnostic info/i })
    fireEvent.click(copyBtn)

    expect(writeTextMock).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(writeTextMock.mock.calls[0][0])
    expect(payload.app).toBe('codeorbit')
    expect(payload.error.name).toBe('Error')
    expect(payload.error.message).toBe('Test explosive crash in component')
    expect(payload.notice).toContain('Diagnostics sanitized')
    // Ensure no learner personal data leaked
    expect(payload).not.toHaveProperty('code')
    expect(payload).not.toHaveProperty('notes')
  })

  it('triggers backup data download on Export my data click', () => {
    const triggerSpy = vi.spyOn(exportNotes, 'triggerDownload').mockReturnValue(true)

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const exportBtn = screen.getByRole('button', { name: /Export my data/i })
    fireEvent.click(exportBtn)

    expect(triggerSpy).toHaveBeenCalledTimes(1)
    expect(triggerSpy.mock.calls[0][0]).toContain('codeorbit-recovery-backup-')
    expect(triggerSpy.mock.calls[0][2]).toContain('application/json')
    expect(screen.getByRole('button', { name: '✓ Data exported' })).toBeDefined()
  })

  it('resets error state when Reset this screen is clicked', () => {
    let throwFlag = true
    const DynamicComponent = () => {
      if (throwFlag) throw new Error('First-time crash')
      return <div>Recovered content successfully</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeDefined()

    // Flip flag so next render succeeds
    throwFlag = false

    const resetBtn = screen.getByRole('button', { name: 'Reset this screen' })
    fireEvent.click(resetBtn)

    rerender(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Recovered content successfully')).toBeDefined()
  })
})
