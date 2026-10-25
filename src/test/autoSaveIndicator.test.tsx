import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AutoSaveIndicator } from '../core/editor/AutoSaveIndicator'
import * as AppStateModule from '../state/AppState'

describe('AutoSaveIndicator (6.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders "Auto-save ready" when idle', () => {
    vi.spyOn(AppStateModule, 'useApp').mockReturnValue({
      saveStatus: { kind: 'idle' },
    } as unknown as ReturnType<typeof AppStateModule.useApp>)

    render(<AutoSaveIndicator />)
    const el = screen.getByRole('status')
    expect(el).toHaveTextContent('Auto-save ready')
  })

  it('renders "Saved just now" and updates to relative seconds', () => {
    const baseTime = 1000000000000
    vi.setSystemTime(baseTime)

    vi.spyOn(AppStateModule, 'useApp').mockReturnValue({
      saveStatus: { kind: 'saved', at: baseTime },
    } as unknown as ReturnType<typeof AppStateModule.useApp>)

    const { rerender } = render(<AutoSaveIndicator />)
    expect(screen.getByRole('status')).toHaveTextContent('Saved just now')

    // Advance time by 15s
    vi.setSystemTime(baseTime + 15000)
    rerender(<AutoSaveIndicator />)
    expect(screen.getByRole('status')).toHaveTextContent('Saved 15s ago')
  })

  it('renders amber "Draft not saved" when saveStatus is error', () => {
    vi.spyOn(AppStateModule, 'useApp').mockReturnValue({
      saveStatus: { kind: 'error', at: Date.now() },
    } as unknown as ReturnType<typeof AppStateModule.useApp>)

    render(<AutoSaveIndicator />)
    const el = screen.getByRole('status')
    expect(el).toHaveTextContent('Draft not saved')
  })
})
