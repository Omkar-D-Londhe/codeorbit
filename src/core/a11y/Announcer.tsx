import { useEffect, useState, useRef } from 'react'

export type Politeness = 'polite' | 'assertive'

export interface AnnouncementItem {
  message: string
  politeness: Politeness
  id: number
}

// In-memory deduplication tracker: message -> timestamp
const recentAnnouncements = new Map<string, number>()
const DEDUPE_WINDOW_MS = 1500
const MAX_QUEUE_DEPTH = 3

type AnnouncementListener = (item: AnnouncementItem) => void
const listeners = new Set<AnnouncementListener>()
let nextId = 1

/**
 * Dispatch an announcement to screen readers.
 * Dedupes identical messages within 1.5 s.
 */
export function announce(message: string, politeness: Politeness = 'polite'): void {
  if (!message || typeof message !== 'string') return
  const trimmed = message.trim()
  if (!trimmed) return

  const now = Date.now()
  const lastAnnouncedAt = recentAnnouncements.get(trimmed) ?? 0

  if (now - lastAnnouncedAt < DEDUPE_WINDOW_MS) {
    // Deduped
    return
  }

  recentAnnouncements.set(trimmed, now)

  // Prune map if large
  if (recentAnnouncements.size > 100) {
    for (const [msg, ts] of recentAnnouncements) {
      if (now - ts > DEDUPE_WINDOW_MS * 2) {
        recentAnnouncements.delete(msg)
      }
    }
  }

  const item: AnnouncementItem = {
    message: trimmed,
    politeness,
    id: nextId++,
  }

  for (const listener of Array.from(listeners)) {
    listener(item)
  }
}

/** Reset announcer internal dedupe state (for test isolation) */
export function resetAnnouncerState(): void {
  recentAnnouncements.clear()
}

export function subscribeAnnouncer(listener: AnnouncementListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Single unified live region manager for screen readers.
 * Provides a polite live region (with queue depth max 3) and an assertive live region.
 */
export function Announcer() {
  const [politeText, setPoliteText] = useState('')
  const [assertiveText, setAssertiveText] = useState('')
  const politeQueue = useRef<string[]>([])
  const isSpeaking = useRef(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const processQueue = () => {
      if (politeQueue.current.length === 0) {
        isSpeaking.current = false
        return
      }

      isSpeaking.current = true
      const nextMessage = politeQueue.current.shift()!
      setPoliteText(nextMessage)

      timerRef.current = window.setTimeout(() => {
        processQueue()
      }, 1000)
    }

    const unsubscribe = subscribeAnnouncer((item) => {
      if (item.politeness === 'assertive') {
        setAssertiveText(item.message)
        return
      }

      // Polite channel: queue up to MAX_QUEUE_DEPTH
      if (politeQueue.current.length >= MAX_QUEUE_DEPTH) {
        return
      }

      politeQueue.current.push(item.message)
      if (!isSpeaking.current) {
        processQueue()
      }
    })

    return () => {
      unsubscribe()
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <div
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      <div role="status" aria-live="polite" aria-atomic="true">
        {politeText}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true">
        {assertiveText}
      </div>
    </div>
  )
}
