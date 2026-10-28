import { type FontScale, VALID_FONT_SCALES } from '../../state/types'

export type ThemeId = 'obsidian' | 'starlight' | 'aurora'
export type AccentId = 'violet' | 'teal' | 'amber' | 'rose' | 'azure'
export type ContrastMode = 'normal' | 'high'
export type MotionPreference = 'system' | 'reduced' | 'full'

export interface Appearance {
  theme: ThemeId
  accent: AccentId
  contrast: ContrastMode
  motion?: MotionPreference
  fontScale?: FontScale
  dyslexiaFont?: boolean
}

export interface StoredEarlyAppearance {
  v: number
  theme: ThemeId
  accent: AccentId
  contrast: ContrastMode
  motion?: MotionPreference
  fontScale?: FontScale
  dyslexiaFont?: boolean
}

export const EARLY_APPEARANCE_STORAGE_KEY = 'codeorbit:settings:early'

export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'obsidian',
  accent: 'violet',
  contrast: 'normal',
  motion: 'system',
  fontScale: 1,
  dyslexiaFont: false,
}

export const VALID_THEMES: readonly ThemeId[] = ['obsidian', 'starlight', 'aurora']
export const VALID_ACCENTS: readonly AccentId[] = ['violet', 'teal', 'amber', 'rose', 'azure']
export const VALID_CONTRASTS: readonly ContrastMode[] = ['normal', 'high']
export const VALID_MOTIONS: readonly MotionPreference[] = ['system', 'reduced', 'full']

export function isValidTheme(val: unknown): val is ThemeId {
  return typeof val === 'string' && VALID_THEMES.includes(val as ThemeId)
}

export function isValidAccent(val: unknown): val is AccentId {
  return typeof val === 'string' && VALID_ACCENTS.includes(val as AccentId)
}

export function isValidContrast(val: unknown): val is ContrastMode {
  return typeof val === 'string' && VALID_CONTRASTS.includes(val as ContrastMode)
}

export function isValidMotion(val: unknown): val is MotionPreference {
  return typeof val === 'string' && (VALID_MOTIONS.includes(val as MotionPreference) || val === 'reduce')
}

export function isValidFontScale(val: unknown): val is FontScale {
  return typeof val === 'number' && VALID_FONT_SCALES.includes(val as FontScale)
}

/**
 * Applies theme, accent, contrast, and motion attributes to the given root element (defaults to <html>).
 */
export function applyAppearance(
  appearance: Partial<Appearance> & {
    atmosphere?: { nebula?: boolean; grid?: boolean; cursorGlow?: boolean; particles?: boolean }
  },
  root = document.documentElement
): void {
  if (!root) return

  const theme = isValidTheme(appearance.theme) ? appearance.theme : DEFAULT_APPEARANCE.theme
  const accent = isValidAccent(appearance.accent) ? appearance.accent : DEFAULT_APPEARANCE.accent
  const contrast = isValidContrast(appearance.contrast) ? appearance.contrast : DEFAULT_APPEARANCE.contrast
  const motion = isValidMotion(appearance.motion) ? appearance.motion : DEFAULT_APPEARANCE.motion
  const fontScale = isValidFontScale(appearance.fontScale) ? appearance.fontScale : DEFAULT_APPEARANCE.fontScale

  root.setAttribute('data-theme', theme)
  root.setAttribute('data-accent', accent)
  root.setAttribute('data-contrast', contrast)
  if (motion && motion !== 'system') {
    root.setAttribute('data-motion', motion)
  } else {
    root.removeAttribute('data-motion')
  }

  // Font scale (rem-based root scaling, spec §5, 13.1)
  root.style.setProperty('--font-scale', String(fontScale))

  // Dyslexia font attribute (13.2)
  if (appearance.dyslexiaFont) {
    root.setAttribute('data-dyslexia', 'true')
  } else {
    root.removeAttribute('data-dyslexia')
  }

  if (appearance.atmosphere) {
    if (typeof appearance.atmosphere.nebula === 'boolean') {
      root.setAttribute('data-atmosphere-nebula', appearance.atmosphere.nebula ? 'on' : 'off')
    }
    if (typeof appearance.atmosphere.grid === 'boolean') {
      root.setAttribute('data-atmosphere-grid', appearance.atmosphere.grid ? 'on' : 'off')
    }
  }

  // Update color-scheme CSS property
  root.style.colorScheme = theme === 'starlight' ? 'light' : 'dark'
}

/**
 * Reads early appearance preferences from localStorage.
 * Guaranteed to never throw and returns defaults on error or invalid payload.
 */
export function readEarlyAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(EARLY_APPEARANCE_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_APPEARANCE }

    const parsed = JSON.parse(raw) as Partial<StoredEarlyAppearance>
    return {
      theme: isValidTheme(parsed.theme) ? parsed.theme : DEFAULT_APPEARANCE.theme,
      accent: isValidAccent(parsed.accent) ? parsed.accent : DEFAULT_APPEARANCE.accent,
      contrast: isValidContrast(parsed.contrast) ? parsed.contrast : DEFAULT_APPEARANCE.contrast,
      motion: isValidMotion(parsed.motion) ? parsed.motion : DEFAULT_APPEARANCE.motion,
      fontScale: isValidFontScale(parsed.fontScale) ? parsed.fontScale : DEFAULT_APPEARANCE.fontScale,
      dyslexiaFont: typeof parsed.dyslexiaFont === 'boolean' ? parsed.dyslexiaFont : DEFAULT_APPEARANCE.dyslexiaFont,
    }
  } catch {
    return { ...DEFAULT_APPEARANCE }
  }
}

/**
 * Writes early appearance preferences to localStorage.
 */
export function writeEarlyAppearance(appearance: Appearance): void {
  try {
    const record: StoredEarlyAppearance = {
      v: 1,
      theme: isValidTheme(appearance.theme) ? appearance.theme : DEFAULT_APPEARANCE.theme,
      accent: isValidAccent(appearance.accent) ? appearance.accent : DEFAULT_APPEARANCE.accent,
      contrast: isValidContrast(appearance.contrast) ? appearance.contrast : DEFAULT_APPEARANCE.contrast,
      motion: isValidMotion(appearance.motion) ? appearance.motion : DEFAULT_APPEARANCE.motion,
      fontScale: isValidFontScale(appearance.fontScale) ? appearance.fontScale : DEFAULT_APPEARANCE.fontScale,
      dyslexiaFont: typeof appearance.dyslexiaFont === 'boolean' ? appearance.dyslexiaFont : DEFAULT_APPEARANCE.dyslexiaFont,
    }
    localStorage.setItem(EARLY_APPEARANCE_STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Storage quota or privacy restrictions, safely ignore
  }
}
