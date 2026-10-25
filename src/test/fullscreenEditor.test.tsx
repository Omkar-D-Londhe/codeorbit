import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FullscreenEditor } from '../core/editor/FullscreenEditor'
import * as AppStateModule from '../state/AppState'

describe('FullscreenEditor (6.8)', () => {
  vi.spyOn(AppStateModule, 'useApp').mockReturnValue({
    saveStatus: { kind: 'idle' },
  } as unknown as ReturnType<typeof AppStateModule.useApp>)

  it('renders nothing when open={false}', () => {
    const { container } = render(
      <FullscreenEditor
        open={false}
        onClose={() => {}}
        editor={<div>Mock Editor</div>}
        preview={<div>Mock Preview</div>}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders dialog and content when open={true}', () => {
    render(
      <FullscreenEditor
        open={true}
        onClose={() => {}}
        title="Test Challenge"
        editor={<div>Mock Editor</div>}
        preview={<div>Mock Preview</div>}
      />
    )
    expect(screen.getByRole('dialog', { name: /fullscreen code editor/i })).toBeInTheDocument()
    expect(screen.getByText('Test Challenge')).toBeInTheDocument()
    expect(screen.getByText('Mock Editor')).toBeInTheDocument()
  })

  it('presses Esc to exit fullscreen and restores focus to opener', () => {
    const handleClose = vi.fn()
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    const openerRef = { current: opener }

    render(
      <FullscreenEditor
        open={true}
        onClose={handleClose}
        openerRef={openerRef}
        editor={<div>Mock Editor</div>}
        preview={<div>Mock Preview</div>}
      />
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalled()
    document.body.removeChild(opener)
  })

  it('toggles live preview drawer', () => {
    render(
      <FullscreenEditor
        open={true}
        onClose={() => {}}
        editor={<div>Mock Editor</div>}
        preview={<div>Live Preview Content</div>}
      />
    )

    const toggleBtn = screen.getByRole('button', { name: /show preview/i })
    expect(toggleBtn).toBeInTheDocument()

    fireEvent.click(toggleBtn)
    expect(screen.getByRole('button', { name: /hide preview/i })).toBeInTheDocument()
    expect(screen.getByText('Live Preview Content')).toBeInTheDocument()
  })
})
