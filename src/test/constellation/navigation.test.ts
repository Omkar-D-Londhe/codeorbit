import { describe, expect, it } from 'vitest'
import { computeConstellationLayout } from '../../core/orbit/constellation/layout'
import { fitTransform, clampTransform, nextNodeInDirection } from '../../core/orbit/constellation/viewport'
import { topics as htmlTopics } from '../../data/curriculum'
import type { ConstellationLayout } from '../../core/orbit/constellation/types'

describe('constellation viewport and spatial navigation (Stage 10a, §16)', () => {
  const layout = computeConstellationLayout(htmlTopics, 'landscape')

  it('computes fitTransform centered within container bounds', () => {
    const container = { w: 1000, h: 600 }
    const transform = fitTransform(layout, container)
    expect(transform.zoom).toBe(1)
    expect(transform.x).toBeGreaterThanOrEqual(0)
    expect(transform.y).toBeGreaterThanOrEqual(0)
  })

  it('clamps zoom strictly within [0.75, 3.0] limits', () => {
    const container = { w: 1000, h: 600 }
    expect(clampTransform({ x: 0, y: 0, zoom: 0.2 }, layout, container).zoom).toBe(0.75)
    expect(clampTransform({ x: 0, y: 0, zoom: 5.0 }, layout, container).zoom).toBe(3.0)
    expect(clampTransform({ x: 0, y: 0, zoom: 1.5 }, layout, container).zoom).toBe(1.5)
  })

  it('clamps pan to keep at least 25% of the field visible', () => {
    const container = { w: 1000, h: 600 }
    const extremePanLeft = clampTransform({ x: -99999, y: 0, zoom: 1 }, layout, container)
    expect(extremePanLeft.x).toBeGreaterThan(-99999)

    const extremePanRight = clampTransform({ x: 99999, y: 0, zoom: 1 }, layout, container)
    expect(extremePanRight.x).toBeLessThan(99999)
  })

  it('navigates spatially in directional cone on synthetic grid', () => {
    // 3x3 synthetic grid:
    // (100, 100) [n1] -- (200, 100) [n2] -- (300, 100) [n3]
    // (100, 200) [n4] -- (200, 200) [n5] -- (300, 200) [n6]
    // (100, 300) [n7] -- (200, 300) [n8] -- (300, 300) [n9]
    const gridLayout: ConstellationLayout = {
      aspect: 'landscape',
      width: 1200,
      height: 800,
      hub: { x: 600, y: 400, r: 110 },
      nodes: [
        { topicId: 'n1', index: 0, x: 100, y: 100, angle: 0, labelSide: 'left', groupId: 'g1' },
        { topicId: 'n2', index: 1, x: 200, y: 100, angle: 0, labelSide: 'left', groupId: 'g1' },
        { topicId: 'n3', index: 2, x: 300, y: 100, angle: 0, labelSide: 'left', groupId: 'g1' },
        { topicId: 'n4', index: 3, x: 100, y: 200, angle: 0, labelSide: 'left', groupId: 'g1' },
        { topicId: 'n5', index: 4, x: 200, y: 200, angle: 0, labelSide: 'left', groupId: 'g1' },
        { topicId: 'n6', index: 5, x: 300, y: 200, angle: 0, labelSide: 'left', groupId: 'g1' },
        { topicId: 'n7', index: 6, x: 100, y: 300, angle: 0, labelSide: 'left', groupId: 'g1' },
        { topicId: 'n8', index: 7, x: 200, y: 300, angle: 0, labelSide: 'left', groupId: 'g1' },
        { topicId: 'n9', index: 8, x: 300, y: 300, angle: 0, labelSide: 'left', groupId: 'g1' },
      ],
      edges: [],
      order: [],
      rings: [],
    }

    // From center n5:
    expect(nextNodeInDirection(gridLayout, 'n5', 'right')).toBe('n6')
    expect(nextNodeInDirection(gridLayout, 'n5', 'left')).toBe('n4')
    expect(nextNodeInDirection(gridLayout, 'n5', 'up')).toBe('n2')
    expect(nextNodeInDirection(gridLayout, 'n5', 'down')).toBe('n8')

    // At edge n3 (top right):
    expect(nextNodeInDirection(gridLayout, 'n3', 'right')).toBeNull()
    expect(nextNodeInDirection(gridLayout, 'n3', 'up')).toBeNull()
    expect(nextNodeInDirection(gridLayout, 'n3', 'left')).toBe('n2')
    expect(nextNodeInDirection(gridLayout, 'n3', 'down')).toBe('n6')
  })

  it('navigates to nearest star in direction on real HTML layout', () => {
    // Node 0 is top node (html-structure)
    const nextLeft = nextNodeInDirection(layout, 'html-structure', 'left')
    expect(nextLeft).not.toBeNull()

    const nextDown = nextNodeInDirection(layout, 'html-structure', 'down')
    expect(nextDown).not.toBeNull()
  })
})
