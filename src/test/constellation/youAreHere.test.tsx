import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Star } from '../../core/orbit/constellation/Star'
import type { LayoutNode, NodeView } from '../../core/orbit/constellation/types'

describe('Catalog 2.6: You Are Here / Last Visited Indicator', () => {
  const node: LayoutNode = {
    topicId: 'topic-intro',
    index: 0,
    x: 100,
    y: 100,
    angle: 0,
    groupId: 'g1',
    labelSide: 'top',
  }

  const view: NodeView = {
    topicId: 'topic-intro',
    state: 'in-progress',
    status: 'in-progress',
    parts: 1,
    partsTotal: 3,
    missingPrerequisiteIds: [],
    selected: false,
  }

  it('renders beacon and includes accessible announcement when isLastVisited is true', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <Star
        node={node}
        view={view}
        topicTitle="Introduction"
        isLastVisited={true}
        onSelect={onSelect}
      />
    )

    const beacon = container.querySelector('.constellation-star__here-beacon')
    expect(beacon).not.toBeNull()

    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')).toContain('Last visited (you are here)')
  })

  it('does NOT render beacon or mention last visited when isLastVisited is false', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <Star
        node={node}
        view={view}
        topicTitle="Introduction"
        isLastVisited={false}
        onSelect={onSelect}
      />
    )

    const beacon = container.querySelector('.constellation-star__here-beacon')
    expect(beacon).toBeNull()

    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')).not.toContain('Last visited')
  })
})
