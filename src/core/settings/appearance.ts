export type ThemeId = 'obsidian' | 'starlight' | 'aurora'
export type AccentId = 'violet' | 'teal' | 'amber' | 'rose' | 'azure'
export type ContrastMode = 'normal' | 'high'
export type MotionPreference = 'system' | 'reduced' | 'full'

export interface Appearance {
  theme: ThemeId
  accent: AccentId
  contrast: ContrastMode
  motion?: MotionPreference
}

export interface StoredEarlyAppearance {
  v: number
  theme: ThemeId
  accent: AccentId
  contrast: ContrastMode
  motion?: MotionPreference
}

export const EARLY_APPEARANCE_STORAGE_KEY = 'codeorbit:settings:early'

export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'obsidian',
  accent: 'violet',
  contrast: 'normal',
  motion: 'system'
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
  return typeof val === 'string' && VALID_MOTIONS.includes(val as MotionPreference)
}

/**
 * Applies theme, accent, contrast, and motion attributes to the given root element (defaults to <html>).
 */
export function applyAppearance(appearance: Partial<Appearance>, root = document.documentElement): void {
  if (!root) return

  const theme = isValidTheme(appearance.theme) ? appearance.theme : DEFAULT_APPEARANCE.theme
  const accent = isValidAccent(appearance.accent) ? appearance.accent : DEFAULT_APPEARANCE.accent
  const contrast = isValidContrast(appearance.contrast) ? appearance.contrast : DEFAULT_APPEARANCE.contrast
  const motion = isValidMotion(appearance.motion) ? appearance.motion : DEFAULT_APPEARANCE.motion

  root.setAttribute('data-theme', theme)
  root.setAttribute('data-accent', accent)
  root.setAttribute('data-contrast', contrast)
  if (motion && motion !== 'system') {
    root.setAttribute('data-motion', motion)
  } else {
    root.removeAttribute('data-motion')
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
      motion: isValidMotion(parsed.motion) ? parsed.motion : DEFAULT_APPEARANCE.motion
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
      motion: isValidMotion(appearance.motion) ? appearance.motion : DEFAULT_APPEARANCE.motion
    }
    localStorage.setItem(EARLY_APPEARANCE_STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Storage quota or privacy restrictions, safely ignore
  }
}
