import type { Rule } from '../data/types'

export interface SourceLocation {
  line: number
  column: number
}

/**
 * Converts a 0-based character index in an HTML string to 1-based line and column numbers.
 */
export function indexToLocation(html: string, index: number): SourceLocation {
  const safeIndex = Math.max(0, Math.min(index, html.length))
  const lines = html.slice(0, safeIndex).split('\n')
  const line = lines.length
  const column = lines[lines.length - 1].length + 1
  return { line, column }
}

/**
 * Finds the location of the DOCTYPE declaration in HTML, or falls back to line 1, column 1.
 */
export function findDoctypeLocation(html: string): SourceLocation {
  const match = /<!doctype\s+html\s*>/i.exec(html)
  if (match) {
    return indexToLocation(html, match.index)
  }
  return { line: 1, column: 1 }
}

export interface TagMatch {
  tagText: string
  location: SourceLocation
  index: number
}

function safeQuery(doc: Document, selector: string): Element[] {
  try {
    return Array.from(doc.querySelectorAll(selector))
  } catch {
    return []
  }
}

/**
 * Scans raw HTML to find opening tags for a given tag name.
 * Correctly accounts for multi-line tags, nested content, and attributes.
 */
export function findTagLocations(html: string, tagName: string): TagMatch[] {
  const regex = new RegExp(`<(${tagName})\\b([^>]*)>`, 'gi')
  const results: TagMatch[] = []
  let m: RegExpExecArray | null

  while ((m = regex.exec(html)) !== null) {
    results.push({
      tagText: m[0],
      location: indexToLocation(html, m.index),
      index: m.index,
    })
  }
  return results
}

/**
 * Resolves source position for a given rule against the document and raw HTML.
 * Deterministic and O(n). Returns undefined when unsure.
 */
export function findRuleLocation(
  rule: Rule,
  doc: Document,
  html: string,
  met: boolean
): SourceLocation | undefined {
  switch (rule.kind) {
    case 'doctype':
      return findDoctypeLocation(html)

    case 'selector': {
      const els = safeQuery(doc, rule.selector)
      if (els.length > 0) {
        const tag = els[0].tagName.toLowerCase()
        const locations = findTagLocations(html, tag)
        if (locations.length > 0) {
          return locations[0].location
        }
      }
      // If required element is missing, try locating parent context
      if (rule.selector.startsWith('head')) {
        const headLocs = findTagLocations(html, 'head')
        if (headLocs.length > 0) return headLocs[0].location
      }
      if (rule.selector.startsWith('body')) {
        const bodyLocs = findTagLocations(html, 'body')
        if (bodyLocs.length > 0) return bodyLocs[0].location
      }
      return { line: 1, column: 1 }
    }

    case 'noMatch': {
      const els = safeQuery(doc, rule.selector)
      if (els.length > 0) {
        const tag = els[0].tagName.toLowerCase()
        const locations = findTagLocations(html, tag)
        if (locations.length > 0) return locations[0].location
      }
      return undefined
    }

    case 'everyHasAttr': {
      const els = safeQuery(doc, rule.selector)
      if (!met) {
        // Find the offending element that is missing the attribute or has it empty
        const offendingIndex = els.findIndex((el) => {
          if (rule.nonEmpty) {
            const v = el.getAttribute(rule.attr)
            return !v || v.trim().length === 0
          }
          return !el.hasAttribute(rule.attr)
        })

        if (offendingIndex >= 0) {
          const offending = els[offendingIndex]
          const tag = offending.tagName.toLowerCase()
          const tagLocs = findTagLocations(html, tag)
          if (tagLocs.length > offendingIndex) {
            return tagLocs[offendingIndex].location
          } else if (tagLocs.length > 0) {
            return tagLocs[0].location
          }
        }
      }
      // If passed or fallback: return first element tag location
      if (els.length > 0) {
        const tag = els[0].tagName.toLowerCase()
        const locs = findTagLocations(html, tag)
        if (locs.length > 0) return locs[0].location
      }
      return { line: 1, column: 1 }
    }

    case 'anyHasAttr': {
      const els = safeQuery(doc, rule.selector)
      if (els.length > 0) {
        const tag = els[0].tagName.toLowerCase()
        const locs = findTagLocations(html, tag)
        if (locs.length > 0) return locs[0].location
      }
      return { line: 1, column: 1 }
    }

    case 'everyAttrContains': {
      const els = safeQuery(doc, rule.selector)
      if (els.length > 0) {
        const tag = els[0].tagName.toLowerCase()
        const locs = findTagLocations(html, tag)
        if (locs.length > 0) return locs[0].location
      }
      return { line: 1, column: 1 }
    }

    case 'textLength': {
      const els = safeQuery(doc, rule.selector)
      if (els.length > 0) {
        const tag = els[0].tagName.toLowerCase()
        const locs = findTagLocations(html, tag)
        if (locs.length > 0) return locs[0].location
      }
      return { line: 1, column: 1 }
    }

    case 'controlsLabelled': {
      const controls = safeQuery(doc, 'input, select, textarea')
      const isLabelled = (el: Element): boolean => {
        if ((el.getAttribute('aria-label') ?? '').trim()) return true
        if ((el.getAttribute('aria-labelledby') ?? '').trim()) return true
        if (el.closest('label')) return true
        const id = el.getAttribute('id')
        if (id) {
          const labels = safeQuery(doc, 'label[for]')
          if (labels.some((l) => l.getAttribute('for') === id && (l.textContent ?? '').trim().length > 0)) return true
        }
        return false
      }
      const unlabelledIndex = controls.findIndex((c) => !isLabelled(c))
      if (unlabelledIndex >= 0) {
        const unlabelled = controls[unlabelledIndex]
        const tag = unlabelled.tagName.toLowerCase()
        const locs = findTagLocations(html, tag)
        if (locs.length > unlabelledIndex) {
          return locs[unlabelledIndex].location
        } else if (locs.length > 0) {
          return locs[0].location
        }
      }
      return { line: 1, column: 1 }
    }

    case 'headingOrder': {
      const headings = safeQuery(doc, 'h1, h2, h3, h4, h5, h6')
      const levels = headings.map((h) => Number(h.tagName[1]))
      let offendingIndex = -1
      for (let i = 0; i < levels.length; i++) {
        if (i === 0 && levels[i] !== 1) {
          offendingIndex = 0
          break
        }
        if (i > 0 && levels[i] - levels[i - 1] > 1) {
          offendingIndex = i
          break
        }
      }
      if (offendingIndex >= 0) {
        const tag = headings[offendingIndex].tagName.toLowerCase()
        const locs = findTagLocations(html, tag)
        if (locs.length > offendingIndex) {
          return locs[offendingIndex].location
        } else if (locs.length > 0) {
          return locs[0].location
        }
      }
      return { line: 1, column: 1 }
    }

    case 'fragmentLinksResolve': {
      const links = safeQuery(doc, 'a[href^="#"]')
      const brokenLink = links.find((a) => {
        const id = (a.getAttribute('href') ?? '').slice(1)
        return id.length > 0 && !doc.getElementById(id)
      })
      if (brokenLink) {
        const href = brokenLink.getAttribute('href')
        const regex = new RegExp(`<a\\b[^>]*href=["']${href}["'][^>]*>`, 'i')
        const match = regex.exec(html)
        if (match) return indexToLocation(html, match.index)
      }
      return { line: 1, column: 1 }
    }

    case 'noLinkText': {
      const links = safeQuery(doc, 'a')
      const banned = rule.patterns.map((p) => p.toLowerCase())
      const badLink = links.find((a) => banned.includes((a.textContent ?? '').trim().toLowerCase().replace(/[.!?:]+$/, '')))
      if (badLink) {
        const text = (badLink.textContent ?? '').trim()
        const index = html.toLowerCase().indexOf(text.toLowerCase())
        if (index >= 0) return indexToLocation(html, index)
      }
      return { line: 1, column: 1 }
    }

    default:
      return undefined
  }
}
