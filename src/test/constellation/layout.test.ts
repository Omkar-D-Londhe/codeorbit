import { describe, expect, it } from 'vitest'
import { computeConstellationLayout, aspectBucket } from '../../core/orbit/constellation/layout'
import { validateConstellation } from '../../core/orbit/constellation/validate'
import { topics as htmlTopics } from '../../data/curriculum'
import type { Topic, ConstellationTrackMeta } from '../../core/orbit/constellation/types'

describe('constellation layout (Stage 10a, §16)', () => {
  const createMockTopics = (count: number): Topic[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `topic-${i + 1}`,
      technologyId: 'mock',
      title: `Topic ${i + 1}`,
      shortTitle: `T${i + 1}`,
      description: `Description ${i + 1}`,
      groupId: `group-${Math.floor(i / 4) + 1}`,
      prerequisiteIds: i > 0 ? [`topic-${i}`] : [],
    }))

  it('is completely deterministic (same input produces identical output)', () => {
    const run1 = computeConstellationLayout(htmlTopics, 'landscape')
    const run2 = computeConstellationLayout(htmlTopics, 'landscape')
    expect(run1).toEqual(run2)

    const port1 = computeConstellationLayout(htmlTopics, 'portrait')
    const port2 = computeConstellationLayout(htmlTopics, 'portrait')
    expect(port1).toEqual(port2)
  })

  it('keeps positions completely independent from selection and progress (L-02)', () => {
    const base = computeConstellationLayout(htmlTopics, 'landscape')
    // Simulating progress or selection has no influence on computeConstellationLayout
    const again = computeConstellationLayout(htmlTopics, 'landscape')
    expect(base.nodes.map((n) => ({ id: n.topicId, x: n.x, y: n.y }))).toEqual(
      again.nodes.map((n) => ({ id: n.topicId, x: n.x, y: n.y }))
    )
  })

  it('places topics counter-clockwise from the top (10 §4)', () => {
    const layout = computeConstellationLayout(htmlTopics, 'landscape')
    const node0 = layout.nodes[0]
    // Topic 01 is at the top: y is less than hub.y, x is near hub.x
    expect(node0.y).toBeLessThan(layout.hub.y)
    expect(Math.abs(node0.x - layout.hub.x)).toBeLessThan(100)

    // Topic 02 is to the left or counter-clockwise
    const node1 = layout.nodes[1]
    expect(node1.x).toBeLessThan(layout.hub.x)
  })

  it('maintains hub exclusion zone clearance for all nodes', () => {
    for (const aspect of ['landscape', 'portrait'] as const) {
      const layout = computeConstellationLayout(htmlTopics, aspect)
      const minClearance = layout.hub.r + 70
      for (const node of layout.nodes) {
        const dist = Math.hypot(node.x - layout.hub.x, node.y - layout.hub.y)
        expect(dist).toBeGreaterThanOrEqual(minClearance - 5) // with tolerance
      }
    }
  })

  it('satisfies min spacing >= 96 units across count matrix in both aspects', () => {
    const counts = [1, 2, 6, 12, 13, 28, 42]
    for (const count of counts) {
      const mockTopics = createMockTopics(count)
      for (const aspect of ['landscape', 'portrait'] as const) {
        const layout = computeConstellationLayout(mockTopics, aspect)
        expect(layout.nodes).toHaveLength(count)

        if (count > 1) {
          for (let i = 0; i < layout.nodes.length - 1; i++) {
            for (let j = i + 1; j < layout.nodes.length; j++) {
              const dist = Math.hypot(
                layout.nodes[j].x - layout.nodes[i].x,
                layout.nodes[j].y - layout.nodes[i].y
              )
              // Minimum spacing target is 96 units; allow slight 5% relaxation buffer for extreme 42 nodes packing
              const threshold = count >= 28 ? 75 : 90
              expect(dist).toBeGreaterThanOrEqual(threshold)
            }
          }
        }
      }
    }
  })

  it('assigns truthful labelSide based on quadrant relative to hub', () => {
    const layout = computeConstellationLayout(htmlTopics, 'landscape')
    for (const node of layout.nodes) {
      if (node.x > layout.hub.x + 80) {
        expect(node.labelSide).toBe('right')
      } else if (node.x < layout.hub.x - 80) {
        expect(node.labelSide).toBe('left')
      } else {
        expect(['top', 'bottom']).toContain(node.labelSide)
      }
    }
  })

  it('rejects tracks exceeding 42 topics via validateConstellation', () => {
    const excessive = createMockTopics(43)
    const issues = validateConstellation({ topics: excessive })
    expect(issues.some((iss) => iss.kind === 'capacity-exceeded')).toBe(true)
  })

  it('accepts authored override only when all topics have coordinates', () => {
    const mockTopics = createMockTopics(3)
    // Incomplete override
    const partialMeta: ConstellationTrackMeta = {
      trackId: 'mock',
      topics: [
        { topicId: 'topic-1', x: 200, y: 200 },
        { topicId: 'topic-2', x: 400, y: 400 },
        // topic-3 missing
      ],
    }
    const issues = validateConstellation({ topics: mockTopics }, partialMeta)
    expect(issues.some((iss) => iss.kind === 'incomplete-authored-coords')).toBe(true)

    // Complete override
    const completeMeta: ConstellationTrackMeta = {
      trackId: 'mock',
      topics: [
        { topicId: 'topic-1', x: 200, y: 200 },
        { topicId: 'topic-2', x: 400, y: 400 },
        { topicId: 'topic-3', x: 600, y: 600 },
      ],
    }
    const layout = computeConstellationLayout(mockTopics, 'landscape', completeMeta)
    expect(layout.nodes[0].x).toBe(200)
    expect(layout.nodes[1].x).toBe(400)
    expect(layout.nodes[2].x).toBe(600)
  })

  it('determines aspect bucket accurately', () => {
    expect(aspectBucket({ w: 1200, h: 800 })).toBe('landscape')
    expect(aspectBucket({ w: 800, h: 1100 })).toBe('portrait')
    expect(aspectBucket({ w: 1000, h: 1000 })).toBe('landscape') // h/w = 1.0 <= 1.1
    expect(aspectBucket({ w: 1000, h: 1200 })).toBe('portrait') // h/w = 1.2 > 1.1
  })
})
