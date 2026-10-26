import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toc } from '../core/learning/Toc'

describe('Table of Contents component (4.7)', () => {
  const sampleSections = [
    { id: 'sec-one', heading: 'First Section' },
    { id: 'sec-two', heading: 'Second Section' },
    { id: 'sec-three', heading: 'Third Section' },
  ]

  it('renders nothing when sections count is <= 1', () => {
    const { container: c0 } = render(<Toc sections={[]} />)
    expect(c0.firstChild).toBeNull()

    const { container: c1 } = render(<Toc sections={[{ id: 'intro', heading: 'Intro' }]} />)
    expect(c1.firstChild).toBeNull()
  })

  it('renders desktop nav with active item and list of links', () => {
    render(<Toc sections={sampleSections} />)

    const nav = screen.getByRole('navigation', { name: /table of contents/i })
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('lesson-toc--desktop')

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveTextContent('First Section')
    expect(links[0]).toHaveAttribute('href', '#sec-one')
    expect(links[0]).toHaveAttribute('aria-current', 'true')
    expect(links[1]).not.toHaveAttribute('aria-current')
  })

  it('renders mobile disclosure details when mobile={true}', () => {
    const { container } = render(<Toc sections={sampleSections} mobile />)

    const details = container.querySelector('details.lesson-toc--mobile')
    expect(details).toBeInTheDocument()
    expect(screen.getByText('On this page')).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
  })

  it('clicking a TOC link scrolls target and moves keyboard focus', async () => {
    const user = userEvent.setup()

    // Create target headings in the DOM
    const targetHeading = document.createElement('h2')
    targetHeading.id = 'sec-two'
    targetHeading.textContent = 'Second Section'
    targetHeading.scrollIntoView = vi.fn()
    document.body.appendChild(targetHeading)

    render(<Toc sections={sampleSections} />)

    const secondLink = screen.getByRole('link', { name: 'Second Section' })
    await user.click(secondLink)

    expect(targetHeading.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(document.activeElement).toBe(targetHeading)
    expect(targetHeading.getAttribute('tabindex')).toBe('-1')
    expect(secondLink).toHaveAttribute('aria-current', 'true')

    document.body.removeChild(targetHeading)
  })
})
