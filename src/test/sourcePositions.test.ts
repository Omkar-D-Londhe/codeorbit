import { describe, it, expect } from 'vitest'
import {
  indexToLocation,
  findDoctypeLocation,
  findTagLocations,
  findRuleLocation,
} from '../lib/sourcePositions'
import { parseHtml } from '../lib/validators'
import type { Rule } from '../data/types'

describe('sourcePositions (7.1)', () => {
  describe('indexToLocation', () => {
    it('returns line 1, column 1 for index 0', () => {
      expect(indexToLocation('hello', 0)).toEqual({ line: 1, column: 1 })
    })

    it('calculates line and column across multiple lines', () => {
      const html = '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Title</h1>\n  </body>\n</html>'
      // '<html>' starts on line 2, column 1 (index 16)
      expect(indexToLocation(html, 16)).toEqual({ line: 2, column: 1 })
      // '<body>' starts on line 3, column 3 (index 25)
      expect(indexToLocation(html, 25)).toEqual({ line: 3, column: 3 })
    })

    it('handles negative indices and clamped upper bounds safely', () => {
      const html = '<div>test</div>'
      expect(indexToLocation(html, -5)).toEqual({ line: 1, column: 1 })
      expect(indexToLocation(html, 999)).toEqual({ line: 1, column: 16 })
    })
  })

  describe('findDoctypeLocation', () => {
    it('finds DOCTYPE on line 1', () => {
      const html = '<!DOCTYPE html>\n<html lang="en">\n</html>'
      expect(findDoctypeLocation(html)).toEqual({ line: 1, column: 1 })
    })

    it('finds DOCTYPE after comments or newlines', () => {
      const html = '<!-- greeting -->\n\n  <!doctype html>\n<html></html>'
      expect(findDoctypeLocation(html)).toEqual({ line: 3, column: 3 })
    })

    it('falls back to line 1, column 1 when doctype is missing', () => {
      const html = '<html lang="en"><body><h1>Hi</h1></body></html>'
      expect(findDoctypeLocation(html)).toEqual({ line: 1, column: 1 })
    })
  })

  describe('findTagLocations', () => {
    it('finds void elements like <img> and <meta>', () => {
      const html = '<html>\n<head><meta charset="UTF-8"></head>\n<body>\n<img src="pic.jpg" alt="Photo">\n</body></html>'
      const metaLocs = findTagLocations(html, 'meta')
      expect(metaLocs).toHaveLength(1)
      expect(metaLocs[0].location.line).toBe(2)

      const imgLocs = findTagLocations(html, 'img')
      expect(imgLocs).toHaveLength(1)
      expect(imgLocs[0].location.line).toBe(4)
    })

    it('finds multi-line tag openings', () => {
      const html = '<div>\n  <img\n    src="hero.jpg"\n    alt="Hero"\n  />\n</div>'
      const imgLocs = findTagLocations(html, 'img')
      expect(imgLocs).toHaveLength(1)
      expect(imgLocs[0].location).toEqual({ line: 2, column: 3 })
    })

    it('finds nested and repeated elements correctly', () => {
      const html = '<ul>\n  <li>One</li>\n  <li>Two</li>\n  <li>Three</li>\n</ul>'
      const liLocs = findTagLocations(html, 'li')
      expect(liLocs).toHaveLength(3)
      expect(liLocs[0].location.line).toBe(2)
      expect(liLocs[1].location.line).toBe(3)
      expect(liLocs[2].location.line).toBe(4)
    })
  })

  describe('findRuleLocation', () => {
    it('reports line number for doctype rule', () => {
      const html = '<!DOCTYPE html>\n<html></html>'
      const doc = parseHtml(html)
      const loc = findRuleLocation({ kind: 'doctype' }, doc, html, true)
      expect(loc).toEqual({ line: 1, column: 1 })
    })

    it('reports line number for selector rule', () => {
      const html = '<!DOCTYPE html>\n<html>\n<body>\n  <main>\n    <p>Body</p>\n  </main>\n</body>\n</html>'
      const doc = parseHtml(html)
      const loc = findRuleLocation({ kind: 'selector', selector: 'main' }, doc, html, true)
      expect(loc).toEqual({ line: 4, column: 3 })
    })

    it('reports line number for everyHasAttr rule when attribute is missing', () => {
      const html = `<!DOCTYPE html>
<html>
<body>
  <img src="valid.png" alt="Valid image">
  <p>Some text</p>
  <img src="missing-alt.png">
</body>
</html>`
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'everyHasAttr', selector: 'img', attr: 'alt', nonEmpty: true }
      // The second <img> at line 6 lacks alt
      const loc = findRuleLocation(rule, doc, html, false)
      expect(loc).toEqual({ line: 6, column: 3 })
    })

    it('reports line number for headingOrder violation', () => {
      const html = `<!DOCTYPE html>
<html>
<body>
  <h1>Main heading</h1>
  <h3>Skipped heading level 2</h3>
</body>
</html>`
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'headingOrder' }
      const loc = findRuleLocation(rule, doc, html, false)
      expect(loc?.line).toBe(5)
    })

    it('reports line number for unlabelled controls', () => {
      const html = `<!DOCTYPE html>
<html>
<body>
  <form>
    <label for="username">Username</label>
    <input id="username" type="text">
    <input type="password" placeholder="Unlabelled">
  </form>
</body>
</html>`
      const doc = parseHtml(html)
      const rule: Rule = { kind: 'controlsLabelled' }
      const loc = findRuleLocation(rule, doc, html, false)
      expect(loc?.line).toBe(7)
    })
  })
})
