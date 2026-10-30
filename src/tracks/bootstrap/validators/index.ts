/**
 * Bootstrap Rule Validators for CodeOrbit Bootstrap Track (Stage 24).
 * Operates purely on host-parsed DOM from learner HTML.
 * Preserves sandbox="" on the preview iframe — zero scripts executed in the preview.
 */

import type { ChallengeRequirement } from '../../../data/types'
import type { ChallengeFile, ChallengeValidator, RequirementResult } from '../../../core/content/types'

export type BootstrapRule =
  | { kind: 'hasClass'; selector: string; className: string }
  | { kind: 'navbarStructure' }
  | { kind: 'gridStructure'; expectedCols?: number }
  | { kind: 'formControls' }
  | { kind: 'validationFeedback' }

function safeQuery(root: Document | Element, selector: string): Element[] {
  try {
    return Array.from(root.querySelectorAll(selector))
  } catch {
    return []
  }
}

/**
 * Checks if elements matching selector have the specified class.
 */
export function checkHasClass(doc: Document, selector: string, className: string): boolean {
  const elements = safeQuery(doc, selector)
  if (elements.length === 0) return false
  return elements.some((el) => el.classList.contains(className))
}

/**
 * Validates responsive navbar structure according to Bootstrap 5 contracts:
 * - .navbar container
 * - .navbar-toggler with data-bs-toggle="collapse" (or data-toggle="collapse"), aria-controls, and aria-expanded
 * - .collapse.navbar-collapse collapsible wrapper
 * - .navbar-nav with .nav-link items
 */
export function checkNavbarStructure(doc: Document): boolean {
  const navbar = doc.querySelector('.navbar')
  if (!navbar) return false

  const toggler = navbar.querySelector('.navbar-toggler')
  if (!toggler) return false

  const toggleAttr = toggler.getAttribute('data-bs-toggle') || toggler.getAttribute('data-toggle')
  if (toggleAttr !== 'collapse') return false

  const ariaControls = toggler.getAttribute('aria-controls')
  if (!ariaControls || ariaControls.trim().length === 0) return false

  const ariaExpanded = toggler.getAttribute('aria-expanded')
  if (ariaExpanded === null) return false

  // Collapsible target container
  const collapseEl =
    navbar.querySelector('.collapse.navbar-collapse') ||
    navbar.querySelector('.navbar-collapse.collapse') ||
    doc.getElementById(ariaControls)

  if (!collapseEl) return false
  if (!collapseEl.classList.contains('navbar-collapse')) return false

  // Navbar navigation items
  const navList = navbar.querySelector('.navbar-nav')
  if (!navList) return false

  const navLinks = safeQuery(navList, '.nav-link')
  return navLinks.length > 0
}

/**
 * Validates Bootstrap grid hierarchy:
 * - .container or .container-fluid
 * - .row nested inside container
 * - .col or .col-* elements inside row
 * - Optionally checks for minimum number of columns in row
 */
export function checkGridStructure(doc: Document, expectedCols?: number): boolean {
  const containers = safeQuery(doc, '.container, .container-fluid')
  if (containers.length === 0) return false

  const rows = containers.flatMap((c) => safeQuery(c, '.row'))
  if (rows.length === 0) return false

  return rows.some((row) => {
    const children = Array.from(row.children)
    const cols = children.filter((child) => {
      return Array.from(child.classList).some((cls) => cls === 'col' || /^col(-[a-z0-9]+)+$/.test(cls))
    })

    if (cols.length === 0) return false
    if (expectedCols !== undefined && cols.length < expectedCols) return false
    return true
  })
}

/**
 * Validates Bootstrap form controls and label associations:
 * - Presence of .form-control, .form-select, or .form-check-input
 * - Proper association with labels (.form-label or <label for="id"> or wrapping label)
 */
export function checkFormControls(doc: Document): boolean {
  const controls = safeQuery(doc, '.form-control, .form-select, .form-check-input, input:not([type="hidden"]), select, textarea')
  if (controls.length === 0) return false

  const hasBootstrapControlClass = controls.some((c) =>
    c.classList.contains('form-control') ||
    c.classList.contains('form-select') ||
    c.classList.contains('form-check-input')
  )
  if (!hasBootstrapControlClass) return false

  // Every control must have an associated label
  return controls.every((ctrl) => {
    if (ctrl.getAttribute('type') === 'submit' || ctrl.getAttribute('type') === 'button') {
      return true
    }
    if (ctrl.getAttribute('aria-label') || ctrl.getAttribute('aria-labelledby')) {
      return true
    }
    if (ctrl.closest('label')) return true

    const id = ctrl.getAttribute('id')
    if (id) {
      const label = doc.querySelector(`label[for="${id}"]`)
      if (label && (label.textContent || '').trim().length > 0) return true
    }
    return false
  })
}

/**
 * Validates Bootstrap validation feedback states:
 * - .is-invalid or .is-valid present on a form control
 * - .invalid-feedback or .valid-feedback element present
 */
export function checkValidationFeedback(doc: Document): boolean {
  const invalidControls = safeQuery(doc, '.is-invalid, .is-valid')
  if (invalidControls.length === 0) return false

  const feedbackElements = safeQuery(doc, '.invalid-feedback, .valid-feedback')
  return feedbackElements.length > 0 && feedbackElements.some((fb) => (fb.textContent || '').trim().length > 0)
}

/**
 * Evaluates a Bootstrap rule against a parsed HTML document.
 */
export function evaluateBootstrapRule(rule: BootstrapRule, doc: Document): boolean {
  switch (rule.kind) {
    case 'hasClass':
      return checkHasClass(doc, rule.selector, rule.className)
    case 'navbarStructure':
      return checkNavbarStructure(doc)
    case 'gridStructure':
      return checkGridStructure(doc, rule.expectedCols)
    case 'formControls':
      return checkFormControls(doc)
    case 'validationFeedback':
      return checkValidationFeedback(doc)
    default:
      return false
  }
}

/**
 * Factory for creating a ChallengeValidator for Bootstrap track challenges.
 */
export function createBootstrapValidator(requirements: ChallengeRequirement[]): ChallengeValidator {
  return {
    validate(files: ChallengeFile[]): RequirementResult[] {
      const htmlFile =
        files.find((f) => f.name.toLowerCase() === 'index.html') ||
        files.find((f) => f.name.toLowerCase().endsWith('.html')) ||
        files[0]
      const html = htmlFile?.content ?? ''
      const doc = new DOMParser().parseFromString(html, 'text/html')

      return requirements.map((req) => {
        let met = false
        const ruleKind = req.rule.kind

        if (
          ruleKind === 'hasClass' ||
          ruleKind === 'navbarStructure' ||
          ruleKind === 'gridStructure' ||
          ruleKind === 'formControls' ||
          ruleKind === 'validationFeedback'
        ) {
          met = evaluateBootstrapRule(req.rule as BootstrapRule, doc)
        } else {
          // Standard selectors and attributes
          if (ruleKind === 'selector') {
            const r = req.rule as { selector: string; min?: number; exactly?: number }
            const matches = safeQuery(doc, r.selector)
            if (r.exactly !== undefined) met = matches.length === r.exactly
            else if (r.min !== undefined) met = matches.length >= r.min
            else met = matches.length > 0
          } else if (ruleKind === 'noMatch') {
            const r = req.rule as { selector: string }
            met = safeQuery(doc, r.selector).length === 0
          } else if (ruleKind === 'hasAttrValue') {
            const r = req.rule as { selector: string; attr: string; values: string[] }
            const els = safeQuery(doc, r.selector)
            met = els.length > 0 && els.some((el) => r.values.includes(el.getAttribute(r.attr) ?? ''))
          }
        }

        return {
          id: req.id,
          met,
          detail: met ? undefined : `Requirement "${req.description}" was not met.`,
        }
      })
    },
  }
}
