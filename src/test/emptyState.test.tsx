import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../components/EmptyState'

describe('Animated Empty States (Stage 17a, 15.2)', () => {
  it('renders default icon when no illustration variant is provided', () => {
    const { container } = render(
      <EmptyState icon="info" title="Default Empty">
        Some helpful explanation.
      </EmptyState>
    )

    expect(screen.getByText('Default Empty')).toBeDefined()
    expect(screen.getByText('Some helpful explanation.')).toBeDefined()
    expect(container.querySelector('.empty__ill')).toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders notes contextual illustration variant with 96x96 viewBox', () => {
    const { container } = render(
      <EmptyState
        variant="notes"
        title="No notes yet"
        action={<button type="button">Create note</button>}
      >
        Write notes in lessons.
      </EmptyState>
    )

    expect(screen.getByText('No notes yet')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Create note' })).toBeDefined()

    const ill = container.querySelector('.empty-illustration--notes')
    expect(ill).not.toBeNull()
    expect(ill?.getAttribute('viewBox')).toBe('0 0 96 96')
    expect(ill?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders bookmarks contextual illustration variant', () => {
    const { container } = render(
      <EmptyState variant="bookmarks" title="No bookmarks yet" />
    )
    const ill = container.querySelector('.empty-illustration--bookmarks')
    expect(ill).not.toBeNull()
    expect(ill?.getAttribute('viewBox')).toBe('0 0 96 96')
  })

  it('renders review contextual illustration variant', () => {
    const { container } = render(
      <EmptyState variant="review" title="Review queue clear" />
    )
    const ill = container.querySelector('.empty-illustration--review')
    expect(ill).not.toBeNull()
    expect(ill?.getAttribute('viewBox')).toBe('0 0 96 96')
  })

  it('renders activity contextual illustration variant', () => {
    const { container } = render(
      <EmptyState variant="activity" title="No activity recorded" />
    )
    const ill = container.querySelector('.empty-illustration--activity')
    expect(ill).not.toBeNull()
    expect(ill?.getAttribute('viewBox')).toBe('0 0 96 96')
  })

  it('renders tracks contextual illustration variant', () => {
    const { container } = render(
      <EmptyState variant="tracks" title="No learning tracks available" />
    )
    const ill = container.querySelector('.empty-illustration--tracks')
    expect(ill).not.toBeNull()
    expect(ill?.getAttribute('viewBox')).toBe('0 0 96 96')
  })
})
