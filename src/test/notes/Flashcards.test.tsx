import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Flashcards } from '../../core/learning/Flashcards'
import type { ErrorEntry } from '../../state/types'

const sampleEntries: ErrorEntry[] = [
  {
    id: 'err-1',
    topicId: 'html-structure',
    source: 'quiz',
    refId: 'q-1',
    title: 'Which tag is root?',
    detail: 'Use the <html> tag to wrap all elements.',
    code: '<!DOCTYPE html><html></html>',
    status: 'open',
    createdAt: Date.now() - 1000,
  },
  {
    id: 'err-2',
    topicId: 'links',
    source: 'challenge',
    refId: 'ch-links',
    title: 'Missing href attribute',
    detail: 'The <a> tag requires an href attribute.',
    code: '<a target="_blank">Click</a>',
    status: 'understood',
    createdAt: Date.now() - 500,
  },
]

describe('Flashcards Component', () => {
  it('renders card progress and initial question on the front', () => {
    const onStatusChange = vi.fn()
    render(
      <MemoryRouter>
        <Flashcards entries={sampleEntries} onStatusChange={onStatusChange} />
      </MemoryRouter>
    )

    expect(screen.getByText('Card 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Which tag is root?')).toBeInTheDocument()
    expect(screen.getByText(/Quiz Question/i)).toBeInTheDocument()
    expect(screen.getByText(/Click anywhere or press/i)).toBeInTheDocument()
    expect(screen.queryByText('Use the <html> tag to wrap all elements.')).not.toBeInTheDocument()
  })

  it('flips to back showing detail and code when clicked or Space is pressed', () => {
    const onStatusChange = vi.fn()
    render(
      <MemoryRouter>
        <Flashcards entries={sampleEntries} onStatusChange={onStatusChange} />
      </MemoryRouter>
    )

    // Flip by pressing Space
    fireEvent.keyDown(window, { code: 'Space' })
    expect(screen.getByText('Use the <html> tag to wrap all elements.')).toBeInTheDocument()
    expect(screen.getByText('<!DOCTYPE html><html></html>')).toBeInTheDocument()

    // Flip back by pressing Space again
    fireEvent.keyDown(window, { code: 'Space' })
    expect(screen.queryByText('Use the <html> tag to wrap all elements.')).not.toBeInTheDocument()
  })

  it('navigates to next card using right arrow or next button', () => {
    const onStatusChange = vi.fn()
    render(
      <MemoryRouter>
        <Flashcards entries={sampleEntries} onStatusChange={onStatusChange} />
      </MemoryRouter>
    )

    expect(screen.getByText('Card 1 of 2')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('Card 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('Missing href attribute')).toBeInTheDocument()
  })

  it('marks card as review again when key 1 is pressed and advances', () => {
    const onStatusChange = vi.fn()
    render(
      <MemoryRouter>
        <Flashcards entries={sampleEntries} onStatusChange={onStatusChange} />
      </MemoryRouter>
    )

    fireEvent.keyDown(window, { key: '1' })
    expect(onStatusChange).toHaveBeenCalledWith('err-1', 'open')
    // Automatically advanced to card 2
    expect(screen.getByText('Card 2 of 2')).toBeInTheDocument()
  })

  it('marks card as understood when key 2 is pressed and advances', () => {
    const onStatusChange = vi.fn()
    render(
      <MemoryRouter>
        <Flashcards entries={sampleEntries} onStatusChange={onStatusChange} />
      </MemoryRouter>
    )

    fireEvent.keyDown(window, { key: '2' })
    expect(onStatusChange).toHaveBeenCalledWith('err-1', 'understood')
    // Automatically advanced to card 2
    expect(screen.getByText('Card 2 of 2')).toBeInTheDocument()
  })
})
