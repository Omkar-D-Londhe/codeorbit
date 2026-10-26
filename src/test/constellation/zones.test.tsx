import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ZoneHalos } from '../../core/orbit/constellation/ZoneHalos'
import { computeConstellationLayout } from '../../core/orbit/constellation/layout'
import type { TopicGroup, LayoutNode, Topic } from '../../core/orbit/constellation/types'

describe('Catalog 2.4: Topic Group Zones & Halos', () => {
  const mockGroups: TopicGroup[] = [
    { id: 'group-1', title: 'Fundamentals' },
    { id: 'group-2', title: 'Advanced Concepts' },
  ]

  const mockNodes: LayoutNode[] = [
    { topicId: 'top-1', groupId: 'group-1', index: 0, x: 100, y: 100, angle: 0, labelSide: 'top' },
    { topicId: 'top-2', groupId: 'group-1', index: 1, x: 160, y: 120, angle: 0.5, labelSide: 'right' },
    { topicId: 'top-3', groupId: 'group-2', index: 2, x: 300, y: 300, angle: 2.0, labelSide: 'bottom' },
  ]

  it('star position equality invariant: zone computation does not modify layout coordinates', () => {
    const mockTopics: Topic[] = [
      { id: 't1', title: 'T1', shortTitle: 'T1', technologyId: 'test', description: '', prerequisiteIds: [], groupId: 'group-1' },
      { id: 't2', title: 'T2', shortTitle: 'T2', technologyId: 'test', description: '', prerequisiteIds: [], groupId: 'group-1' },
      { id: 't3', title: 'T3', shortTitle: 'T3', technologyId: 'test', description: '', prerequisiteIds: [], groupId: 'group-2' },
    ]

    const layout = computeConstellationLayout(mockTopics, 'landscape')
    const originalPositions = layout.nodes.map((n) => ({ topicId: n.topicId, x: n.x, y: n.y }))

    // Render ZoneHalos with the layout nodes
    const onSelect = vi.fn()
    render(
      <svg>
        <ZoneHalos groups={mockGroups} nodes={layout.nodes} onSelectTopic={onSelect} />
      </svg>
    )

    // Verify node positions in layout were completely untouched (pure and immutable)
    const afterPositions = layout.nodes.map((n) => ({ topicId: n.topicId, x: n.x, y: n.y }))
    expect(afterPositions).toEqual(originalPositions)
  })

  it('renders zone badge buttons with accessible names', () => {
    const onSelect = vi.fn()
    render(
      <svg>
        <ZoneHalos groups={mockGroups} nodes={mockNodes} onSelectTopic={onSelect} />
      </svg>
    )

    const badge1 = screen.getByRole('button', { name: /fundamentals zone/i })
    const badge2 = screen.getByRole('button', { name: /advanced concepts zone/i })
    expect(badge1).toBeInTheDocument()
    expect(badge2).toBeInTheDocument()
  })

  it('clicking zone badge calls onSelectTopic with the first topic in the group', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <svg>
        <ZoneHalos groups={mockGroups} nodes={mockNodes} onSelectTopic={onSelect} />
      </svg>
    )

    const badge1 = screen.getByRole('button', { name: /fundamentals zone/i })
    await user.click(badge1)
    expect(onSelect).toHaveBeenCalledWith('top-1')

    const badge2 = screen.getByRole('button', { name: /advanced concepts zone/i })
    await user.click(badge2)
    expect(onSelect).toHaveBeenCalledWith('top-3')
  })
})
