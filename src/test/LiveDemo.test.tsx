import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LiveDemo } from '../core/learning/LiveDemo'
import type { LessonDemo } from '../data/types'

describe('LiveDemo component (4.4)', () => {
  const sampleDemo: LessonDemo = {
    id: 'demo-test',
    title: 'Button Demo',
    files: [
      {
        name: 'index.html',
        content: '<button type="button">Click me</button>',
      },
    ],
  }

  it('renders mini-editor and sandboxed preview iframe with empty sandbox="" attribute', () => {
    const { container } = render(<LiveDemo demo={sampleDemo} />)

    expect(screen.getByText('Interactive Demo: Button Demo')).toBeInTheDocument()
    const textarea = screen.getByRole('textbox', { name: /code editor for button demo/i })
    expect(textarea).toHaveValue('<button type="button">Click me</button>')

    const iframe = container.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
    // Must use empty sandbox attribute (no scripts, no same-origin)
    expect(iframe?.getAttribute('sandbox')).toBe('')
    const sandboxValue = iframe?.getAttribute('sandbox') ?? ''
    expect(sandboxValue).not.toContain('allow-scripts')
    expect(sandboxValue).not.toContain('allow-same-origin')
  })

  it('allows live editing in local component state and resets when requested', async () => {
    const user = userEvent.setup()
    render(<LiveDemo demo={sampleDemo} />)

    const textarea = screen.getByRole('textbox', { name: /code editor for button demo/i })
    await user.clear(textarea)
    await user.type(textarea, '<h1>New Heading</h1>')

    expect(textarea).toHaveValue('<h1>New Heading</h1>')

    // Click Reset demo
    const resetBtn = screen.getByRole('button', { name: /reset button demo to original/i })
    await user.click(resetBtn)

    expect(textarea).toHaveValue('<button type="button">Click me</button>')
  })
})
