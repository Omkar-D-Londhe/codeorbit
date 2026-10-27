import { describe, it, expect } from 'vitest'
import { computeMasteryLayout, topicDepths, type MasteryTopicInput } from '../core/orbit/masteryLayout'
import { topics } from '../data/curriculum'

describe('Mastery Layout Engine (REF-01)', () => {
  const layout = computeMasteryLayout(topics, 900)

  it('derives depth from real prerequisites only', () => {
    const d = topicDepths(topics)
    expect(d.get('html-structure')).toBe(0)
    expect(d.get('elements-attributes')).toBe(1)
    expect(d.get('semantic-layout')).toBe(2)
  })

  it('is stable and keeps canonical order within a level', () => {
    expect(computeMasteryLayout(topics, 900)).toEqual(layout)
    const lvl2 = layout.nodes.filter((n) => n.depth === 2).map((n) => n.id)
    expect(lvl2).toEqual(topics.filter((t) => lvl2.includes(t.id)).map((t) => t.id))
  })

  it('never overlaps nodes and keeps every node inside the bounds', () => {
    layout.nodes.forEach((a, i) => {
      expect(a.x).toBeGreaterThanOrEqual(0)
      expect(a.y).toBeGreaterThanOrEqual(0)
      expect(a.x + layout.nodeW).toBeLessThanOrEqual(layout.width)
      expect(a.y + layout.nodeH).toBeLessThanOrEqual(layout.height)

      layout.nodes.slice(i + 1).forEach((b) => {
        const overlapX = a.x < b.x + layout.nodeW && a.x + layout.nodeW > b.x
        const overlapY = a.y < b.y + layout.nodeH && a.y + layout.nodeH > b.y
        expect(overlapX && overlapY).toBe(false)
      })
    })
  })

  it('every edge connects a prerequisite to its dependent', () => {
    const byId = new Map(topics.map((t) => [t.id, t]))
    layout.edges.forEach((e) => {
      const target = byId.get(e.to)!
      expect(target.prerequisiteIds).toContain(e.from)
      expect(e.d).toMatch(/^M [\d.]+ [\d.]+ C [\d.]+ [\d.]+, [\d.]+ [\d.]+, [\d.]+ [\d.]+$/)
    })
  })

  it('leaves no node outside its level column', () => {
    layout.nodes.forEach((n) => {
      const sameDepth = layout.nodes.filter((o) => o.depth === n.depth)
      sameDepth.forEach((o) => expect(o.x).toBe(n.x))
    })
  })

  it('handles 0-prerequisite graphs cleanly', () => {
    const flat: MasteryTopicInput[] = [
      { id: 'a', prerequisiteIds: [] },
      { id: 'b', prerequisiteIds: [] },
      { id: 'c', prerequisiteIds: [] },
    ]
    const l = computeMasteryLayout(flat, 600)
    expect(l.columns).toBe(1)
    expect(l.maxDepth).toBe(0)
    expect(l.edges).toHaveLength(0)
    expect(l.nodes).toHaveLength(3)
    l.nodes.forEach((n, idx) => {
      expect(n.depth).toBe(0)
      expect(n.row).toBe(idx)
    })
  })

  it('safely ignores missing prerequisite IDs without creating phantom edges or crashing', () => {
    const withMissing: MasteryTopicInput[] = [
      { id: 'root', prerequisiteIds: [] },
      { id: 'child', prerequisiteIds: ['root', 'non-existent-topic', 'another-ghost'] },
    ]
    const depths = topicDepths(withMissing)
    expect(depths.get('root')).toBe(0)
    expect(depths.get('child')).toBe(1)

    const l = computeMasteryLayout(withMissing, 600)
    expect(l.nodes).toHaveLength(2)
    expect(l.edges).toHaveLength(1)
    expect(l.edges[0]).toEqual({
      from: 'root',
      to: 'child',
      d: expect.stringMatching(/^M \d+ \d+ C/),
    })
  })

  it('throws a descriptive error when a prerequisite cycle is detected', () => {
    const cyclic: MasteryTopicInput[] = [
      { id: 'node-a', prerequisiteIds: ['node-c'] },
      { id: 'node-b', prerequisiteIds: ['node-a'] },
      { id: 'node-c', prerequisiteIds: ['node-b'] },
    ]
    expect(() => topicDepths(cyclic)).toThrowError(/Prerequisite cycle at node-/)
  })

  it('produces 100% stable coordinates across repeated computations', () => {
    const run1 = computeMasteryLayout(topics, 1200)
    const run2 = computeMasteryLayout(topics, 1200)
    expect(run1).toEqual(run2)
  })
})
