import { describe, expect, it } from 'vitest'
import { evaluateRule, parseHtml } from '../lib/validators'
import type { Rule } from '../data/types'

describe('Stage 21: HTML Track Rule Evaluators', () => {
  describe('Rule: hasAttrValue', () => {
    it('returns true when element attribute matches one of the allowed values (case-insensitive)', () => {
      const html = '<input type="tel" pattern="[0-9]{10}" placeholder="Phone">'
      const doc = parseHtml(html)
      const rule: Rule = {
        kind: 'hasAttrValue',
        selector: 'input[type="tel"]',
        attr: 'pattern',
        values: ['[0-9]{10}', '\\d{10}'],
      }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('matches attribute value case-insensitively', () => {
      const html = '<div role="ALERT">Attention!</div>'
      const doc = parseHtml(html)
      const rule: Rule = {
        kind: 'hasAttrValue',
        selector: 'div',
        attr: 'role',
        values: ['alert'],
      }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('returns false when attribute value does not match any specified value', () => {
      const html = '<input type="tel" pattern="[a-z]+">'
      const doc = parseHtml(html)
      const rule: Rule = {
        kind: 'hasAttrValue',
        selector: 'input[type="tel"]',
        attr: 'pattern',
        values: ['[0-9]{10}'],
      }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })

    it('returns false when attribute or element is missing', () => {
      const html = '<input type="text">'
      const doc = parseHtml(html)
      const rule: Rule = {
        kind: 'hasAttrValue',
        selector: 'input[type="tel"]',
        attr: 'pattern',
        values: ['[0-9]{10}'],
      }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })
  })

  describe('Rule: nestedList', () => {
    it('returns true when a ul is nested inside an li', () => {
      const html = `
        <ul>
          <li>Fruits
            <ul>
              <li>Apple</li>
              <li>Banana</li>
            </ul>
          </li>
          <li>Vegetables</li>
        </ul>
      `
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'nestedList' }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('returns true when an ol is nested inside an li', () => {
      const html = `
        <ul>
          <li>Recipe
            <ol>
              <li>Preheat oven</li>
              <li>Bake</li>
            </ol>
          </li>
        </ul>
      `
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'nestedList' }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('returns false when lists are flat siblings', () => {
      const html = `
        <ul><li>Item A</li></ul>
        <ul><li>Item B</li></ul>
      `
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'nestedList' }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })

    it('returns false when list has no nested sub-lists', () => {
      const html = '<ul><li>One</li><li>Two</li></ul>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'nestedList' }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })
  })

  describe('Rule: cellSpan', () => {
    it('evaluates colspan >= min on td elements', () => {
      const html = '<table><tr><td colspan="2">Wide cell</td></tr></table>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'cellSpan', attr: 'colspan', min: 2 }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('evaluates rowspan >= min on th elements', () => {
      const html = '<table><tr><th scope="row" rowspan="3">Tall header</th></tr></table>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'cellSpan', attr: 'rowspan', min: 2 }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('returns false when span is less than min', () => {
      const html = '<table><tr><td colspan="1">Standard</td></tr></table>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'cellSpan', attr: 'colspan', min: 2 }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })

    it('returns false when attribute is missing or non-numeric', () => {
      const html = '<table><tr><td colspan="invalid">Test</td></tr></table>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'cellSpan', attr: 'colspan', min: 2 }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })
  })

  describe('Rule: inputTypes', () => {
    it('returns true when all required input types are present', () => {
      const html = `
        <form>
          <input type="radio" name="plan">
          <input type="checkbox" name="terms">
          <input type="tel" name="phone">
        </form>
      `
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'inputTypes', types: ['radio', 'checkbox', 'tel'] }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('recognizes default <input> as type="text"', () => {
      const html = '<input>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'inputTypes', types: ['text'] }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('supports min parameter to require a subset of specified types', () => {
      const html = `
        <form>
          <input type="radio" name="a">
          <input type="checkbox" name="b">
        </form>
      `
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'inputTypes', types: ['radio', 'checkbox', 'date', 'tel'], min: 2 }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('returns false when required types are missing', () => {
      const html = '<input type="text"><input type="radio">'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'inputTypes', types: ['radio', 'checkbox'] }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })
  })

  describe('Rule: mediaControls', () => {
    it('returns true when audio has controls attribute', () => {
      const html = '<audio controls><source src="track.mp3" type="audio/mpeg"></audio>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'mediaControls', element: 'audio' }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('returns true when video has controls attribute', () => {
      const html = '<video controls width="400"><source src="clip.mp4" type="video/mp4"></video>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'mediaControls', element: 'video' }
      expect(evaluateRule(rule, doc, html)).toBe(true)
    })

    it('returns false when audio lacks controls attribute', () => {
      const html = '<audio autoplay><source src="track.mp3"></audio>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'mediaControls', element: 'audio' }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })

    it('returns false when target media element is missing from document', () => {
      const html = '<div><p>No audio here</p></div>'
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'mediaControls', element: 'audio' }
      expect(evaluateRule(rule, doc, html)).toBe(false)
    })
  })
})
