import type {
  Topic,
  ConstellationTrackMeta,
  ConstellationLayout,
  LayoutNode,
  LayoutEdge,
  OrderLink,
} from './types'

export function aspectBucket(container: { w: number; h: number }): 'landscape' | 'portrait' {
  if (container.w <= 0) return 'landscape'
  return container.h / container.w > 1.1 ? 'portrait' : 'landscape'
}

export function computeConstellationLayout(
  topics: Topic[],
  aspect: 'landscape' | 'portrait',
  meta?: ConstellationTrackMeta
): ConstellationLayout {
  const isLandscape = aspect === 'landscape'
  const width = isLandscape ? 1200 : 800
  const height = isLandscape ? 800 : 1100
  const cx = isLandscape ? 600 : 400
  const cy = isLandscape ? 400 : 550
  const hubRadius = isLandscape ? 110 : 90
  const rx = isLandscape ? 470 : 300
  const ry = isLandscape ? 290 : 450

  const hub = { x: cx, y: cy, r: hubRadius }
  const n = topics.length

  if (n === 0) {
    return {
      aspect,
      width,
      height,
      hub,
      nodes: [],
      edges: [],
      order: [],
      rings: [],
    }
  }

  // Check if authored coords exist for ALL topics
  const authoredMap = new Map<string, { x: number; y: number }>()
  if (meta?.topics && meta.topics.length >= n) {
    const withCoords = meta.topics.filter(
      (m) => typeof m.x === 'number' && typeof m.y === 'number'
    )
    if (withCoords.length === n && topics.every((t) => withCoords.some((m) => m.topicId === t.id))) {
      for (const m of withCoords) {
        authoredMap.set(m.topicId, { x: m.x!, y: m.y! })
      }
    }
  }

  const nodes: LayoutNode[] = []

  if (authoredMap.size === n) {
    // Authored positions
    for (let i = 0; i < n; i++) {
      const topic = topics[i]
      const { x, y } = authoredMap.get(topic.id)!
      const dx = x - cx
      const dy = y - cy
      const angle = Math.atan2(dy, dx)
      const labelSide =
        x > cx + 80 ? 'right' : x < cx - 80 ? 'left' : y < cy ? 'top' : 'bottom'

      nodes.push({
        topicId: topic.id,
        index: i,
        x,
        y,
        angle,
        labelSide,
        groupId: topic.groupId,
      })
    }
  } else if (n === 1) {
    const topic = topics[0]
    const x = cx
    const y = cy - hubRadius - 140
    nodes.push({
      topicId: topic.id,
      index: 0,
      x,
      y,
      angle: -Math.PI / 2,
      labelSide: 'top',
      groupId: topic.groupId,
    })
  } else {
    // Deterministic spiral placement
    const turns = Math.ceil(n / 14)
    const depth = turns === 1 ? 0.12 : 0.42
    const minHubDistance = hubRadius + 75

    for (let i = 0; i < n; i++) {
      const topic = topics[i]
      const t = i / n
      // -90 degrees counter-clockwise
      const angle = -Math.PI / 2 - 2 * Math.PI * turns * t
      let rf = 1 - depth * t

      // Deterministic organic offset
      const organic = 0.06 * Math.sin(i * 2.4)
      rf += organic

      let x = cx + rx * rf * Math.cos(angle)
      let y = cy + ry * rf * Math.sin(angle)

      // Ensure hub clearance
      const distToHub = Math.hypot(x - cx, y - cy)
      if (distToHub < minHubDistance) {
        const factor = minHubDistance / (distToHub || 1)
        x = cx + (x - cx) * factor
        y = cy + (y - cy) * factor
      }

      nodes.push({
        topicId: topic.id,
        index: i,
        x,
        y,
        angle,
        labelSide: 'right', // placeholder, computed after relaxation
        groupId: topic.groupId,
      })
    }

    // Collision relaxation: 8 fixed iterations to achieve >= 96 units separation
    const minSpacing = 96
    for (let iter = 0; iter < 8; iter++) {
      let maxOverlap = 0
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
          let dx = nodes[j].x - nodes[i].x
          let dy = nodes[j].y - nodes[i].y
          let dist = Math.hypot(dx, dy)
          if (dist < minSpacing) {
            const overlap = minSpacing - dist
            maxOverlap = Math.max(maxOverlap, overlap)
            if (dist < 0.001) {
              dx = 1
              dy = 0
              dist = 1
            }
            const pushX = (dx / dist) * (overlap * 0.5)
            const pushY = (dy / dist) * (overlap * 0.5)
            nodes[i].x -= pushX
            nodes[i].y -= pushY
            nodes[j].x += pushX
            nodes[j].y += pushY

            // Virtual bounds clamping
            nodes[i].x = Math.max(50, Math.min(width - 50, nodes[i].x))
            nodes[i].y = Math.max(50, Math.min(height - 50, nodes[i].y))
            nodes[j].x = Math.max(50, Math.min(width - 50, nodes[j].x))
            nodes[j].y = Math.max(50, Math.min(height - 50, nodes[j].y))

            // Keep hub clearance
            const dHubI = Math.hypot(nodes[i].x - cx, nodes[i].y - cy)
            if (dHubI < minHubDistance) {
              const f = minHubDistance / (dHubI || 1)
              nodes[i].x = cx + (nodes[i].x - cx) * f
              nodes[i].y = cy + (nodes[i].y - cy) * f
            }
            const dHubJ = Math.hypot(nodes[j].x - cx, nodes[j].y - cy)
            if (dHubJ < minHubDistance) {
              const f = minHubDistance / (dHubJ || 1)
              nodes[j].x = cx + (nodes[j].x - cx) * f
              nodes[j].y = cy + (nodes[j].y - cy) * f
            }
          }
        }
      }
      if (maxOverlap < 0.5) break
    }

    // Set labelSide based on relaxed positions
    for (const node of nodes) {
      if (node.x > cx + 80) {
        node.labelSide = 'right'
      } else if (node.x < cx - 80) {
        node.labelSide = 'left'
      } else {
        node.labelSide = node.y < cy ? 'top' : 'bottom'
      }
    }
  }

  // Node position map
  const nodeMap = new Map<string, LayoutNode>()
  for (const node of nodes) {
    nodeMap.set(node.topicId, node)
  }

  // Build quadratic Bezier path helper pulled 25% towards hub
  const makeBezier = (from: LayoutNode, to: LayoutNode): string => {
    const mx = (from.x + to.x) / 2
    const my = (from.y + to.y) / 2
    const cpx = mx + (cx - mx) * 0.25
    const cpy = my + (cy - my) * 0.25
    return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
  }

  // 1. Prerequisite edges
  const edges: LayoutEdge[] = []
  for (const topic of topics) {
    const toNode = nodeMap.get(topic.id)
    if (!toNode) continue
    for (const prereqId of topic.prerequisiteIds || []) {
      const fromNode = nodeMap.get(prereqId)
      if (fromNode) {
        edges.push({
          fromId: prereqId,
          toId: topic.id,
          d: makeBezier(fromNode, toNode),
          kind: 'prerequisite',
        })
      }
    }
  }

  // 2. Curriculum order links
  const order: OrderLink[] = []
  for (let i = 0; i < n - 1; i++) {
    const fromNode = nodes[i]
    const toNode = nodes[i + 1]
    order.push({
      fromId: fromNode.topicId,
      toId: toNode.topicId,
      d: makeBezier(fromNode, toNode),
    })
  }

  // 3. Decorative orbit rings
  const rings = [
    { id: 'ring-inner', rx: Math.round(rx * 0.55), ry: Math.round(ry * 0.55) },
    { id: 'ring-mid', rx: Math.round(rx * 0.85), ry: Math.round(ry * 0.85) },
    { id: 'ring-outer', rx: Math.round(rx * 1.05), ry: Math.round(ry * 1.05) },
  ]

  return {
    aspect,
    width,
    height,
    hub,
    nodes,
    edges,
    order,
    rings,
  }
}
