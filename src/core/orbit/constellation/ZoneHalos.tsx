import type { TopicGroup, LayoutNode } from './types'

export interface ZoneHalosProps {
  groups: TopicGroup[]
  nodes: LayoutNode[]
  onSelectTopic: (topicId: string) => void
}

interface GroupZoneData {
  group: TopicGroup
  firstTopicId: string
  cx: number
  cy: number
  r: number
  nodeCount: number
}

/**
 * Catalog 2.4: Topic Group Zones
 * Renders subtle background halo zones grouping topics in the same TopicGroup.
 * Halos tint regions without modifying star positions (star position equality invariant).
 * Clicking a zone label selects the group's first topic and brings it to focus.
 */
export function ZoneHalos({ groups, nodes, onSelectTopic }: ZoneHalosProps) {
  const zones: GroupZoneData[] = []

  for (const group of groups) {
    const groupNodes = nodes.filter((n) => n.groupId === group.id)
    if (groupNodes.length === 0) continue

    const sumX = groupNodes.reduce((acc, n) => acc + n.x, 0)
    const sumY = groupNodes.reduce((acc, n) => acc + n.y, 0)
    const cx = sumX / groupNodes.length
    const cy = sumY / groupNodes.length

    let maxDist = 0
    for (const n of groupNodes) {
      const dist = Math.hypot(n.x - cx, n.y - cy)
      if (dist > maxDist) maxDist = dist
    }

    const r = Math.max(maxDist + 52, 60)
    zones.push({
      group,
      firstTopicId: groupNodes[0].topicId,
      cx,
      cy,
      r,
      nodeCount: groupNodes.length,
    })
  }

  return (
    <g className="constellation-zone-halos" aria-label="Topic group zones">
      <defs>
        <radialGradient id="constellation-zone-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent, #9a8bff)" stopOpacity="0.14" />
          <stop offset="70%" stopColor="var(--accent, #9a8bff)" stopOpacity="0.04" />
          <stop offset="100%" stopColor="var(--accent, #9a8bff)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {zones.map((z) => (
        <g key={z.group.id} className="constellation-zone-item">
          {/* Subtle atmospheric tint halo */}
          <circle
            cx={z.cx}
            cy={z.cy}
            r={z.r}
            fill="url(#constellation-zone-grad)"
            className="constellation-zone-halo"
          />

          {/* Interactive zone label button placed near top edge of zone */}
          <foreignObject
            x={z.cx - 70}
            y={z.cy - z.r - 14}
            width={140}
            height={28}
            style={{ overflow: 'visible' }}
          >
            <button
              type="button"
              className="constellation-zone-badge"
              onClick={() => onSelectTopic(z.firstTopicId)}
              aria-label={`${z.group.title} zone (${z.nodeCount} topics). Click to select first topic.`}
              title={`Jump to ${z.group.title}`}
            >
              {z.group.title}
            </button>
          </foreignObject>
        </g>
      ))}
    </g>
  )
}
