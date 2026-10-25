import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { isMotionAllowed, useMotionAllowed } from '../core/atmosphere/useMotionAllowed'

describe('isMotionAllowed (pure predicate)', () => {
  it('disallows motion when preference is reduce or reduced, regardless of OS', () => {
    expect(isMotionAllowed('reduce', false)).toBe(false)
    expect(isMotionAllowed('reduce', true)).toBe(false)
    expect(isMotionAllowed('reduced', false)).toBe(false)
    expect(isMotionAllowed('reduced', true)).toBe(false)
  })

  it('allows motion when preference is full, even if OS prefers reduce (explicit learner override)', () => {
    expect(isMotionAllowed('full', false)).toBe(true)
    expect(isMotionAllowed('full', true)).toBe(true)
  })

  it('follows OS preference when preference is system or undefined', () => {
    expect(isMotionAllowed('system', false)).toBe(true)
    expect(isMotionAllowed('system', true)).toBe(false)
    expect(isMotionAllowed(undefined, false)).toBe(true)
    expect(isMotionAllowed(undefined, true)).toBe(false)
  })
})

describe('useMotionAllowed (hook)', () => {
  let listeners: Array<(e: { matches: boolean }) => void> = []
  let matchesValue = false

  beforeEach(() => {
    listeners = []
    matchesValue = false

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: matchesValue,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event: string, cb: (e: { matches: boolean }) => void) => {
        if (_event === 'change') listeners.push(cb)
      }),
      removeEventListener: vi.fn((_event: string, cb: (e: { matches: boolean }) => void) => {
        listeners = listeners.filter((l) => l !== cb)
      }),
      dispatchEvent: vi.fn(),
    }))
  })

  it('returns true when system motion and OS does not prefer reduce', () => {
    matchesValue = false
    const { result } = renderHook(() => useMotionAllowed())
    expect(result.current).toBe(true)
  })

  it('returns false when system motion and OS prefers reduce', () => {
    matchesValue = true
    const { result } = renderHook(() => useMotionAllowed())
    expect(result.current).toBe(false)
  })

  it('reacts dynamically to OS media query changes', () => {
    matchesValue = false
    const { result } = renderHook(() => useMotionAllowed())
    expect(result.current).toBe(true)

    act(() => {
      for (const listener of listeners) {
        listener({ matches: true })
      }
    })

    expect(result.current).toBe(false)
  })
})
