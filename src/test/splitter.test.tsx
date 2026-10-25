import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Splitter, MIN_SPLIT_RATIO, MAX_SPLIT_RATIO } from '../core/ui/Splitter'

describe('Splitter (6.2, FC-18)', () => {
  it('renders with role="separator" and accessibility attributes', () => {
    render(<Splitter ratio={50} onChange={() => {}} orientation="horizontal" />)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    expect(separator).toHaveAttribute('aria-valuenow', '50')
    expect(separator).toHaveAttribute('aria-valuemin', String(MIN_SPLIT_RATIO))
    expect(separator).toHaveAttribute('aria-valuemax', String(MAX_SPLIT_RATIO))
  })

  it('handles keyboard navigation: ArrowLeft/Up decreases by 2%', () => {
    const handleChange = vi.fn()
    render(<Splitter ratio={50} onChange={handleChange} orientation="horizontal" />)
    const separator = screen.getByRole('separator')

    fireEvent.keyDown(separator, { key: 'ArrowLeft' })
    expect(handleChange).toHaveBeenCalledWith(48)

    fireEvent.keyDown(separator, { key: 'ArrowUp' })
    expect(handleChange).toHaveBeenCalledWith(48)
  })

  it('handles keyboard navigation: ArrowRight/Down increases by 2%', () => {
    const handleChange = vi.fn()
    render(<Splitter ratio={50} onChange={handleChange} orientation="horizontal" />)
    const separator = screen.getByRole('separator')

    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(handleChange).toHaveBeenCalledWith(52)

    fireEvent.keyDown(separator, { key: 'ArrowDown' })
    expect(handleChange).toHaveBeenCalledWith(52)
  })

  it('clamps ratio between 25% and 75%', () => {
    const handleChange = vi.fn()
    const { rerender } = render(<Splitter ratio={25} onChange={handleChange} orientation="horizontal" />)
    const separator = screen.getByRole('separator')

    fireEvent.keyDown(separator, { key: 'ArrowLeft' })
    expect(handleChange).toHaveBeenCalledWith(25) // clamped at MIN

    rerender(<Splitter ratio={75} onChange={handleChange} orientation="horizontal" />)
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(handleChange).toHaveBeenCalledWith(75) // clamped at MAX
  })

  it('Home and End jump to min and max boundaries', () => {
    const handleChange = vi.fn()
    render(<Splitter ratio={50} onChange={handleChange} orientation="horizontal" />)
    const separator = screen.getByRole('separator')

    fireEvent.keyDown(separator, { key: 'Home' })
    expect(handleChange).toHaveBeenCalledWith(MIN_SPLIT_RATIO)

    fireEvent.keyDown(separator, { key: 'End' })
    expect(handleChange).toHaveBeenCalledWith(MAX_SPLIT_RATIO)
  })

  it('Enter, Space, or "r" resets ratio to default 50% or calls onReset', () => {
    const handleChange = vi.fn()
    const handleReset = vi.fn()
    render(<Splitter ratio={64} onChange={handleChange} onReset={handleReset} orientation="horizontal" />)
    const separator = screen.getByRole('separator')

    fireEvent.keyDown(separator, { key: 'Enter' })
    expect(handleReset).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(separator, { key: 'r' })
    expect(handleReset).toHaveBeenCalledTimes(2)
  })

  it('double click triggers reset', () => {
    const handleChange = vi.fn()
    const handleReset = vi.fn()
    render(<Splitter ratio={60} onChange={handleChange} onReset={handleReset} orientation="horizontal" />)
    const separator = screen.getByRole('separator')

    fireEvent.doubleClick(separator)
    expect(handleReset).toHaveBeenCalledTimes(1)
  })
})
