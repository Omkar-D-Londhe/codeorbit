import { describe, it, expect } from 'vitest'
import {
  contrastRatio,
  relativeLuminance,
  parseColor,
  composite
} from '../core/a11y/contrast'

describe('core/a11y/contrast', () => {
  it('computes known WCAG pairs correctly', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21)
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1)
    expect(contrastRatio('#000000', '#000000')).toBe(1)
    // Black and white relative luminance
    expect(relativeLuminance(0, 0, 0)).toBe(0)
    expect(relativeLuminance(255, 255, 255)).toBe(1)
  })

  it('parses color formats (3-hex, 6-hex, 8-hex, rgb, rgba)', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#111219')).toEqual({ r: 17, g: 18, b: 25, a: 1 })
    expect(parseColor('rgba(154, 139, 255, 0.13)')).toEqual({ r: 154, g: 139, b: 255, a: 0.13 })
    expect(parseColor('rgb(255 255 255 / 10%)')).toEqual({ r: 255, g: 255, b: 255, a: 0.1 })
  })

  it('composites semi-transparent foreground over background', () => {
    const comp = composite('rgba(255, 255, 255, 0.5)', '#000000')
    expect(comp.r).toBeCloseTo(128, -1)
    expect(comp.g).toBeCloseTo(128, -1)
    expect(comp.b).toBeCloseTo(128, -1)
    expect(comp.a).toBe(1)
  })

  describe('Full Theme × Accent × Contrast Matrix (04 §1.3 & §1.4)', () => {
    const themes = {
      obsidian: {
        bg: '#111219',
        surfaces: ['#111219', '#191b25', '#222533', '#292c3c'],
        text: '#f4f2f8',
        textMuted: '#a7a9bc',
        textQuiet: '#9a9db3',
        success: '#c3f477',
        accents: {
          violet: { accent: '#9a8bff', onAccent: '#14121f' },
          teal: { accent: '#5fd6c6', onAccent: '#06201c' },
          amber: { accent: '#f2b85b', onAccent: '#241600' },
          rose: { accent: '#ff8fb1', onAccent: '#290a14' },
          azure: { accent: '#7db4ff', onAccent: '#09182d' }
        },
        highContrast: {
          text: '#ffffff',
          textMuted: '#e0e0ea',
          border: '#9494b8'
        }
      },
      starlight: {
        bg: '#f7f6fb',
        surfaces: ['#f7f6fb', '#ffffff', '#f0eef8', '#e6e3f3'],
        text: '#17151f',
        textMuted: '#4a4660',
        textQuiet: '#5f5a7a',
        success: '#2d7a10',
        accents: {
          violet: { accent: '#5b45e0', onAccent: '#ffffff' },
          teal: { accent: '#0d8276', onAccent: '#ffffff' },
          amber: { accent: '#a15c00', onAccent: '#ffffff' },
          rose: { accent: '#c92a58', onAccent: '#ffffff' },
          azure: { accent: '#1c68d4', onAccent: '#ffffff' }
        },
        highContrast: {
          text: '#000000',
          textMuted: '#222030',
          border: '#403c58'
        }
      },
      aurora: {
        bg: '#0d1517',
        surfaces: ['#0d1517', '#142024', '#1b2b30', '#23373d'],
        text: '#eaf6f5',
        textMuted: '#a3bfc0',
        textQuiet: '#7e9d9e',
        success: '#4ade80',
        accents: {
          violet: { accent: '#9a8bff', onAccent: '#14121f' },
          teal: { accent: '#5fd6c6', onAccent: '#06201c' },
          amber: { accent: '#f2b85b', onAccent: '#241600' },
          rose: { accent: '#ff8fb1', onAccent: '#290a14' },
          azure: { accent: '#7db4ff', onAccent: '#09182d' }
        },
        highContrast: {
          text: '#ffffff',
          textMuted: '#e0f4f4',
          border: '#8cb0b6'
        }
      }
    }

    const accents = ['violet', 'teal', 'amber', 'rose', 'azure'] as const

    for (const [themeName, theme] of Object.entries(themes)) {
      describe(`Theme: ${themeName}`, () => {
        it('body text ≥ 7:1 on --bg', () => {
          const ratio = contrastRatio(theme.text, theme.bg)
          expect(ratio).toBeGreaterThanOrEqual(7.0)
        })

        it('muted text ≥ 4.5:1 on every surface', () => {
          for (const surface of theme.surfaces) {
            const ratio = contrastRatio(theme.textMuted, surface)
            expect(ratio).toBeGreaterThanOrEqual(4.5)
          }
        })

        it('quiet text ≥ 3.0:1 on every surface', () => {
          for (const surface of theme.surfaces) {
            const ratio = contrastRatio(theme.textQuiet, surface)
            expect(ratio).toBeGreaterThanOrEqual(3.0)
          }
        })

        it('success ≥ 4.5:1 on --bg', () => {
          const ratio = contrastRatio(theme.success, theme.bg)
          expect(ratio).toBeGreaterThanOrEqual(4.5)
        })

        for (const accentName of accents) {
          const acc = theme.accents[accentName]
          it(`accent [${accentName}] ≥ 3:1 on every surface and --on-accent ≥ 4.5:1 on --accent`, () => {
            for (const surface of theme.surfaces) {
              const ratio = contrastRatio(acc.accent, surface)
              expect(ratio).toBeGreaterThanOrEqual(3.0)
            }
            const onRatio = contrastRatio(acc.onAccent, acc.accent)
            expect(onRatio).toBeGreaterThanOrEqual(4.5)
          })
        }

        it('high-contrast mode text ≥ 12:1 and border ≥ 4.5:1', () => {
          const textRatio = contrastRatio(theme.highContrast.text, theme.bg)
          expect(textRatio).toBeGreaterThanOrEqual(12.0)
          const borderRatio = contrastRatio(theme.highContrast.border, theme.bg)
          expect(borderRatio).toBeGreaterThanOrEqual(4.5)
        })
      })
    }
  })

  describe('Constellation orbit-state glyph and label tuples (10 §19)', () => {
    const states = [
      { name: 'completed', darkGlyph: '#c3f477', lightGlyph: '#2d7a10', labelDark: '#f4f2f8', labelLight: '#17151f' },
      { name: 'in-progress', darkGlyph: '#9a8bff', lightGlyph: '#5b45e0', labelDark: '#f4f2f8', labelLight: '#17151f' },
      { name: 'available', darkGlyph: '#f4f2f8', lightGlyph: '#17151f', labelDark: '#f4f2f8', labelLight: '#17151f' },
      { name: 'locked', darkGlyph: '#a7a9bc', lightGlyph: '#4a4660', labelDark: '#a7a9bc', labelLight: '#4a4660' }
    ]

    const darkBgs = ['#111219', '#0d1517']
    const lightBg = '#f7f6fb'

    for (const st of states) {
      it(`node state ${st.name} passes AA for labels and >= 3:1 for glyphs in dark and light`, () => {
        // Dark backgrounds
        for (const bg of darkBgs) {
          expect(contrastRatio(st.labelDark, bg)).toBeGreaterThanOrEqual(4.5)
          expect(contrastRatio(st.darkGlyph, bg)).toBeGreaterThanOrEqual(3.0)
        }
        // Light background
        expect(contrastRatio(st.labelLight, lightBg)).toBeGreaterThanOrEqual(4.5)
        expect(contrastRatio(st.lightGlyph, lightBg)).toBeGreaterThanOrEqual(3.0)
      })
    }
  })
})
