import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { OrbitTrail } from '../../core/orbit/constellation/OrbitTrail'
import type { LayoutNode } from '../../core/orbit/constellation/types'

vi.mock('../../core/atmosphere/useMotionAllowed', () => ({
  useMotionAllowed: vi.fn(() => true),
}))

import { useMotionAllowed } from '../../core/atmosphere/useMotionAllowed'

describe('Catalog 2.2: Orbital Trail on Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMotionAllowed).mockReturnValue(true)
  })

  const nodeA: LayoutNode = {
    topicId: 'topic-0',
    index: 0,
    x: 100,
    y: 100,
    angle: 0,
    groupId: 'g1',
    labelSide: 'top',
  }

  const nodeBAdjacent: LayoutNode = {
    topicId: 'topic-1',
    index: 1,
    x: 150,
    y: 120,
    angle: 0.5,
    groupId: 'g1',
    labelSide: 'right',
  }

  const nodeCNonAdjacent: LayoutNode = {
    topicId: 'topic-4',
    index: 4,
    x: 300,
    y: 250,
    angle: 2.0,
    groupId: 'g2',
    labelSide: 'bottom',
  }

  it('does NOT render trail when fromNode is absent (initial mount)', () => {
    const { container } = render(
      <svg>
        <OrbitTrail fromNode={null} toNode={nodeA} hubX={200} hubY={200} />
      </svg>
    )

    expect(container.querySelector('.orbit-trail-path')).toBeNull()
  })

  it('does NOT render trail on adjacent navigation (|index diff| <= 1)', () => {
    const { container } = render(
      <svg>
        <OrbitTrail fromNode={nodeA} toNode={nodeBAdjacent} hubX={200} hubY={200} />
      </svg>
    )

    expect(container.querySelector('.orbit-trail-path')).toBeNull()
  })

  it('renders curved Bézier trail path on non-adjacent navigation (|index diff| > 1)', () => {
    const { container } = render(
      <svg>
        <OrbitTrail fromNode={nodeA} toNode={nodeCNonAdjacent} hubX={200} hubY={200} />
      </svg>
    )

    const path = container.querySelector('.orbit-trail-path')
    expect(path).not.toBeNull()
    const d = path?.getAttribute('d')
    expect(d).toMatch(/^M [\d.]+ [\d.]+ Q [\d.]+ [\d.]+ [\d.]+ [\d.]+$/)
  })

  it('does NOT render trail when reduced motion is preferred', () => {
    vi.mocked(useMotionAllowed).mockReturnValue(false)

    const { container } = render(
      <svg>
        <OrbitTrail fromNode={nodeA} toNode={nodeCNonAdjacent} hubX={200} hubY={200} />
      </svg>
    )

    expect(container.querySelector('.orbit-trail-path')).toBeNull()
  })
})
