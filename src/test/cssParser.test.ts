import { describe, expect, it } from 'vitest'
import {
  calculateSpecificity,
  isSpecificityBelowOrEqual,
  parseCss,
} from '../tracks/css/parser'

describe('Stage 22: CSS Parser & Specificity', () => {
  describe('calculateSpecificity', () => {
    it('calculates specificity for single tag selector', () => {
      expect(calculateSpecificity('p')).toEqual([0, 0, 1])
      expect(calculateSpecificity('h1')).toEqual([0, 0, 1])
    })

    it('calculates specificity for class selector', () => {
      expect(calculateSpecificity('.card')).toEqual([0, 1, 0])
      expect(calculateSpecificity('p.card')).toEqual([0, 1, 1])
    })

    it('calculates specificity for ID selector', () => {
      expect(calculateSpecificity('#main')).toEqual([1, 0, 0])
      expect(calculateSpecificity('header#main')).toEqual([1, 0, 1])
    })

    it('calculates specificity for complex combinations and pseudo-classes', () => {
      // nav a.active:hover => 0 IDs, 2 classes/pseudos (.active, :hover), 2 tags (nav, a)
      expect(calculateSpecificity('nav a.active:hover')).toEqual([0, 2, 2])
      // #header nav .btn[disabled] => 1 ID, 2 classes/attrs, 1 tag
      expect(calculateSpecificity('#header nav .btn[disabled]')).toEqual([1, 2, 1])
    })

    it('handles pseudo-elements correctly', () => {
      // p::before => 0 IDs, 0 classes, 2 tags/pseudo-elements
      expect(calculateSpecificity('p::before')).toEqual([0, 0, 2])
    })
  })

  describe('isSpecificityBelowOrEqual', () => {
    it('correctly compares specificity tuples', () => {
      expect(isSpecificityBelowOrEqual([0, 1, 1], [0, 2, 0])).toBe(true)
      expect(isSpecificityBelowOrEqual([0, 2, 0], [0, 1, 1])).toBe(false)
      expect(isSpecificityBelowOrEqual([1, 0, 0], [0, 9, 9])).toBe(false)
      expect(isSpecificityBelowOrEqual([0, 1, 1], [0, 1, 1])).toBe(true)
    })
  })

  describe('parseCss', () => {
    it('parses basic CSS rules and declarations', () => {
      const css = `
        body {
          margin: 0;
          color: #333;
        }
        .container {
          max-width: 1200px;
          padding: 16px;
        }
      `
      const res = parseCss(css)
      expect(res.errors).toHaveLength(0)
      expect(res.rules).toHaveLength(2)

      expect(res.rules[0].selector).toBe('body')
      expect(res.rules[0].declarations['margin']).toBe('0')
      expect(res.rules[0].declarations['color']).toBe('#333')

      expect(res.rules[1].selector).toBe('.container')
      expect(res.rules[1].declarations['max-width']).toBe('1200px')
      expect(res.rules[1].specificity).toEqual([0, 1, 0])
    })

    it('ignores comments while maintaining accurate lines', () => {
      const css = `
        /* Main page layout */
        main {
          display: flex;
          /* inner comment */
          gap: 12px;
        }
      `
      const res = parseCss(css)
      expect(res.rules).toHaveLength(1)
      expect(res.rules[0].selector).toBe('main')
      expect(res.rules[0].declarations['display']).toBe('flex')
      expect(res.rules[0].declarations['gap']).toBe('12px')
    })

    it('splits comma-separated selectors into distinct parsed rules', () => {
      const css = 'h1, h2, h3 { font-family: sans-serif; }'
      const res = parseCss(css)
      expect(res.rules).toHaveLength(3)
      expect(res.rules.map((r) => r.selector)).toEqual(['h1', 'h2', 'h3'])
      expect(res.rules[0].declarations['font-family']).toBe('sans-serif')
    })

    it('parses @media rules into mediaRules', () => {
      const css = `
        .sidebar {
          display: none;
        }
        @media (min-width: 768px) {
          .sidebar {
            display: block;
          }
        }
      `
      const res = parseCss(css)
      expect(res.rules).toHaveLength(1)
      expect(res.rules[0].declarations['display']).toBe('none')

      expect(res.mediaRules).toHaveLength(1)
      expect(res.mediaRules[0].params).toBe('(min-width: 768px)')
      expect(res.mediaRules[0].rules).toHaveLength(1)
      expect(res.mediaRules[0].rules[0].selector).toBe('.sidebar')
      expect(res.mediaRules[0].rules[0].declarations['display']).toBe('block')
    })

    it('never throws on malformed CSS input and records friendly errors', () => {
      const malformed = 'body { color: red; unclosed block...'
      const res = parseCss(malformed)
      expect(res.errors.length).toBeGreaterThan(0)
      expect(res.errors[0]).toContain('Unclosed')
    })

    it('guards against excessive size (> 50 kB)', () => {
      const huge = 'a'.repeat(60 * 1024)
      const res = parseCss(huge)
      expect(res.errors.length).toBeGreaterThan(0)
      expect(res.errors[0]).toContain('exceeds maximum permitted size')
      expect(res.rules).toHaveLength(0)
    })
  })
})
