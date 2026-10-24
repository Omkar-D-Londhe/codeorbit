/**
 * Learning Orbit geometry — pure functions, no DOM.
 *
 * The orbit is the UPPER half of an ellipse: ends sit on the baseline, the centre is highest
 * (a hill / rainbow, ∩). In SVG's y-down space that means y is smallest at the centre.
 * Nodes are spaced at equal ARC LENGTH so spacing is even, and positions depend only on
 * (ids in canonical order, width) — never on the selection.
 */

export const NODE_SIZE = 44
export const LABEL_WIDTH = 92
export const LABEL_HEIGHT = 34
/** Minimum centre-to-centre spacing for a usable touch target plus a comfortable gap. */
export const MIN_NODE_SPACING = NODE_SIZE + 12

export type OrbitMode = 'arch' | 'arch-compact' | 'carousel'

export interface OrbitNode {
  id: string
  index: number
  x: number
  y: number
}

export interface OrbitLayout {
  width: number
  height: number
  cx: number
  rx: number
  ry: number
  baseline: number
  nodes: OrbitNode[]
  /** SVG path for the arc itself (upper half ellipse, left → right over the top). */
  arcPath: string
}

const SAMPLES = 1024

export function orbitHeightFor(width: number): number {
  return Math.round(Math.min(Math.max(width * 0.42, 300), 440))
}

/** Ellipse point at angle t ∈ [0, π]: t=π is the left end, t=π/2 the apex, t=0 the right end. */
function pointAt(cx: number, baseline: number, rx: number, ry: number, t: number): { x: number; y: number } {
  return { x: cx + rx * Math.cos(t), y: baseline - ry * Math.sin(t) }
}

export function computeOrbitLayout(ids: readonly string[], width: number, height = orbitHeightFor(width)): OrbitLayout {
  const padX = LABEL_WIDTH / 2 + 6
  const padTop = NODE_SIZE / 2 + 10
  const padBottom = NODE_SIZE / 2 + LABEL_HEIGHT + 4
  const cx = width / 2
  const baseline = height - padBottom
  const rx = Math.max(10, width / 2 - padX)
  const ry = Math.max(10, baseline - padTop)

  // Cumulative arc length from the LEFT end (t = π) to the RIGHT end (t = 0).
  const ts: number[] = []
  const cum: number[] = [0]
  let prev = pointAt(cx, baseline, rx, ry, Math.PI)
  ts.push(Math.PI)
  for (let i = 1; i <= SAMPLES; i++) {
    const t = Math.PI - (Math.PI * i) / SAMPLES
    const p = pointAt(cx, baseline, rx, ry, t)
    cum.push(cum[i - 1] + Math.hypot(p.x - prev.x, p.y - prev.y))
    ts.push(t)
    prev = p
  }
  const total = cum[SAMPLES]

  const n = ids.length
  const nodes: OrbitNode[] = ids.map((id, index) => {
    const target = n === 1 ? total / 2 : (total * index) / (n - 1)
    let lo = 0
    let hi = SAMPLES
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cum[mid] < target) lo = mid + 1
      else hi = mid
    }
    const i1 = Math.max(1, lo)
    const span = cum[i1] - cum[i1 - 1] || 1
    const f = (target - cum[i1 - 1]) / span
    const t = ts[i1 - 1] + (ts[i1] - ts[i1 - 1]) * f
    const p = pointAt(cx, baseline, rx, ry, t)
    return { id, index, x: round(p.x), y: round(p.y) }
  })

  const arcPath = `M ${round(cx - rx)} ${round(baseline)} A ${round(rx)} ${round(ry)} 0 0 1 ${round(cx + rx)} ${round(baseline)}`
  return { width, height, cx, rx, ry, baseline, nodes, arcPath }
}

const round = (v: number): number => Math.round(v * 100) / 100

export interface Box { left: number; top: number; right: number; bottom: number }

export const nodeBox = (n: OrbitNode): Box => ({
  left: n.x - NODE_SIZE / 2, right: n.x + NODE_SIZE / 2, top: n.y - NODE_SIZE / 2, bottom: n.y + NODE_SIZE / 2,
})
export const labelBox = (n: OrbitNode): Box => ({
  left: n.x - LABEL_WIDTH / 2, right: n.x + LABEL_WIDTH / 2, top: n.y + NODE_SIZE / 2, bottom: n.y + NODE_SIZE / 2 + LABEL_HEIGHT,
})
export const boxesOverlap = (a: Box, b: Box): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

/** Smallest centre-to-centre distance between any two nodes. */
export function minNodeDistance(layout: OrbitLayout): number {
  let min = Infinity
  const ns = layout.nodes
  for (let i = 0; i < ns.length; i++)
    for (let j = i + 1; j < ns.length; j++) min = Math.min(min, Math.hypot(ns[i].x - ns[j].x, ns[i].y - ns[j].y))
  return min
}

/** True when any node/label box collides with another node's or label's box. */
export function hasLabelCollisions(layout: OrbitLayout): boolean {
  const boxes = layout.nodes.flatMap((n) => [nodeBox(n), labelBox(n)])
  const owner = (i: number) => Math.floor(i / 2)
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++)
      if (owner(i) !== owner(j) && boxesOverlap(boxes[i], boxes[j])) return true
  return false
}

/**
 * Derive the display mode from the geometry itself (not a magic breakpoint):
 *  - touch targets would crowd → carousel fallback
 *  - labels would collide → arch with labels only on the selected node
 *  - otherwise → full arch with all labels
 */
export function chooseOrbitMode(ids: readonly string[], width: number): OrbitMode {
  if (ids.length < 2) return 'arch'
  const layout = computeOrbitLayout(ids, width)
  if (minNodeDistance(layout) < MIN_NODE_SPACING) return 'carousel'
  return hasLabelCollisions(layout) ? 'arch-compact' : 'arch'
}

/** Curved connector between two nodes, bowed toward the arch interior so it never crosses the rim. */
export function edgePath(layout: OrbitLayout, fromId: string, toId: string): string | null {
  const a = layout.nodes.find((n) => n.id === fromId)
  const b = layout.nodes.find((n) => n.id === toId)
  if (!a || !b) return null
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const pull = 0.22
  const qx = mx + (layout.cx - mx) * pull
  const qy = my + (layout.baseline - my) * pull
  return `M ${a.x} ${a.y} Q ${round(qx)} ${round(qy)} ${b.x} ${b.y}`
}
