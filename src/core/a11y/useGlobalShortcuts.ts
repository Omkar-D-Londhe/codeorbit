import { useEffect } from 'react'

/**
 * Checks whether the keyboard event originated from a typing target
 * (input, textarea, select, contenteditable, or CodeMirror editor).
 * When true, global single-key or palette shortcuts MUST NOT fire.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (
    target.isContentEditable ||
    target.contentEditable === 'true' ||
    target.getAttribute('contenteditable') === 'true' ||
    target.getAttribute('contenteditable') === ''
  ) return true
  if (target.closest('.cm-editor') || target.closest('[contenteditable="true"]')) return true
  return false
}

export interface UseGlobalShortcutsOptions {
  onOpenPalette: () => void
  onOpenShortcuts: () => void
}

/**
 * Attaches global keyboard shortcuts:
 * - Ctrl+K / ⌘K and '/' open Command Palette.
 * - '?' opens Keyboard Shortcuts Reference Modal.
 * Strictly guards against firing while typing in any input or editor.
 */
export function useGlobalShortcuts({
  onOpenPalette,
  onOpenShortcuts,
}: UseGlobalShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Guard against firing while typing in form inputs, textareas, or CodeMirror
      if (isTypingTarget(e.target)) {
        return
      }

      // 2. Ctrl/⌘+K or '/' -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenPalette()
        return
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        onOpenPalette()
        return
      }

      // 3. '?' -> Keyboard Shortcuts modal
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        onOpenShortcuts()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenPalette, onOpenShortcuts])
}
