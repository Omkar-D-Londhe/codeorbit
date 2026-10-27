import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CommandPalette } from '../../core/search/CommandPalette'
import { isTypingTarget, useGlobalShortcuts } from '../../core/a11y/useGlobalShortcuts'
import { AppStateProvider } from '../../state/AppState'

function renderPalette(props: { open: boolean; onClose?: () => void; onOpenShortcuts?: () => void }) {
  const onClose = props.onClose || vi.fn()
  const onOpenShortcuts = props.onOpenShortcuts || vi.fn()
  return render(
    <MemoryRouter>
      <AppStateProvider>
        <CommandPalette open={props.open} onClose={onClose} onOpenShortcuts={onOpenShortcuts} />
      </AppStateProvider>
    </MemoryRouter>
  )
}

function ShortcutTestHarness({ onOpenPalette, onOpenShortcuts }: { onOpenPalette: () => void; onOpenShortcuts: () => void }) {
  useGlobalShortcuts({ onOpenPalette, onOpenShortcuts })
  return (
    <div>
      <input data-testid="test-input" />
      <textarea data-testid="test-textarea" />
      <div data-testid="test-contenteditable" contentEditable={true} />
      <div className="cm-editor">
        <div data-testid="test-editor-inner" tabIndex={0}>editor content</div>
      </div>
      <button data-testid="test-btn">Regular Button</button>
    </div>
  )
}

describe('CommandPalette & global shortcuts', () => {
  it('renders combobox and listbox when open', () => {
    renderPalette({ open: true })
    const input = screen.getByRole('combobox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-autocomplete', 'list')

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
  })

  it('navigates options with ArrowDown and ArrowUp and selects with Enter', () => {
    const onClose = vi.fn()
    renderPalette({ open: true, onClose })
    const input = screen.getByRole('combobox')

    // Press ArrowDown
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const options = screen.getAllByRole('option')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')

    // Press Enter to select
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    renderPalette({ open: true, onClose })
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('correctly identifies typing targets to prevent shortcut collisions', () => {
    const input = document.createElement('input')
    const textarea = document.createElement('textarea')
    const select = document.createElement('select')
    const editable = document.createElement('div')
    editable.contentEditable = 'true'

    const cmEditor = document.createElement('div')
    cmEditor.className = 'cm-editor'
    const cmInner = document.createElement('div')
    cmEditor.appendChild(cmInner)

    const normalBtn = document.createElement('button')

    expect(isTypingTarget(input)).toBe(true)
    expect(isTypingTarget(textarea)).toBe(true)
    expect(isTypingTarget(select)).toBe(true)
    expect(isTypingTarget(editable)).toBe(true)
    expect(isTypingTarget(cmInner)).toBe(true)
    expect(isTypingTarget(normalBtn)).toBe(false)
  })

  it('fires global shortcuts only when not focused in typing targets', () => {
    const onOpenPalette = vi.fn()
    const onOpenShortcuts = vi.fn()

    render(<ShortcutTestHarness onOpenPalette={onOpenPalette} onOpenShortcuts={onOpenShortcuts} />)

    const input = screen.getByTestId('test-input')
    const textarea = screen.getByTestId('test-textarea')
    const editorInner = screen.getByTestId('test-editor-inner')
    const btn = screen.getByTestId('test-btn')

    // 1. Typing in input: Ctrl+K, '/', '?' MUST NOT fire
    input.focus()
    fireEvent.keyDown(input, { key: 'k', ctrlKey: true })
    fireEvent.keyDown(input, { key: '/' })
    fireEvent.keyDown(input, { key: '?' })
    expect(onOpenPalette).not.toHaveBeenCalled()
    expect(onOpenShortcuts).not.toHaveBeenCalled()

    // 2. Typing in textarea: MUST NOT fire
    textarea.focus()
    fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true })
    fireEvent.keyDown(textarea, { key: '/' })
    fireEvent.keyDown(textarea, { key: '?' })
    expect(onOpenPalette).not.toHaveBeenCalled()
    expect(onOpenShortcuts).not.toHaveBeenCalled()

    // 3. Inside CodeMirror editor: MUST NOT fire
    editorInner.focus()
    fireEvent.keyDown(editorInner, { key: 'k', ctrlKey: true })
    fireEvent.keyDown(editorInner, { key: '/' })
    fireEvent.keyDown(editorInner, { key: '?' })
    expect(onOpenPalette).not.toHaveBeenCalled()
    expect(onOpenShortcuts).not.toHaveBeenCalled()

    // 4. On regular button: Ctrl+K or '/' opens palette, '?' opens shortcuts
    btn.focus()
    fireEvent.keyDown(btn, { key: 'k', ctrlKey: true })
    expect(onOpenPalette).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(btn, { key: '/' })
    expect(onOpenPalette).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(btn, { key: '?' })
    expect(onOpenShortcuts).toHaveBeenCalledTimes(1)
  })
})
