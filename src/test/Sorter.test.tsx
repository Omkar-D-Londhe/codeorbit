import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sorter, type SorterItem } from '../core/learning/Sorter'
import { SorterQuestion } from '../core/learning/questions/SorterQuestion'
import type { SorterQuizQuestion } from '../data/types'

describe('Sorter & SorterQuestion (5.2, FC-18)', () => {
  const sampleItems: SorterItem[] = [
    { id: 'h1', text: '<h1>Main title</h1>' },
    { id: 'p1', text: '<p>First paragraph</p>' },
    { id: 'p2', text: '<p>Second paragraph</p>' },
  ]

  it('renders items in the specified order with 48px min-height touch targets', () => {
    const onChange = vi.fn()
    render(
      <Sorter
        items={sampleItems}
        order={['h1', 'p1', 'p2']}
        onChange={onChange}
      />
    )

    const list = screen.getByRole('list', { name: /sortable items list/i })
    expect(list).toBeInTheDocument()

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
    expect(listItems[0]).toHaveTextContent(/1\.<h1>Main title<\/h1>/)
    expect(listItems[1]).toHaveTextContent(/2\.<p>First paragraph<\/p>/)
    expect(listItems[2]).toHaveTextContent(/3\.<p>Second paragraph<\/p>/)
    expect(listItems[0]).toHaveStyle({ minHeight: '48px' })
  })

  it('supports accessible move up and move down buttons', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Sorter
        items={sampleItems}
        order={['h1', 'p1', 'p2']}
        onChange={onChange}
      />
    )

    // First item cannot move up
    const upButtons = screen.getAllByRole('button', { name: /move .* up/i })
    expect(upButtons[0]).toBeDisabled()

    // Second item can move up
    expect(upButtons[1]).not.toBeDisabled()
    await user.click(upButtons[1])
    expect(onChange).toHaveBeenCalledWith(['p1', 'h1', 'p2'])

    // Last item cannot move down
    const downButtons = screen.getAllByRole('button', { name: /move .* down/i })
    expect(downButtons[2]).toBeDisabled()
    await user.click(downButtons[0])
    expect(onChange).toHaveBeenCalledWith(['p1', 'h1', 'p2'])
  })

  it('supports full keyboard navigation: Space to grab, Arrows to move, Space to drop', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Sorter
        items={sampleItems}
        order={['h1', 'p1', 'p2']}
        onChange={onChange}
      />
    )

    const listItems = screen.getAllByRole('listitem')
    listItems[0].focus()

    // Grab with Space
    await user.keyboard(' ')
    expect(listItems[0]).toHaveAttribute('aria-grabbed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent(/Grabbed <h1>Main title<\/h1>/i)

    // Move down with ArrowDown
    await user.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenCalledWith(['p1', 'h1', 'p2'])

    // Drop with Space
    await user.keyboard(' ')
    expect(listItems[0]).toHaveAttribute('aria-grabbed', 'false')
    expect(screen.getByRole('status')).toHaveTextContent(/Dropped <h1>Main title<\/h1>/i)
  })

  it('cancels reordering on Escape', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Sorter
        items={sampleItems}
        order={['h1', 'p1', 'p2']}
        onChange={onChange}
      />
    )

    const listItems = screen.getAllByRole('listitem')
    listItems[1].focus()

    // Grab
    await user.keyboard(' ')
    expect(listItems[1]).toHaveAttribute('aria-grabbed', 'true')

    // Cancel with Esc
    await user.keyboard('{Escape}')
    expect(listItems[1]).toHaveAttribute('aria-grabbed', 'false')
    expect(screen.getByRole('status')).toHaveTextContent(/Reordering cancelled/i)
  })

  it('renders SorterQuestion inside accessible fieldset with legend', () => {
    const question: SorterQuizQuestion = {
      kind: 'sort',
      id: 'sort-q1',
      prompt: 'Arrange the heading and paragraphs in semantic order.',
      items: sampleItems,
      order: ['h1', 'p1', 'p2'],
      explanation: 'Headings should precede their corresponding sections.',
    }

    render(
      <SorterQuestion
        question={question}
        chosen={['p1', 'h1', 'p2']}
        checked={false}
        onSelect={vi.fn()}
      />
    )

    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByText('Arrange the heading and paragraphs in semantic order.')).toBeInTheDocument()
  })
})
