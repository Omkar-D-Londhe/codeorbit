/**
 * WCAG 2.1 relative luminance and contrast ratio calculation.
 * Follows W3C WCAG 2.1 specifications: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

export interface RGBA {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
  a: number // 0-1
}

/**
 * Converts an sRGB 8-bit channel to linear luminance component.
 */
function sRgbToLinear(c8: number): number {
  const c = c8 / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/**
 * Calculates relative luminance of an opaque RGB color (0 = darkest black, 1 = brightest white).
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const rLin = sRgbToLinear(r)
  const gLin = sRgbToLinear(g)
  const bLin = sRgbToLinear(b)
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

/**
 * Parses hex (#rgb, #rgba, #rrggbb, #rrggbbaa) and rgb/rgba strings into RGBA object.
 */
export function parseColor(color: string): RGBA {
  const c = color.trim().toLowerCase()

  // Hex format
  if (c.startsWith('#')) {
    const hex = c.slice(1)
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1
      return { r, g, b, a }
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
      return { r, g, b, a }
    }
    throw new Error(`Invalid hex color: ${color}`)
  }

  // rgb(...) or rgba(...)
  const rgbMatch = c.match(/^rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)(?:[,\s/]+([0-9.%]+))?\s*\)$/)
  if (rgbMatch) {
    const r = Math.round(parseFloat(rgbMatch[1]))
    const g = Math.round(parseFloat(rgbMatch[2]))
    const b = Math.round(parseFloat(rgbMatch[3]))
    let a = 1
    if (rgbMatch[4] !== undefined) {
      if (rgbMatch[4].endsWith('%')) {
        a = parseFloat(rgbMatch[4]) / 100
      } else {
        a = parseFloat(rgbMatch[4])
      }
    }
    return { r, g, b, a }
  }

  // Named basic colors
  if (c === 'white' || c === '#fff' || c === '#ffffff') return { r: 255, g: 255, b: 255, a: 1 }
  if (c === 'black' || c === '#000' || c === '#000000') return { r: 0, g: 0, b: 0, a: 1 }
  if (c === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }

  throw new Error(`Unsupported color format: ${color}`)
}

/**
 * Alpha-composites foreground over background (standard Porter-Duff over).
 * Returns the resulting opaque RGB color.
 */
export function composite(fgInput: string | RGBA, bgInput: string | RGBA): RGBA {
  const fg = typeof fgInput === 'string' ? parseColor(fgInput) : fgInput
  const bg = typeof bgInput === 'string' ? parseColor(bgInput) : bgInput

  // If background itself has alpha, composite over white as final fall-through
  const bgA = bg.a
  const fgA = fg.a
  const outA = fgA + bgA * (1 - fgA)

  if (outA === 0) {
    return { r: 0, g: 0, b: 0, a: 0 }
  }

  const r = Math.round((fg.r * fgA + bg.r * bgA * (1 - fgA)) / outA)
  const g = Math.round((fg.g * fgA + bg.g * bgA * (1 - fgA)) / outA)
  const b = Math.round((fg.b * fgA + bg.b * bgA * (1 - fgA)) / outA)

  return { r, g, b, a: outA }
}

/**
 * Calculates WCAG 2.1 contrast ratio between two colors (fg and bg).
 * Automatically handles alpha compositing if fg is semi-transparent.
 */
export function contrastRatio(fgInput: string | RGBA, bgInput: string | RGBA): number {
  const fgRgba = typeof fgInput === 'string' ? parseColor(fgInput) : fgInput
  const bgRgba = typeof bgInput === 'string' ? parseColor(bgInput) : bgInput

  // Composite fg over bg if fg has alpha
  const effectiveFg = fgRgba.a < 1 ? composite(fgRgba, bgRgba) : fgRgba
  // If bg still has alpha, composite over black or white (assume black for dark, white for light)
  const effectiveBg = bgRgba.a < 1 ? composite(bgRgba, { r: 17, g: 18, b: 25, a: 1 }) : bgRgba

  const lum1 = relativeLuminance(effectiveFg.r, effectiveFg.g, effectiveFg.b)
  const lum2 = relativeLuminance(effectiveBg.r, effectiveBg.g, effectiveBg.b)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  const ratio = (lighter + 0.05) / (darker + 0.05)
  return Math.round(ratio * 100) / 100
}
