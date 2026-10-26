import { useEffect, useRef, useState } from 'react'
import type { TopicProgress } from '../../../lib/progress'
import { useMotionAllowed } from '../../atmosphere/useMotionAllowed'

/**
 * Catalog 2.1: Star Pulse on Progress Save
 * Emits one ring pulse only when a topic really advances in progress
 * (parts increase or status becomes completed) through a persisted action.
 * Never on initial page load or simple navigation.
 * Disabled completely when reduced motion is active.
 */
export function usePulse(topicProgressMap: Record<string, TopicProgress>) {
  const motionAllowed = useMotionAllowed()
  const isInitialMount = useRef(true)
  const prevProgressRef = useRef<Record<string, { parts: number; status: string }>>({})
  const [pulsingTopicIds, setPulsingTopicIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      const current: Record<string, { parts: number; status: string }> = {}
      for (const [id, p] of Object.entries(topicProgressMap)) {
        current[id] = { parts: p.parts ?? 0, status: p.status ?? 'not-started' }
      }
      prevProgressRef.current = current
      return
    }

    if (!motionAllowed) return

    const newlyPulsing = new Set<string>()
    for (const [id, p] of Object.entries(topicProgressMap)) {
      const prev = prevProgressRef.current[id]
      const currentParts = p.parts ?? 0
      const currentStatus = p.status ?? 'not-started'

      if (prev) {
        const partsIncreased = currentParts > prev.parts
        const justCompleted = currentStatus === 'completed' && prev.status !== 'completed'
        if (partsIncreased || justCompleted) {
          newlyPulsing.add(id)
        }
      }

      prevProgressRef.current[id] = { parts: currentParts, status: currentStatus }
    }

    if (newlyPulsing.size > 0) {
      setPulsingTopicIds((prev) => new Set([...prev, ...newlyPulsing]))
      const timer = setTimeout(() => {
        setPulsingTopicIds((prev) => {
          const next = new Set(prev)
          for (const id of newlyPulsing) {
            next.delete(id)
          }
          return next
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [topicProgressMap, motionAllowed])

  return pulsingTopicIds
}
