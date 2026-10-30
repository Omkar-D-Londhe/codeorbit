import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChordShortcut, NAVIGATION_CHORDS } from '../core/a11y/useChordShortcut'
import { isTypingTarget } from '../core/a11y/useGlobalShortcuts'
import { isMacPlatform } from '../core/ui/Kbd'

describe('Keyboard Chord Shortcuts (UI-08)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('navigates to Home on "g h"', () => {
    const onNavigate = vi.fn()
    renderHook(() => useChordShortcut({ onNavigate, timeoutMs: 1500 }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
    })

    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('navigates to Explore, Progress, and Concepts on respective chords', () => {
    const onNavigate = vi.fn()
    renderHook(() => useChordShortcut({ onNavigate, timeoutMs: 1500 }))

    // g e -> /explore
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))
    })
    expect(onNavigate).toHaveBeenLastCalledWith('/explore')

    // g p -> /progress
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }))
    })
    expect(onNavigate).toHaveBeenLastCalledWith('/progress')

    // g c -> /concepts
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))
    })
    expect(onNavigate).toHaveBeenLastCalledWith('/concepts')
  })

  it('cancels pending leader key when timeout expires', () => {
    const onNavigate = vi.fn()
    renderHook(() => useChordShortcut({ onNavigate, timeoutMs: 1000 }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }))
    })

    // Advance clock past timeout
    act(() => {
      vi.advanceTimersByTime(1100)
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
    })

    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('cancels pending chord when Escape is pressed', () => {
    const onNavigate = vi.fn()
    renderHook(() => useChordShortcut({ onNavigate, timeoutMs: 1500 }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
    })

    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('guards against firing when focused inside an input or textarea', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)

    expect(isTypingTarget(input)).toBe(true)

    const onNavigate = vi.fn()
    renderHook(() => useChordShortcut({ onNavigate, timeoutMs: 1500 }))

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
    })

    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('guards against firing when an accessible modal dialog is open', () => {
    const dialog = document.createElement('dialog')
    dialog.setAttribute('open', 'true')
    document.body.appendChild(dialog)

    const onNavigate = vi.fn()
    renderHook(() => useChordShortcut({ onNavigate, timeoutMs: 1500 }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
    })

    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('exposes valid navigation chord dictionary and platform detection', () => {
    expect(NAVIGATION_CHORDS.h).toBe('/')
    expect(NAVIGATION_CHORDS.e).toBe('/explore')
    expect(NAVIGATION_CHORDS.p).toBe('/progress')
    expect(NAVIGATION_CHORDS.c).toBe('/concepts')
    expect(typeof isMacPlatform()).toBe('boolean')
  })
})
