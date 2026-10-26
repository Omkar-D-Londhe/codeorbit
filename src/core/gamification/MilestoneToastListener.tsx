import { useEffect, useRef } from 'react'
import { useApp } from '../../state/AppState'
import { useToast } from '../../components/Toast'
import { detectMilestoneEvents } from './milestones'
import type { CodeOrbitState } from '../../state/types'

/**
 * Global listener that watches for state transitions and announces milestone events
 * and rank progressions via polite aria-live toast notifications (Catalog 8.4 & 8.7).
 * First load with existing or backfilled progress is completely silent.
 */
export function MilestoneToastListener() {
  const { state } = useApp()
  const toast = useToast()
  const prevStateRef = useRef<CodeOrbitState>(state)
  const isInitial = useRef(true)

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false
      prevStateRef.current = state
      return
    }

    const prevState = prevStateRef.current
    prevStateRef.current = state

    const events = detectMilestoneEvents(prevState, state)
    for (const ev of events) {
      toast.show(ev.message, ev.kind, ev.id)
    }
  }, [state, toast])

  return null
}
