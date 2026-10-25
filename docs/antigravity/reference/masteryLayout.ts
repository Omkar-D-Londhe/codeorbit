/**
 * Mastery map layout — pure and deterministic.
 * Columns are prerequisite DEPTH (longest chain of real prerequisites leading to a topic); rows follow
 * curriculum order within a column. Every node has the same size: ability is never encoded as size
 * or distance, and every edge comes from declared prerequisite data.
 */
export interface MasteryTopicInput { id: string; prerequisiteIds: readonly string[] }
export interface MasteryNode { id: string; depth: number; row: number; x: number; y: number }
export interface MasteryEdge { from: string; to: string; d: string }
export interface MasteryLayout {
  width: number
  height: number
  nodeW: number
  nodeH: number
  columns: number
  nodes: MasteryNode[]
  edges: MasteryEdge[]
}

export const MASTERY_NODE_H = 56
const ROW_GAP = 16
const PAD = 12

export function topicDepths(topics: readonly MasteryTopicInput[]): Map<string, number> {
  const byId = new Map(topics.map((t) => [t.id, t]))
  const memo = new Map<string, number>()
  const visiting = new Set<string>()
  const depth = (id: string): number => {
    const cached = memo.get(id)
    if (cached !== undefined) return cached
    if (visiting.has(id)) throw new Error(`Prerequisite cycle at ${id}`)
    visiting.add(id)
    const t = byId.get(id)
    const d = t && t.prerequisiteIds.length > 0 ? 1 + Math.max(...t.prerequisiteIds.filter((p) => byId.has(p)).map(depth), -1) : 0
    visiting.delete(id)
    memo.set(id, d)
    return d
  }
  topics.forEach((t) => depth(t.id))
  return memo
}

export function computeMasteryLayout(topics: readonly MasteryTopicInput[], width: number, nodeW = 176): MasteryLayout {
  const depths = topicDepths(topics)
  const columns = Math.max(0, ...Array.from(depths.values())) + 1
  const colGap = columns > 1 ? Math.max(24, (width - 2 * PAD - nodeW) / (columns - 1)) : 0
  const rowCounters = new Array<number>(columns).fill(0)
  const nodes: MasteryNode[] = topics.map((t) => {
    const depth = depths.get(t.id)!
    const row = rowCounters[depth]++
    return { id: t.id, depth, row, x: Math.round(PAD + depth * colGap), y: PAD + row * (MASTERY_NODE_H + ROW_GAP) }
  })
  const maxRows = Math.max(1, ...rowCounters)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const edges: MasteryEdge[] = topics.flatMap((t) =>
    t.prerequisiteIds.flatMap((p) => {
      const a = byId.get(p)
      const b = byId.get(t.id)
      if (!a || !b) return []
      const x1 = a.x + nodeW, y1 = a.y + MASTERY_NODE_H / 2, x2 = b.x, y2 = b.y + MASTERY_NODE_H / 2
      const mx = (x1 + x2) / 2
      return [{ from: p, to: t.id, d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}` }]
    }),
  )
  return { width, height: PAD * 2 + maxRows * MASTERY_NODE_H + (maxRows - 1) * ROW_GAP, nodeW, nodeH: MASTERY_NODE_H, columns, nodes, edges }
}
