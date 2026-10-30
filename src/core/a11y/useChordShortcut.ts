import { useEffect, useRef } from 'react'
import { isTypingTarget } from './useGlobalShortcuts'

export interface ChordMap {
  [secondKey: string]: string
}

export const NAVIGATION_CHORDS: ChordMap = {
  h: '/',
  e: '/explore',
  p: '/progress',
  c: '/concepts',
}

export interface UseChordShortcutOptions {
  onNavigate?: (path: string) => void
  timeoutMs?: number
}

/**
 * UI-08: Two-key chord shortcut handler (e.g., `g h`, `g e`, `g p`, `g c`).
 * - Listens for leader key 'g'.
 * - Awaits follower key within timeout window (default 1,500ms).
 * - Focus guard: ignores all typing targets and active modals/dialogs.
 * - Escape key or timeout cancels the pending leader key.
 */
export function useChordShortcut({
  onNavigate,
  timeoutMs = 1500,
}: UseChordShortcutOptions) {
  const pendingLeaderRef = useRef<boolean>(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const clearPending = () => {
      pendingLeaderRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Guard against firing while typing or within open dialogs
      if (isTypingTarget(e.target)) {
        clearPending()
        return
      }

      // Check if an accessible modal or dialog is currently active
      const activeModal = document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')
      if (activeModal) {
        clearPending()
        return
      }

      // Ignore modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) {
        clearPending()
        return
      }

      const key = e.key.toLowerCase()

      // Escape cancels pending leader
      if (key === 'escape') {
        clearPending()
        return
      }

      if (pendingLeaderRef.current) {
        // We are awaiting the second key
        if (NAVIGATION_CHORDS[key] && onNavigate) {
          e.preventDefault()
          const destination = NAVIGATION_CHORDS[key]
          clearPending()
          onNavigate(destination)
          return
        }
        // Any other key clears the chord
        clearPending()
        // If the new key is 'g', re-prime leader
        if (key === 'g') {
          pendingLeaderRef.current = true
          timerRef.current = setTimeout(clearPending, timeoutMs)
        }
      } else {
        if (key === 'g') {
          pendingLeaderRef.current = true
          timerRef.current = setTimeout(clearPending, timeoutMs)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearPending()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onNavigate, timeoutMs])
}
