import type { ConstellationLayout, TopicGroup, LayoutNode } from './types'
import { ZoneHalos } from './ZoneHalos'
import { OrbitTrail } from './OrbitTrail'

export interface EdgesProps {
  layout: ConstellationLayout
  activeTopicId?: string | null
  groups?: TopicGroup[]
  fromNode?: LayoutNode | null
  toNode?: LayoutNode | null
  onSelectTopic?: (topicId: string) => void
}

export function Edges({
  layout,
  activeTopicId,
  groups,
  fromNode,
  toNode,
  onSelectTopic,
}: EdgesProps) {
  const { hub, rings, edges, order, width, height, nodes } = layout

  return (
    <svg
      className="constellation-svg-layer"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <defs>
        {/* Prerequisite line chevron marker */}
        <marker
          id="prereq-arrow"
          viewBox="0 0 6 6"
          refX="4"
          refY="3"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--accent, #9a8bff)" />
        </marker>
      </defs>

      {/* Decorative concentric rings */}
      {rings.map((ring) => (
        <ellipse
          key={ring.id}
          className="constellation-ring"
          cx={hub.x}
          cy={hub.y}
          rx={ring.rx}
          ry={ring.ry}
        />
      ))}

      {/* Catalog 2.4: Topic Group Zone Halos */}
      {groups && onSelectTopic && (
        <ZoneHalos
          groups={groups}
          nodes={nodes}
          onSelectTopic={onSelectTopic}
        />
      )}

      {/* Curriculum order links (faint dotted) */}
      {order.map((link) => (
        <path
          key={`order-${link.fromId}-${link.toId}`}
          className="constellation-edge-order"
          d={link.d}
        />
      ))}

      {/* Prerequisite edges (dashed) with active emphasis (Catalog 2.3) */}
      {edges.map((edge) => {
        const isConnected =
          activeTopicId && (edge.fromId === activeTopicId || edge.toId === activeTopicId)
        const isDimmed = activeTopicId && !isConnected

        return (
          <path
            key={`edge-${edge.fromId}-${edge.toId}`}
            className={`constellation-edge-prereq ${isConnected ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
            d={edge.d}
          />
        )
      })}

      {/* Catalog 2.2: Orbital Trail on non-adjacent navigation */}
      <OrbitTrail
        fromNode={fromNode}
        toNode={toNode}
        hubX={hub.x}
        hubY={hub.y}
      />
    </svg>
  )
}
