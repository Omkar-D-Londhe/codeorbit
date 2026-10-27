/**
 * Deterministic force-directed mastery graph layout.
 *
 * Requirements:
 * - Exactly 200 fixed iterations by default (spec §7.5).
 * - Seeded deterministic pseudorandom initialization (Mulberry32).
 * - Uniform node dimensions of 176 × 56 pixels.
 * - Repulsion between all nodes, attractive springs exclusively for declared prerequisite edges.
 * - Centering force and container boundary clamping.
 * - Pinned node positions support: pinned nodes remain fixed at their assigned coordinates.
 * - Missing prerequisite IDs safely ignored; cycles tolerated without hanging.
 * - Execution budget: < 20 ms for <= 60 nodes.
 */

export interface ForceTopicInput {
  id: string
  prerequisiteIds?: readonly string[]
}

export interface ForceNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  pinned: boolean
}

export interface ForceEdge {
  from: string
  to: string
  d: string
}

export interface ForceLayout {
  width: number
  height: number
  nodeW: number
  nodeH: number
  iterations: number
  nodes: ForceNode[]
  edges: ForceEdge[]
}

export interface ForceLayoutOptions {
  iterations?: number
  height?: number
  seed?: number
  pinnedPositions?: Record<string, { x: number; y: number }>
  kRepulsion?: number
  kSpring?: number
  restLength?: number
  kCenter?: number
  damping?: number
}

export const FORCE_NODE_W = 176
export const FORCE_NODE_H = 56
export const DEFAULT_FORCE_ITERATIONS = 200
export const DEFAULT_FORCE_SEED = 0x436f6465 // 'Code'

const PAD = 16

/**
 * 32-bit Mulberry32 seeded pseudorandom number generator.
 * Produces deterministic floats in [0, 1).
 */
export function createMulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Pure and deterministic force-directed layout computation.
 */
export function computeForceLayout(
  topics: readonly ForceTopicInput[],
  width: number,
  options: ForceLayoutOptions = {}
): ForceLayout {
  const n = topics.length
  const iterations = options.iterations ?? DEFAULT_FORCE_ITERATIONS
  const height = options.height ?? Math.max(540, Math.ceil(Math.sqrt(n || 1)) * 140 + 80)
  const seed = options.seed ?? DEFAULT_FORCE_SEED
  const pinnedPositions = options.pinnedPositions ?? {}

  const kRepulsion = options.kRepulsion ?? 32000
  const kSpring = options.kSpring ?? 0.05
  const restLength = options.restLength ?? 180
  const kCenter = options.kCenter ?? 0.012
  const damping = options.damping ?? 0.82

  if (n === 0) {
    return {
      width,
      height,
      nodeW: FORCE_NODE_W,
      nodeH: FORCE_NODE_H,
      iterations: 0,
      nodes: [],
      edges: [],
    }
  }

  const rng = createMulberry32(seed)
  const cx = width / 2
  const cy = height / 2

  // Flat typed arrays for simulation performance
  const x = new Float64Array(n)
  const y = new Float64Array(n)
  const vx = new Float64Array(n)
  const vy = new Float64Array(n)
  const isPinned = new Uint8Array(n)

  // Map of topic ID to index
  const idToIndex = new Map<string, number>()
  for (let i = 0; i < n; i++) {
    idToIndex.set(topics[i].id, i)
  }

  // Initial placement (deterministic spiral / circle + jitter)
  for (let i = 0; i < n; i++) {
    const topicId = topics[i].id
    const pinned = pinnedPositions[topicId]

    if (pinned) {
      x[i] = pinned.x
      y[i] = pinned.y
      isPinned[i] = 1
    } else {
      const angle = (2 * Math.PI * i) / n + (rng() - 0.5) * 0.2
      const radius = Math.min(width, height) * 0.3 + (rng() - 0.5) * 40
      x[i] = cx + radius * Math.cos(angle) - FORCE_NODE_W / 2
      y[i] = cy + radius * Math.sin(angle) - FORCE_NODE_H / 2
      isPinned[i] = 0
    }

    // Clamp inside container
    x[i] = Math.max(PAD, Math.min(width - PAD - FORCE_NODE_W, x[i]))
    y[i] = Math.max(PAD, Math.min(height - PAD - FORCE_NODE_H, y[i]))
  }

  // Compile valid declared prerequisite edges (ignoring missing IDs)
  const edgeList: Array<{ from: string; to: string; fromIdx: number; toIdx: number }> = []
  for (let i = 0; i < n; i++) {
    const t = topics[i]
    for (const pId of t.prerequisiteIds || []) {
      const pIdx = idToIndex.get(pId)
      if (pIdx !== undefined && pIdx !== i) {
        edgeList.push({
          from: pId,
          to: t.id,
          fromIdx: pIdx,
          toIdx: i,
        })
      }
    }
  }

  const fx = new Float64Array(n)
  const fy = new Float64Array(n)
  const nodeCx = new Float64Array(n)
  const nodeCy = new Float64Array(n)

  // Fixed iterations loop (strictly deterministic, <20ms budget)
  const halfW = FORCE_NODE_W / 2
  const halfH = FORCE_NODE_H / 2

  for (let iter = 0; iter < iterations; iter++) {
    fx.fill(0)
    fy.fill(0)

    for (let i = 0; i < n; i++) {
      nodeCx[i] = x[i] + halfW
      nodeCy[i] = y[i] + halfH
    }

    // 1. Repulsion between all node pairs
    for (let i = 0; i < n; i++) {
      const cxi = nodeCx[i]
      const cyi = nodeCy[i]

      for (let j = i + 1; j < n; j++) {
        const dx = cxi - nodeCx[j]
        const dy = cyi - nodeCy[j]
        const distSq = dx * dx + dy * dy + 100
        const invDist = 1 / Math.sqrt(distSq)
        const force = kRepulsion * (invDist * invDist)
        const fInvDist = (force > 60 ? 60 : force) * invDist

        const fdx = dx * fInvDist
        const fdy = dy * fInvDist

        fx[i] += fdx
        fy[i] += fdy
        fx[j] -= fdx
        fy[j] -= fdy
      }
    }

    // 2. Attractive springs along declared prerequisite edges
    for (let e = 0; e < edgeList.length; e++) {
      const { fromIdx, toIdx } = edgeList[e]
      const dx = nodeCx[toIdx] - nodeCx[fromIdx]
      const dy = nodeCy[toIdx] - nodeCy[fromIdx]
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const displacement = dist - restLength
      const springF = displacement * kSpring * (1 / dist)

      const fdx = dx * springF
      const fdy = dy * springF

      fx[fromIdx] += fdx
      fy[fromIdx] += fdy
      fx[toIdx] -= fdx
      fy[toIdx] -= fdy
    }

    // 3. Centering gravity
    for (let i = 0; i < n; i++) {
      fx[i] += (cx - nodeCx[i]) * kCenter
      fy[i] += (cy - nodeCy[i]) * kCenter
    }

    // 4. Position update with temperature decay
    const temp = Math.max(0.04, 1.0 - iter / iterations)
    const maxV = 35 * temp

    for (let i = 0; i < n; i++) {
      if (isPinned[i]) {
        vx[i] = 0
        vy[i] = 0
        continue
      }

      vx[i] = (vx[i] + fx[i]) * damping * temp
      vy[i] = (vy[i] + fy[i]) * damping * temp

      const v = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i])
      if (v > maxV && v > 0) {
        vx[i] = (vx[i] / v) * maxV
        vy[i] = (vy[i] / v) * maxV
      }

      x[i] += vx[i]
      y[i] += vy[i]

      // Boundary clamp
      x[i] = Math.max(PAD, Math.min(width - PAD - FORCE_NODE_W, x[i]))
      y[i] = Math.max(PAD, Math.min(height - PAD - FORCE_NODE_H, y[i]))
    }
  }

  // Construct resulting node list (coordinates rounded to 1 decimal place)
  const nodes: ForceNode[] = new Array(n)
  for (let i = 0; i < n; i++) {
    nodes[i] = {
      id: topics[i].id,
      x: Math.round(x[i] * 10) / 10,
      y: Math.round(y[i] * 10) / 10,
      vx: Math.round(vx[i] * 100) / 100,
      vy: Math.round(vy[i] * 100) / 100,
      pinned: Boolean(isPinned[i]),
    }
  }

  // Construct edges: straight lines between node centers
  const edges: ForceEdge[] = new Array(edgeList.length)
  for (let e = 0; e < edgeList.length; e++) {
    const { from, to, fromIdx, toIdx } = edgeList[e]
    const x1 = Math.round((x[fromIdx] + FORCE_NODE_W / 2) * 10) / 10
    const y1 = Math.round((y[fromIdx] + FORCE_NODE_H / 2) * 10) / 10
    const x2 = Math.round((x[toIdx] + FORCE_NODE_W / 2) * 10) / 10
    const y2 = Math.round((y[toIdx] + FORCE_NODE_H / 2) * 10) / 10

    edges[e] = {
      from,
      to,
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
    }
  }

  return {
    width,
    height,
    nodeW: FORCE_NODE_W,
    nodeH: FORCE_NODE_H,
    iterations,
    nodes,
    edges,
  }
}
