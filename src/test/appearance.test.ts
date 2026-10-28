import { describe, it, expect, beforeEach } from 'vitest'
import {
  applyAppearance,
  readEarlyAppearance,
  writeEarlyAppearance,
  DEFAULT_APPEARANCE,
  EARLY_APPEARANCE_STORAGE_KEY
} from '../core/settings/appearance'

describe('core/settings/appearance', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-accent')
    document.documentElement.removeAttribute('data-contrast')
    document.documentElement.removeAttribute('data-motion')
    document.documentElement.removeAttribute('data-dyslexia')
    document.documentElement.style.removeProperty('--font-scale')
  })

  it('applies default appearance attributes to documentElement', () => {
    applyAppearance(DEFAULT_APPEARANCE)
    expect(document.documentElement.getAttribute('data-theme')).toBe('obsidian')
    expect(document.documentElement.getAttribute('data-accent')).toBe('violet')
    expect(document.documentElement.getAttribute('data-contrast')).toBe('normal')
    expect(document.documentElement.hasAttribute('data-motion')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1')
    expect(document.documentElement.hasAttribute('data-dyslexia')).toBe(false)
  })

  it('applies light theme with custom accent, high contrast, fontScale and dyslexiaFont', () => {
    applyAppearance({
      theme: 'starlight',
      accent: 'teal',
      contrast: 'high',
      motion: 'reduced',
      fontScale: 1.5,
      dyslexiaFont: true,
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('starlight')
    expect(document.documentElement.getAttribute('data-accent')).toBe('teal')
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high')
    expect(document.documentElement.getAttribute('data-motion')).toBe('reduced')
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1.5')
    expect(document.documentElement.getAttribute('data-dyslexia')).toBe('true')
  })

  it('falls back to defaults when invalid values are passed to applyAppearance', () => {
    // @ts-expect-error Testing invalid value
    applyAppearance({ theme: 'invalid', accent: 'bad', contrast: 'super' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('obsidian')
    expect(document.documentElement.getAttribute('data-accent')).toBe('violet')
    expect(document.documentElement.getAttribute('data-contrast')).toBe('normal')
  })

  it('reads and writes appearance preferences via localStorage', () => {
    writeEarlyAppearance({
      theme: 'aurora',
      accent: 'amber',
      contrast: 'normal',
      motion: 'full',
      fontScale: 1.25,
      dyslexiaFont: true,
    })
    const read = readEarlyAppearance()
    expect(read).toEqual({
      theme: 'aurora',
      accent: 'amber',
      contrast: 'normal',
      motion: 'full',
      fontScale: 1.25,
      dyslexiaFont: true,
    })
  })

  it('gracefully handles corrupted JSON in localStorage', () => {
    localStorage.setItem(EARLY_APPEARANCE_STORAGE_KEY, '{invalid-json')
    const read = readEarlyAppearance()
    expect(read).toEqual(DEFAULT_APPEARANCE)
  })

  it('gracefully handles missing localStorage or partial values', () => {
    localStorage.setItem(EARLY_APPEARANCE_STORAGE_KEY, JSON.stringify({ theme: 'starlight' }))
    const read = readEarlyAppearance()
    expect(read.theme).toBe('starlight')
    expect(read.accent).toBe('violet')
    expect(read.contrast).toBe('normal')
    expect(read.motion).toBe('system')
  })
})
