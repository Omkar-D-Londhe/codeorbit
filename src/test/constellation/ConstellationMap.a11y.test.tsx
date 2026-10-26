import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import App from '../../App'
import { expectNoA11yViolations } from '../a11y'

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  window.matchMedia = ((q: string) => {
    const m = /max-width:\s*(\d+)px/.exec(q)
    const matches = m ? w <= Number(m[1]) : false
    return {
      matches,
      media: q,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList
  }) as typeof window.matchMedia
}

const renderConstellation = () =>
  render(
    <MemoryRouter initialEntries={['/learn/html?orbit=constellation']}>
      <App />
    </MemoryRouter>,
  )

describe('ConstellationOrbit Accessibility (a11y)', () => {
  beforeEach(() => {
    setWidth(1440)
    window.localStorage.clear()
  })

  it('passes automated axe checks in Map view with zero serious or critical violations', async () => {
    const { container } = renderConstellation()
    await expectNoA11yViolations(container)
  })

  it('passes automated axe checks in List view with zero serious or critical violations', async () => {
    const user = userEvent.setup()
    const { container } = renderConstellation()

    // Switch to List view
    const listToggle = screen.getByRole('button', { name: /^List$/i })
    await user.click(listToggle)

    // Verify list view is displayed
    expect(container.querySelector('.constellation-list-view')).toBeInTheDocument()

    await expectNoA11yViolations(container)
  })

  it('supports roving tabindex across stars (only active star has tabindex=0, others -1)', async () => {
    renderConstellation()

    const star1 = screen.getByRole('button', { name: /^01 Document structure/i })
    const star2 = screen.getByRole('button', { name: /^02 Elements and attributes/i })

    // On start, star 1 has tabindex 0 (active roving element), star 2 has -1
    expect(star1).toHaveAttribute('tabindex', '0')
    expect(star2).toHaveAttribute('tabindex', '-1')
  })

  it('polite live region announces selection changes for screen reader users', async () => {
    const user = userEvent.setup()
    const { container } = renderConstellation()

    const liveRegion = container.querySelector('.sr-only[aria-live="polite"]')
    expect(liveRegion).not.toBeNull()
    expect(liveRegion).toHaveAttribute('role', 'status')

    // Click on star 1
    const star1 = screen.getByRole('button', { name: /^01 Document structure/i })
    await user.click(star1)

    // Live region announces selection
    expect(liveRegion).toHaveTextContent(/Document structure/i)

    // Click hub button
    const hubBtn = screen.getByRole('button', { name: /HTML track overview/i })
    await user.click(hubBtn)

    expect(liveRegion).toHaveTextContent(/HTML track overview/i)
  })
})
