import { describe, it, expect } from 'vitest'
import {
  computeForceLayout,
  FORCE_NODE_W,
  FORCE_NODE_H,
  DEFAULT_FORCE_ITERATIONS,
  type ForceTopicInput,
  type ForceLayout,
} from '../core/orbit/forceLayout'
import { topics } from '../data/curriculum'

describe('Deterministic Force Layout Engine (Stage 15b, 11.1)', () => {
  it('identical input and seed produce bit-exact identical coordinates and edge output', () => {
    const layout1 = computeForceLayout(topics, 1000)
    const layout2 = computeForceLayout(topics, 1000)

    expect(layout1).toEqual(layout2)
    expect(layout1.nodes.length).toBe(topics.length)
    expect(layout1.edges.length).toBeGreaterThan(0)
  })

  it('different seeds produce different valid layouts while preserving determinism', () => {
    const layoutA1 = computeForceLayout(topics, 900, { seed: 12345 })
    const layoutA2 = computeForceLayout(topics, 900, { seed: 12345 })
    const layoutB = computeForceLayout(topics, 900, { seed: 98765 })

    expect(layoutA1).toEqual(layoutA2)
    // Nodes should have different coordinates with different seeds
    const diff = layoutA1.nodes.some(
      (n, i) => n.x !== layoutB.nodes[i].x || n.y !== layoutB.nodes[i].y
    )
    expect(diff).toBe(true)
  })

  it('runs exactly 200 fixed iterations by default', () => {
    const layout = computeForceLayout(topics, 800)
    expect(layout.iterations).toBe(DEFAULT_FORCE_ITERATIONS)
    expect(layout.iterations).toBe(200)

    const custom = computeForceLayout(topics, 800, { iterations: 100 })
    expect(custom.iterations).toBe(100)
  })

  it('emits ONLY declared prerequisite edges, with correct direction from prereq to dependent', () => {
    const layout = computeForceLayout(topics, 900)
    const topicMap = new Map(topics.map((t) => [t.id, t]))

    const declaredEdges = topics.flatMap((t) =>
      (t.prerequisiteIds || [])
        .filter((p) => topicMap.has(p))
        .map((p) => ({ from: p, to: t.id }))
    )

    expect(layout.edges.length).toBe(declaredEdges.length)

    for (const edge of layout.edges) {
      const targetTopic = topicMap.get(edge.to)
      expect(targetTopic).toBeDefined()
      expect(targetTopic?.prerequisiteIds).toContain(edge.from)
      expect(edge.d).toMatch(/^M [\d.]+ [\d.]+ L [\d.]+ [\d.]+$/)
    }
  })

  it('safely handles missing/ghost prerequisite IDs without throwing or generating phantom edges', () => {
    const withMissing: ForceTopicInput[] = [
      { id: 't1', prerequisiteIds: ['ghost-id-999'] },
      { id: 't2', prerequisiteIds: ['t1', 'non-existent'] },
    ]

    const layout = computeForceLayout(withMissing, 800)
    expect(layout.nodes.length).toBe(2)
    expect(layout.edges.length).toBe(1)
    expect(layout.edges[0]).toEqual({
      from: 't1',
      to: 't2',
      d: expect.stringMatching(/^M /),
    })
  })

  it('tolerates prerequisite cycles gracefully without hanging or throwing', () => {
    const cyclic: ForceTopicInput[] = [
      { id: 'a', prerequisiteIds: ['b'] },
      { id: 'b', prerequisiteIds: ['c'] },
      { id: 'c', prerequisiteIds: ['a'] },
    ]

    expect(() => computeForceLayout(cyclic, 800)).not.toThrow()
    const layout = computeForceLayout(cyclic, 800)
    expect(layout.nodes.length).toBe(3)
    expect(layout.edges.length).toBe(3)
  })

  it('clamps all node rectangles strictly within container boundaries', () => {
    const width = 800
    const height = 600
    const layout = computeForceLayout(topics, width, { height })

    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(16)
      expect(node.x + FORCE_NODE_W).toBeLessThanOrEqual(width - 16)
      expect(node.y).toBeGreaterThanOrEqual(16)
      expect(node.y + FORCE_NODE_H).toBeLessThanOrEqual(height - 16)
    }
  })

  it('respects pinned positions throughout the simulation', () => {
    const pinned = {
      'html-structure': { x: 120, y: 150 },
      'forms': { x: 400, y: 350 },
    }

    const layout = computeForceLayout(topics, 1000, { pinnedPositions: pinned })

    const node1 = layout.nodes.find((n) => n.id === 'html-structure')!
    const node2 = layout.nodes.find((n) => n.id === 'forms')!
    const nodeUnpinned = layout.nodes.find((n) => n.id === 'text-semantics')!

    expect(node1.x).toBe(120)
    expect(node1.y).toBe(150)
    expect(node1.pinned).toBe(true)

    expect(node2.x).toBe(400)
    expect(node2.y).toBe(350)
    expect(node2.pinned).toBe(true)

    expect(nodeUnpinned.pinned).toBe(false)
  })

  it('handles empty and small graphs safely', () => {
    const emptyLayout = computeForceLayout([], 800)
    expect(emptyLayout.nodes).toEqual([])
    expect(emptyLayout.edges).toEqual([])

    const singleLayout = computeForceLayout([{ id: 'single' }], 800)
    expect(singleLayout.nodes.length).toBe(1)
    expect(singleLayout.edges.length).toBe(0)
  })

  it('repeated invocations do not mutate inputs or accumulate hidden state', () => {
    const inputs: ForceTopicInput[] = [
      { id: 'a', prerequisiteIds: ['b'] },
      { id: 'b', prerequisiteIds: [] },
    ]
    const originalPrereqs = [...(inputs[0].prerequisiteIds || [])]

    computeForceLayout(inputs, 800)
    computeForceLayout(inputs, 800)

    expect(inputs[0].prerequisiteIds).toEqual(originalPrereqs)
  })

  it('completes 200 iterations for 60 nodes in under 20 ms (performance budget)', () => {
    // Generate synthetic 60-topic graph
    const synthTopics: ForceTopicInput[] = []
    for (let i = 0; i < 60; i++) {
      const prereqs: string[] = []
      if (i > 0) prereqs.push(`topic-${i - 1}`)
      if (i > 3) prereqs.push(`topic-${i - 3}`)
      synthTopics.push({
        id: `topic-${i}`,
        prerequisiteIds: prereqs,
      })
    }

    // Warmup so JIT optimizes numeric simulation loop
    computeForceLayout(synthTopics, 1200, { iterations: 200 })

    // Measure best of 3 runs to avoid parallel worker thread scheduling jitter
    let minElapsed = Infinity
    let layout: ForceLayout | null = null
    for (let r = 0; r < 3; r++) {
      const start = performance.now()
      layout = computeForceLayout(synthTopics, 1200, { iterations: 200 })
      const elapsed = performance.now() - start
      if (elapsed < minElapsed) minElapsed = elapsed
    }

    expect(layout).not.toBeNull()
    expect(layout?.nodes.length).toBe(60)
    expect(layout?.iterations).toBe(200)
    // Must be under 20 ms
    expect(minElapsed).toBeLessThan(20)
  })
})
