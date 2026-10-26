import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MiniConstellation } from '../../core/orbit/constellation/MiniConstellation'

vi.mock('../../data/curriculum', () => ({
  topicsFor: vi.fn((techId: string) => {
    if (techId === 'unknown') return []
    return [
      { id: 't1', title: 'Topic 1', technologyId: 'test-tech', description: '', prerequisiteIds: [] },
      { id: 't2', title: 'Topic 2', technologyId: 'test-tech', description: '', prerequisiteIds: [] },
      { id: 't3', title: 'Topic 3', technologyId: 'test-tech', description: '', prerequisiteIds: [] },
    ]
  }),
}))

describe('Catalog 2.7: Mini Constellation Preview in Header', () => {
  it('renders 48x48 mini constellation linking back to the track', () => {
    render(
      <MemoryRouter>
        <MiniConstellation technologyId="test-tech" topicId="t2" />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /topic 2 of 3 on learning orbit map/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/learn/test-tech')

    const svg = link.querySelector('svg')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
  })

  it('highlights the current active topic star', () => {
    const { container } = render(
      <MemoryRouter>
        <MiniConstellation technologyId="test-tech" topicId="t2" />
      </MemoryRouter>
    )

    const activeStar = container.querySelector('.mini-star--active')
    expect(activeStar).not.toBeNull()
    expect(activeStar?.getAttribute('r')).toBe('3.5')
  })

  it('returns null when no topics exist for the technology', () => {
    const { container } = render(
      <MemoryRouter>
        <MiniConstellation technologyId="unknown" topicId="none" />
      </MemoryRouter>
    )

    expect(container.firstChild).toBeNull()
  })
})
