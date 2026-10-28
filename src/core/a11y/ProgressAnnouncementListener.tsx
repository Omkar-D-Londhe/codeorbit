import { useEffect, useRef } from 'react'
import { useApp } from '../../state/AppState'
import { detectProgressAnnouncements } from './progressAnnouncements'
import { announce } from './Announcer'
import type { CodeOrbitState } from '../../state/types'

/**
 * Global listener that watches for progress transitions (lesson complete, quiz pass/perfect,
 * challenge pass, level up, badge earned) and dispatches polite screen-reader announcements (Catalog 13.4).
 * Silent on initial mount / backfilled state.
 */
export function ProgressAnnouncementListener() {
  const { state } = useApp()
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

    const announcements = detectProgressAnnouncements(prevState, state)
    for (const item of announcements) {
      announce(item.message, item.politeness)
    }
  }, [state])

  return null
}
