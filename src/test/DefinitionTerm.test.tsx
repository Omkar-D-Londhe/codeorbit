import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DefinitionTerm, renderTextWithTerms } from '../core/learning/DefinitionTerm'

describe('DefinitionTerm component and parser (4.5)', () => {
  it('renders trigger button with accessible attributes', () => {
    render(<DefinitionTerm id="dom" term="DOM" definition="Document Object Model tree." />)

    const btn = screen.getByRole('button', { name: 'DOM' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(btn).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('toggles popover tooltip on click and exposes aria-describedby', async () => {
    const user = userEvent.setup()
    render(<DefinitionTerm id="dom" term="DOM" definition="Document Object Model tree." />)

    const btn = screen.getByRole('button', { name: 'DOM' })
    await user.click(btn)

    expect(btn).toHaveAttribute('aria-expanded', 'true')
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveTextContent('Document Object Model tree.')
    expect(btn.getAttribute('aria-describedby')).toBe(tooltip.id)

    // Second click closes
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('dismisses tooltip on Escape key and refocuses the trigger button', async () => {
    const user = userEvent.setup()
    render(<DefinitionTerm id="dom" term="DOM" definition="Document Object Model tree." />)

    const btn = screen.getByRole('button', { name: 'DOM' })
    await user.click(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(btn)
  })

  it('dismisses tooltip when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <button type="button">Outside element</button>
        <DefinitionTerm id="dom" term="DOM" definition="Document Object Model tree." />
      </div>
    )

    const btn = screen.getByRole('button', { name: 'DOM' })
    await user.click(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    const outside = screen.getByRole('button', { name: 'Outside element' })
    await user.click(outside)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  describe('renderTextWithTerms parser', () => {
    const terms = {
      doctype: { term: 'Doctype', definition: 'HTML standards mode trigger.' },
      dom: { term: 'DOM', definition: 'Document Object Model tree.' },
    }

    it('returns original string when terms is empty or text lacks markers', () => {
      expect(renderTextWithTerms('Simple prose without terms.')).toBe('Simple prose without terms.')
      expect(renderTextWithTerms('Text with terms', {})).toBe('Text with terms')
    })

    it('parses markers into interactive DefinitionTerm elements without HTML injection', () => {
      const rendered = renderTextWithTerms(
        'Every page has a {{term:doctype}} and forms a {{term:dom}} structure.',
        terms
      )

      render(<div>{rendered}</div>)

      expect(screen.getByRole('button', { name: 'Doctype' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'DOM' })).toBeInTheDocument()
      expect(screen.getByText(/Every page has a/)).toBeInTheDocument()
    })

    it('retains unmapped term markers gracefully', () => {
      const rendered = renderTextWithTerms('Has {{term:unknown}} tag.', terms)
      render(<div>{rendered}</div>)
      expect(screen.getByText('Has {{term:unknown}} tag.')).toBeInTheDocument()
    })
  })
})
