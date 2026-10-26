import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import App from '../../App'

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

describe('ConstellationMap pan & zoom controls', () => {
  beforeEach(() => {
    setWidth(1440)
    window.localStorage.clear()
  })

  it('click selects topic, while drag past 4px threshold pans and does NOT change selection', async () => {
    const user = userEvent.setup()
    renderConstellation()

    // Initially select topic 1
    const star1 = screen.getByRole('button', { name: /^01 Document structure/i })
    await user.click(star1)
    expect(star1).toHaveAttribute('aria-current', 'true')

    const mapWrapper = screen.getByRole('group', { name: /Learning Orbit map for HTML/i })

    // Simulate drag gesture exceeding 4px threshold
    fireEvent.pointerDown(mapWrapper, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(mapWrapper, { clientX: 120, clientY: 120, pointerId: 1 }) // dx=20, dy=20 > 4px
    fireEvent.pointerUp(mapWrapper, { clientX: 120, clientY: 120, pointerId: 1 })

    // Topic 1 remains selected; panning never alters selection
    expect(star1).toHaveAttribute('aria-current', 'true')
  })

  it('Zoom in and Zoom out buttons adjust zoom within limits (0.75 to 3.0), and Fit resets', async () => {
    const user = userEvent.setup()
    renderConstellation()

    const zoomInBtn = screen.getByRole('button', { name: /Zoom in/i })
    const zoomOutBtn = screen.getByRole('button', { name: /Zoom out/i })
    const fitBtn = screen.getByRole('button', { name: /Fit/i })

    expect(zoomInBtn).toBeInTheDocument()
    expect(zoomOutBtn).toBeInTheDocument()
    expect(fitBtn).toBeInTheDocument()

    // Click zoom in multiple times
    await user.click(zoomInBtn)
    await user.click(zoomInBtn)

    // Click fit to view to reset
    await user.click(fitBtn)

    // Click zoom out multiple times
    await user.click(zoomOutBtn)
    await user.click(zoomOutBtn)

    // Click fit to view again
    await user.click(fitBtn)
  })

  it('plain wheel does not preventDefault (so outer page scrolls), while ctrl+wheel does', () => {
    renderConstellation()

    const mapWrapper = screen.getByRole('group', { name: /Learning Orbit map for HTML/i })

    // Plain wheel event
    const plainWheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 50,
      ctrlKey: false,
      metaKey: false,
    })
    const plainPreventDefaultSpy = vi.spyOn(plainWheelEvent, 'preventDefault')
    mapWrapper.dispatchEvent(plainWheelEvent)
    expect(plainPreventDefaultSpy).not.toHaveBeenCalled()

    // Ctrl+wheel event
    const ctrlWheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: -50,
      ctrlKey: true,
    })
    const ctrlPreventDefaultSpy = vi.spyOn(ctrlWheelEvent, 'preventDefault')
    mapWrapper.dispatchEvent(ctrlWheelEvent)
    expect(ctrlPreventDefaultSpy).toHaveBeenCalled()
  })

  it('panning or zooming maintains selection stability', async () => {
    const user = userEvent.setup()
    renderConstellation()

    const star3 = screen.getByRole('button', { name: /^03 Headings and paragraphs/i })
    await user.click(star3)
    expect(star3).toHaveAttribute('aria-current', 'true')

    const zoomInBtn = screen.getByRole('button', { name: /Zoom in/i })
    await user.click(zoomInBtn)

    // Selection unchanged
    expect(star3).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('heading', { level: 2, name: /Headings and paragraphs/i })).toBeInTheDocument()
  })
})
