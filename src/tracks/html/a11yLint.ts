/**
 * Accessibility Linter for HTML practice documents (Stage 06, 6.7).
 * Rule-based heuristic checks executed via DOMParser on sandboxed markup.
 * Disclaimer: Quick checks, not a full audit. Never claims complete WCAG conformance.
 */

export interface A11yLintIssue {
  id: string
  severity: 'error' | 'warning'
  message: string
  selector?: string
  snippet?: string
}

export function lintHtml(docOrHtml: Document | string): A11yLintIssue[] {
  let doc: Document
  if (typeof docOrHtml === 'string') {
    const parser = new DOMParser()
    doc = parser.parseFromString(docOrHtml, 'text/html')
  } else {
    doc = docOrHtml
  }

  const issues: A11yLintIssue[] = []
  let issueIdx = 0

  // 1. Missing alt on <img> elements
  const images = doc.querySelectorAll('img')
  images.forEach((img) => {
    if (!img.hasAttribute('alt')) {
      issues.push({
        id: `a11y-img-alt-${++issueIdx}`,
        severity: 'error',
        message: 'Image is missing an alt attribute. Provide descriptive alt text, or alt="" if decorative.',
        selector: 'img',
        snippet: img.outerHTML.slice(0, 100),
      })
    }
  })

  // 2. Unlabelled form controls (<input>, <select>, <textarea>)
  const formControls = doc.querySelectorAll('input, select, textarea')
  formControls.forEach((el) => {
    const tag = el.tagName.toLowerCase()
    if (tag === 'input') {
      const type = (el.getAttribute('type') || 'text').toLowerCase()
      if (['hidden', 'submit', 'reset', 'button'].includes(type)) return
    }

    const id = el.getAttribute('id')
    const hasAriaLabel = Boolean(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'))
    const hasEnclosingLabel = Boolean(el.closest('label'))
    const hasExplicitLabel = id ? Boolean(doc.querySelector(`label[for="${CSS.escape(id)}"]`)) : false

    if (!hasAriaLabel && !hasEnclosingLabel && !hasExplicitLabel) {
      issues.push({
        id: `a11y-unlabelled-control-${++issueIdx}`,
        severity: 'error',
        message: `Form control <${tag}> lacks an accessible label. Add an associated <label> or aria-label.`,
        selector: tag,
        snippet: el.outerHTML.slice(0, 100),
      })
    }
  })

  // 3. Empty headings
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headings.forEach((h) => {
    const text = h.textContent?.trim() || ''
    const hasAria = Boolean(h.getAttribute('aria-label') || h.getAttribute('aria-labelledby'))
    if (!text && !hasAria && !h.querySelector('img[alt]')) {
      issues.push({
        id: `a11y-empty-heading-${++issueIdx}`,
        severity: 'warning',
        message: `Heading <${h.tagName.toLowerCase()}> is empty. Headings must contain descriptive text.`,
        selector: h.tagName.toLowerCase(),
        snippet: h.outerHTML.slice(0, 100),
      })
    }
  })

  // 4. Duplicate IDs
  const allElementsWithId = doc.querySelectorAll('[id]')
  const seenIds = new Set<string>()
  const reportedDuplicateIds = new Set<string>()

  allElementsWithId.forEach((el) => {
    const id = el.getAttribute('id')?.trim()
    if (!id) return

    if (seenIds.has(id)) {
      if (!reportedDuplicateIds.has(id)) {
        reportedDuplicateIds.add(id)
        issues.push({
          id: `a11y-duplicate-id-${++issueIdx}`,
          severity: 'error',
          message: `Duplicate id="${id}" found. Element IDs must be unique within the document.`,
          selector: `#${id}`,
          snippet: el.outerHTML.slice(0, 100),
        })
      }
    } else {
      seenIds.add(id)
    }
  })

  // 5. Heading hierarchy skip check
  let lastHeadingLevel = 0
  headings.forEach((h) => {
    const level = parseInt(h.tagName[1], 10)
    if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
      issues.push({
        id: `a11y-heading-order-${++issueIdx}`,
        severity: 'warning',
        message: `Heading order skips from <h${lastHeadingLevel}> to <h${level}>. Avoid skipping heading levels in hierarchy.`,
        selector: h.tagName.toLowerCase(),
        snippet: h.outerHTML.slice(0, 100),
      })
    }
    lastHeadingLevel = level
  })

  return issues
}
