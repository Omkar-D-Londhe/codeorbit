import { describe, expect, it } from 'vitest'
import {
  evaluateCssRule,
  createCssValidator,
  type CssRule,
} from '../tracks/css/validators'

describe('Stage 22: CSS Rule Validators', () => {
  describe('Rule: ruleExists', () => {
    it('returns true when selector and property match exactly', () => {
      const css = 'h1 { color: #9a8bff; font-size: 2rem; }'
      const rule: CssRule = {
        kind: 'ruleExists',
        selector: 'h1',
        property: 'color',
      }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('matches property value string (case- and whitespace-insensitive)', () => {
      const css = 'button:hover { background-color: #2563eb; }'
      const rule: CssRule = {
        kind: 'ruleExists',
        selector: 'button:hover',
        property: 'background-color',
        value: '#2563eb',
      }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('matches property value via RegExp', () => {
      const css = '.card { border: 1px solid rgba(0, 0, 0, 0.1); }'
      const rule: CssRule = {
        kind: 'ruleExists',
        selector: '.card',
        property: 'border',
        value: /solid/,
      }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('returns false when selector does not match', () => {
      const css = 'h2 { color: red; }'
      const rule: CssRule = {
        kind: 'ruleExists',
        selector: 'h1',
        property: 'color',
      }
      expect(evaluateCssRule(rule, css)).toBe(false)
    })

    it('returns false when property is missing on matching selector', () => {
      const css = 'h1 { font-weight: bold; }'
      const rule: CssRule = {
        kind: 'ruleExists',
        selector: 'h1',
        property: 'color',
      }
      expect(evaluateCssRule(rule, css)).toBe(false)
    })
  })

  describe('Rule: declares', () => {
    it('returns true when any rule declares matching property and pattern', () => {
      const css = 'header { display: flex; align-items: center; }'
      const rule: CssRule = {
        kind: 'declares',
        property: 'align-items',
        pattern: 'center',
      }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('returns false when pattern does not match', () => {
      const css = 'header { align-items: flex-start; }'
      const rule: CssRule = {
        kind: 'declares',
        property: 'align-items',
        pattern: 'center',
      }
      expect(evaluateCssRule(rule, css)).toBe(false)
    })
  })

  describe('Rule: mediaQuery', () => {
    it('returns true when min-width media query matches bounds', () => {
      const css = `
        @media (min-width: 768px) {
          .nav { display: flex; }
        }
      `
      const rule: CssRule = {
        kind: 'mediaQuery',
        feature: 'min-width',
        min: 600,
        max: 800,
      }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('handles em units converted to pixels', () => {
      const css = `
        @media (min-width: 48em) {
          .grid { display: grid; }
        }
      `
      const rule: CssRule = {
        kind: 'mediaQuery',
        feature: 'min-width',
        min: 700,
        max: 800,
      }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('returns false when media query is missing or outside bounds', () => {
      const css = '@media (min-width: 480px) { body { font-size: 18px; } }'
      const rule: CssRule = {
        kind: 'mediaQuery',
        feature: 'min-width',
        min: 768,
      }
      expect(evaluateCssRule(rule, css)).toBe(false)
    })
  })

  describe('Rule: usesDisplay', () => {
    it('detects display: flex', () => {
      const css = '.nav-list { display: flex; gap: 8px; }'
      const rule: CssRule = { kind: 'usesDisplay', value: 'flex' }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('detects display: grid', () => {
      const css = '.gallery { display: grid; grid-template-columns: repeat(3, 1fr); }'
      const rule: CssRule = { kind: 'usesDisplay', value: 'grid' }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('returns false when display is block or missing', () => {
      const css = '.box { display: block; margin: 10px; }'
      expect(evaluateCssRule({ kind: 'usesDisplay', value: 'flex' }, css)).toBe(false)
      expect(evaluateCssRule({ kind: 'usesDisplay', value: 'grid' }, css)).toBe(false)
    })
  })

  describe('Rule: reducedMotionGuard', () => {
    it('detects prefers-reduced-motion media query resetting transition to none', () => {
      const css = `
        .btn { transition: transform 0.3s ease; }
        @media (prefers-reduced-motion: reduce) {
          .btn {
            transition: none;
          }
        }
      `
      const rule: CssRule = { kind: 'reducedMotionGuard' }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('detects prefers-reduced-motion media query with duration: 0s', () => {
      const css = `
        .spinner { animation: spin 1s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .spinner {
            animation-duration: 0.001s;
          }
        }
      `
      const rule: CssRule = { kind: 'reducedMotionGuard' }
      expect(evaluateCssRule(rule, css)).toBe(true)
    })

    it('returns false when reduced motion query is absent', () => {
      const css = '.btn { transition: transform 0.3s ease; }'
      const rule: CssRule = { kind: 'reducedMotionGuard' }
      expect(evaluateCssRule(rule, css)).toBe(false)
    })
  })

  describe('Rule: specificityBelow', () => {
    it('validates specificity is strictly <= max allowed tuple', () => {
      const rule: CssRule = {
        kind: 'specificityBelow',
        selector: '.btn.primary',
        max: [0, 2, 0],
      }
      expect(evaluateCssRule(rule, '/* source */')).toBe(true)
    })

    it('fails when selector specificity exceeds max', () => {
      const rule: CssRule = {
        kind: 'specificityBelow',
        selector: '#nav .btn.primary',
        max: [0, 2, 0],
      }
      expect(evaluateCssRule(rule, '/* source */')).toBe(false)
    })
  })

  describe('createCssValidator factory', () => {
    it('validates multi-file challenge input', () => {
      const validator = createCssValidator([
        {
          id: 'flex-display',
          description: 'Use display: flex',
          explanation: 'Flex container distributes items.',
          rule: { kind: 'usesDisplay', value: 'flex' } as unknown as import('../data/types').Rule,
        },
      ])

      const resPassing = validator.validate([
        { name: 'index.html', language: 'html', content: '<div></div>' },
        { name: 'styles.css', language: 'css', content: 'div { display: flex; }' },
      ]) as import('../core/content/types').RequirementResult[]
      expect(resPassing[0].met).toBe(true)

      const resFailing = validator.validate([
        { name: 'index.html', language: 'html', content: '<div></div>' },
        { name: 'styles.css', language: 'css', content: 'div { display: block; }' },
      ]) as import('../core/content/types').RequirementResult[]
      expect(resFailing[0].met).toBe(false)
      expect(resFailing[0].detail).toContain('Flex container distributes items.')
    })
  })
})
