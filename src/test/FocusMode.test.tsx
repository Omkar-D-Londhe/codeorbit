import React, { useRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FocusMode } from '../core/learning/FocusMode'

function FocusModeHarness() {
  const [active, setActive] = React.useState(true)
  const openerRef = useRef<HTMLButtonElement>(null)

  return (
    <div>
      <button ref={openerRef} type="button" onClick={() => setActive(true)}>
        Open Focus
      </button>
      <FocusMode active={active} onExit={() => setActive(false)} openerRef={openerRef}>
        <div data-testid="reading-column">
          <h1>Reading In Peace</h1>
          <p>Uncluttered prose column.</p>
        </div>
      </FocusMode>
    </div>
  )
}

describe('FocusMode component (4.10)', () => {
  it('renders nothing when active={false}', () => {
    const { container } = render(
      <FocusMode active={false} onExit={vi.fn()}>
        <div>Child content</div>
      </FocusMode>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders dark-room reading region, banner and aria-live announcement when active={true}', () => {
    render(
      <FocusMode active={true} onExit={vi.fn()}>
        <div>Reading column content</div>
      </FocusMode>
    )

    const region = screen.getByRole('region', { name: /reading focus mode/i })
    expect(region).toBeInTheDocument()
    expect(region).toHaveClass('focus-mode')

    const announcement = screen.getByRole('status')
    expect(announcement).toHaveTextContent('Focus mode enabled. Press Escape to exit.')

    expect(screen.getByRole('button', { name: /exit focus mode/i })).toBeInTheDocument()
    expect(screen.getByText('Reading column content')).toBeInTheDocument()
  })

  it('exits focus mode and restores focus to opener on clicking Exit button', async () => {
    const user = userEvent.setup()
    render(<FocusModeHarness />)

    const exitBtn = screen.getByRole('button', { name: /exit focus mode/i })
    await user.click(exitBtn)

    expect(screen.queryByRole('region', { name: /reading focus mode/i })).not.toBeInTheDocument()
    const openBtn = screen.getByRole('button', { name: 'Open Focus' })
    expect(document.activeElement).toBe(openBtn)
  })

  it('exits focus mode and restores focus on pressing Escape', async () => {
    const user = userEvent.setup()
    render(<FocusModeHarness />)

    expect(screen.getByRole('region', { name: /reading focus mode/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('region', { name: /reading focus mode/i })).not.toBeInTheDocument()
    const openBtn = screen.getByRole('button', { name: 'Open Focus' })
    expect(document.activeElement).toBe(openBtn)
  })
})
