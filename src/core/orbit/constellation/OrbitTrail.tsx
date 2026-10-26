import { useEffect, useState } from 'react'
import type { LayoutNode } from './types'
import { useMotionAllowed } from '../../atmosphere/useMotionAllowed'

export interface OrbitTrailProps {
  fromNode?: LayoutNode | null
  toNode?: LayoutNode | null
  hubX: number
  hubY: number
}

/**
 * Catalog 2.2: Orbital Trail on Navigation
 * When selecting a non-adjacent topic (|index_B - index_A| > 1),
 * draws a curved SVG trail between the previous and new star in <= 400 ms.
 * None without a previous selection or under reduced motion.
 */
export function OrbitTrail({ fromNode, toNode, hubX, hubY }: OrbitTrailProps) {
  const motionAllowed = useMotionAllowed()
  const [activeTrail, setActiveTrail] = useState<{ d: string; key: string } | null>(null)

  useEffect(() => {
    if (!motionAllowed || !fromNode || !toNode || fromNode.topicId === toNode.topicId) {
      setActiveTrail(null)
      return
    }

    const dist = Math.abs(fromNode.index - toNode.index)
    if (dist <= 1) {
      // Adjacent navigation: no trail
      setActiveTrail(null)
      return
    }

    // Compute curved Bézier trail path
    const x1 = fromNode.x
    const y1 = fromNode.y
    const x2 = toNode.x
    const y2 = toNode.y

    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2

    // Curve control point slightly outward from center hub
    const vHubX = midX - hubX
    const vHubY = midY - hubY
    const len = Math.hypot(vHubX, vHubY) || 1
    const offset = 36
    const ctrlX = midX + (vHubX / len) * offset
    const ctrlY = midY + (vHubY / len) * offset

    const d = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`
    const key = `${fromNode.topicId}->${toNode.topicId}-${Date.now()}`
    setActiveTrail({ d, key })

    const timer = setTimeout(() => {
      setActiveTrail(null)
    }, 400)

    return () => clearTimeout(timer)
  }, [fromNode, toNode, hubX, hubY, motionAllowed])

  if (!activeTrail || !motionAllowed) return null

  return (
    <g className="constellation-orbital-trail" aria-hidden="true">
      <path
        key={activeTrail.key}
        d={activeTrail.d}
        fill="none"
        stroke="var(--accent, #9a8bff)"
        strokeWidth="3"
        strokeLinecap="round"
        className="orbit-trail-path"
      />
    </g>
  )
}
