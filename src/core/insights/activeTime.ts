import { useEffect, useRef } from 'react'
import { useApp } from '../../state/AppState'

export const ACTIVE_TIME_BATCH_SECONDS = 30
export const ACTIVE_TIME_IDLE_SECONDS = 60
export const SESSION_MIN_ACTIVE_SECONDS = 5
export const ACTIVE_TIME_LABEL = 'measured on this device'

/**
 * Measured Session Qualification Definition (P-07 / Stage 15c):
 * - A distinct measured session requires a continuous visit to a learning route accumulating
 *   at least SESSION_MIN_ACTIVE_SECONDS (5s) of active, non-idle, foreground learning.
 * - Accidental bounces or brief clicks (< 5s) record accumulated time but do NOT qualify as a session.
 * - Within a single continuous visit, regardless of batch flushes (every 30s) or idle/blur pauses,
 *   the session counter increments at most once.
 * - Navigating away and returning to the topic starts a new distinct visit which can qualify separately.
 * - Independent of streak days, XP, milestones, or quiz attempt counts.
 */

/**
 * Formats elapsed active seconds into human-readable string (e.g., "12 min", "1 h 15 min", "< 1 min").
 */
export function formatActiveTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min'
  const mins = Math.floor(seconds / 60)
  if (mins === 0) return '< 1 min'
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  if (hours === 0) return `${mins} min`
  if (remainingMins === 0) return `${hours} h`
  return `${hours} h ${remainingMins} min`
}

/**
 * Tracks foreground-visible active study time on topic-scoped learning routes.
 *
 * Rules (spec §6, §7.7, §11):
 * - Batches persisted updates every 30 seconds.
 * - Idles after 60 seconds without input (mouse, keys, scroll, touch).
 * - Pauses when tab is hidden (document.visibilityState === 'hidden') or window is blurred.
 * - Flushes pending seconds safely when route changes or component unmounts.
 * - Labelled 'measured on this device'.
 * - Never triggers streaks, XP, or milestones.
 */
export function useActiveTime(topicId?: string): void {
  const { dispatch } = useApp()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch

  const topicIdRef = useRef(topicId)
  topicIdRef.current = topicId

  const uncommittedRef = useRef(0)
  const lastActiveRef = useRef(Date.now())
  const isFocusedRef = useRef(typeof document !== 'undefined' ? !document.hidden : true)

  useEffect(() => {
    if (!topicId || typeof window === 'undefined') return
    const currentTopicId = topicId

    // Reset uncommitted accumulator for new topic
    uncommittedRef.current = 0
    lastActiveRef.current = Date.now()
    isFocusedRef.current = !document.hidden

    let totalActiveThisVisit = 0
    let hasCountedSessionThisVisit = false

    const onUserActivity = () => {
      lastActiveRef.current = Date.now()
    }

    const onVisibilityChange = () => {
      isFocusedRef.current = !document.hidden
    }

    const onWindowBlur = () => {
      isFocusedRef.current = false
    }

    const onWindowFocus = () => {
      isFocusedRef.current = true
    }

    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }))
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('focus', onWindowFocus)

    // 1-second interval tick
    const intervalId = window.setInterval(() => {
      const now = Date.now()
      const idleTimeMs = now - lastActiveRef.current
      const isIdle = idleTimeMs >= ACTIVE_TIME_IDLE_SECONDS * 1000

      if (isFocusedRef.current && !isIdle && currentTopicId) {
        uncommittedRef.current += 1
        totalActiveThisVisit += 1

        if (uncommittedRef.current >= ACTIVE_TIME_BATCH_SECONDS) {
          const toFlush = Math.floor(uncommittedRef.current)
          uncommittedRef.current -= toFlush

          const isNewSession = !hasCountedSessionThisVisit && totalActiveThisVisit >= SESSION_MIN_ACTIVE_SECONDS
          if (isNewSession) {
            hasCountedSessionThisVisit = true
          }

          dispatchRef.current({
            type: 'RECORD_ACTIVE_TIME',
            topicId: currentTopicId,
            seconds: toFlush,
            isNewSession,
          })
        }
      }
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
      events.forEach((evt) => window.removeEventListener(evt, onUserActivity))
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onWindowBlur)
      window.removeEventListener('focus', onWindowFocus)

      // Flush remaining uncommitted seconds on unmount / topic change
      const remaining = Math.round(uncommittedRef.current)
      if (remaining >= 1 && currentTopicId) {
        const isNewSession = !hasCountedSessionThisVisit && totalActiveThisVisit >= SESSION_MIN_ACTIVE_SECONDS
        if (isNewSession) {
          hasCountedSessionThisVisit = true
        }

        dispatchRef.current({
          type: 'RECORD_ACTIVE_TIME',
          topicId: currentTopicId,
          seconds: remaining,
          isNewSession,
        })
      }
      uncommittedRef.current = 0
    }
  }, [topicId])
}
