import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShortcutsModal } from '../../core/a11y/ShortcutsModal'
import { SHORTCUTS } from '../../core/a11y/shortcuts'

describe('ShortcutsModal', () => {
  it('lists exactly the registered shortcuts from the authoritative registry', () => {
    const onClose = vi.fn()
    render(<ShortcutsModal open={true} onClose={onClose} />)

    // Check dialog presence
    const dialog = screen.getByRole('dialog', { name: /keyboard shortcuts reference/i })
    expect(dialog).toBeInTheDocument()

    // Every shortcut description in SHORTCUTS registry must be present in the modal
    for (const shortcut of SHORTCUTS) {
      const match = screen.getAllByText(shortcut.description)
      expect(match.length).toBeGreaterThan(0)
    }

    // Total rendered shortcut rows must equal SHORTCUTS.length
    const rows = document.querySelectorAll('.shortcuts-row')
    expect(rows.length).toBe(SHORTCUTS.length)
  })

  it('closes on Escape or clicking the close button', () => {
    const onClose = vi.fn()
    render(<ShortcutsModal open={true} onClose={onClose} />)

    // Escape closes
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    // Close button closes
    const closeBtn = screen.getByRole('button', { name: /close shortcuts reference/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
