import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QuizTimer } from '../core/learning/QuizTimer'

describe('QuizTimer (5.5)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders calm text chip with role="timer" and tabular formatting', () => {
    render(<QuizTimer initialSeconds={60} onExpire={vi.fn()} />)
    const timer = screen.getByRole('timer')
    expect(timer).toBeInTheDocument()
    expect(timer).toHaveTextContent('01:00')
    expect(timer).toHaveAttribute('aria-label', 'Time remaining: 01:00')
    expect(timer).toHaveStyle({ fontWeight: 500 })
  })

  it('counts down each second and fires onTick callback', () => {
    const onTick = vi.fn()
    render(<QuizTimer initialSeconds={15} onExpire={vi.fn()} onTick={onTick} />)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    const timer = screen.getByRole('timer')
    expect(timer).toHaveTextContent('00:13')
    expect(onTick).toHaveBeenCalledWith(14)
    expect(onTick).toHaveBeenCalledWith(13)
  })

  it('increases font weight under 10s without red panic color', () => {
    render(<QuizTimer initialSeconds={12} onExpire={vi.fn()} />)
    const timer = screen.getByRole('timer')
    expect(timer).toHaveStyle({ fontWeight: 500 })

    act(() => {
      vi.advanceTimersByTime(3000) // down to 9s
    })

    expect(timer).toHaveTextContent('00:09')
    expect(timer).toHaveStyle({ fontWeight: 700 })
    // Verify no red text color is applied
    expect(timer.style.color).not.toMatch(/red|#f00|#ff0000/i)
  })

  it('triggers onExpire when reaching 0', () => {
    const onExpire = vi.fn()
    render(<QuizTimer initialSeconds={2} onExpire={onExpire} />)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('pauses countdown when document is hidden (visibilitychange)', () => {
    const onTick = vi.fn()
    render(<QuizTimer initialSeconds={30} onExpire={vi.fn()} onTick={onTick} />)

    // Simulate tab switch / hidden
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // No ticks should have occurred while hidden
    expect(onTick).not.toHaveBeenCalled()
    expect(screen.getByRole('timer')).toHaveTextContent('00:30')

    // Simulate tab return
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onTick).toHaveBeenCalledWith(29)
    expect(screen.getByRole('timer')).toHaveTextContent('00:29')
  })
})
