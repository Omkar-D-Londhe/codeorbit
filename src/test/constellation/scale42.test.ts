import { describe, it, expect } from 'vitest'
import { computeConstellationLayout } from '../../core/orbit/constellation/layout'
import { validateConstellation } from '../../core/orbit/constellation/validate'
import type { Topic } from '../../core/orbit/constellation/types'

describe('Stage 10b: 42-Node Fixture Scale & Performance', () => {
  // Generate 42 synthetic valid topics forming a linear DAG
  const topics42: Topic[] = Array.from({ length: 42 }, (_, i) => ({
    id: `scale-topic-${i + 1}`,
    title: `Scale Topic ${i + 1}`,
    shortTitle: `ST${i + 1}`,
    groupId: `group-${(i % 4) + 1}`,
    technologyId: 'scale-track',
    description: `Description for scale topic ${i + 1}`,
    prerequisiteIds: i > 0 ? [`scale-topic-${i}`] : [],
  }))

  it('passes validateConstellation for max 42 topics', () => {
    const issues = validateConstellation({ topics: topics42 })
    expect(issues).toHaveLength(0)
  })

  it('computes deterministic layout for 42 nodes within 50ms budget', () => {
    const t0 = performance.now()
    const layout = computeConstellationLayout(topics42, 'landscape')
    const t1 = performance.now()

    expect(t1 - t0).toBeLessThan(50)
    expect(layout.nodes).toHaveLength(42)
    expect(layout.edges).toHaveLength(41)

    // Node bounds are well-defined
    for (const node of layout.nodes) {
      expect(Number.isFinite(node.x)).toBe(true)
      expect(Number.isFinite(node.y)).toBe(true)
    }
  })

  it('maintains hub exclusion clearance on 42-node layout', () => {
    const layout = computeConstellationLayout(topics42, 'portrait')
    for (const node of layout.nodes) {
      const dist = Math.hypot(node.x - layout.hub.x, node.y - layout.hub.y)
      expect(dist).toBeGreaterThanOrEqual(layout.hub.r)
    }
  })
})
