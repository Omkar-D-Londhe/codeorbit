import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiffViewer } from '../core/learning/DiffViewer'
import { DeviceFrame } from '../core/ui/DeviceFrame'
import { SnippetPanel } from '../core/learning/SnippetPanel'
import { HTML_SNIPPETS } from '../tracks/html/snippets'

describe('Practice Workspace Enhancements (Stage 06)', () => {
  it('DiffViewer is locked and explains why before solution reveal', () => {
    render(
      <DiffViewer
        myCode="<p>My Draft</p>"
        referenceCode="<p>Solution</p>"
        solutionRevealed={false}
      />
    )
    expect(screen.getByText(/Diff viewer is locked/i)).toBeInTheDocument()
    expect(screen.getByText(/Reveal the reference solution first/i)).toBeInTheDocument()
  })

  it('DiffViewer shows line additions and removals after solution reveal', () => {
    render(
      <DiffViewer
        myCode="<h1>Old</h1>"
        referenceCode="<h1>New</h1>"
        solutionRevealed={true}
      />
    )
    expect(screen.getByRole('region', { name: /code comparison/i })).toBeInTheDocument()
    expect(screen.getByText(/\+1 added/i)).toBeInTheDocument()
    expect(screen.getByText(/−1 removed/i)).toBeInTheDocument()
  })

  it('DeviceFrame toggles viewport mode and updates caption and width', () => {
    const handleModeChange = vi.fn()
    const { rerender } = render(
      <DeviceFrame mode="desktop" onModeChange={handleModeChange}>
        <div data-testid="preview-content">Preview Body</div>
      </DeviceFrame>
    )

    expect(screen.getByText('Responsive')).toBeInTheDocument()
    const tabletBtn = screen.getByRole('button', { name: 'Tablet' })
    fireEvent.click(tabletBtn)
    expect(handleModeChange).toHaveBeenCalledWith('tablet')

    rerender(
      <DeviceFrame mode="tablet" onModeChange={handleModeChange}>
        <div data-testid="preview-content">Preview Body</div>
      </DeviceFrame>
    )
    expect(screen.getByText(/Tablet · 768 × 1024/i)).toBeInTheDocument()

    const mobileBtn = screen.getByRole('button', { name: 'Mobile' })
    fireEvent.click(mobileBtn)
    expect(handleModeChange).toHaveBeenCalledWith('mobile')
  })

  it('SnippetPanel filters snippets and calls onInsert with code', () => {
    const handleInsert = vi.fn()
    render(
      <SnippetPanel
        snippets={HTML_SNIPPETS}
        onInsert={handleInsert}
      />
    )

    expect(screen.getByText('HTML5 Boilerplate')).toBeInTheDocument()
    expect(screen.getByText('Accessible Form')).toBeInTheDocument()

    // Filter snippets
    const filterInput = screen.getByPlaceholderText(/filter snippets/i)
    fireEvent.change(filterInput, { target: { value: 'table' } })

    expect(screen.getByText('Accessible Data Table')).toBeInTheDocument()
    expect(screen.queryByText('HTML5 Boilerplate')).not.toBeInTheDocument()

    // Insert snippet
    const insertBtn = screen.getByRole('button', { name: 'Insert' })
    fireEvent.click(insertBtn)
    expect(handleInsert).toHaveBeenCalledWith(expect.stringContaining('<caption>'))
  })
})
