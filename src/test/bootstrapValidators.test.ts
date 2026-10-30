import { describe, expect, it } from 'vitest'
import {
  checkHasClass,
  checkNavbarStructure,
  checkGridStructure,
  checkFormControls,
  checkValidationFeedback,
  createBootstrapValidator,
  type BootstrapRule,
} from '../tracks/bootstrap/validators'
import type { RequirementResult } from '../core/content/types'
import { parseHtml } from '../lib/validators'

describe('Stage 24: Bootstrap Rule Validators', () => {
  describe('checkHasClass', () => {
    it('returns true when matched element has the class', () => {
      const doc = parseHtml('<div class="col-12 col-md-6 col-lg-4">Card</div>')
      expect(checkHasClass(doc, 'div', 'col-lg-4')).toBe(true)
    })

    it('returns false when class is missing or element does not match', () => {
      const doc = parseHtml('<div class="col-12 col-md-6">Card</div>')
      expect(checkHasClass(doc, 'div', 'col-lg-4')).toBe(false)
      expect(checkHasClass(doc, 'p', 'col-12')).toBe(false)
    })
  })

  describe('checkNavbarStructure (FC-26)', () => {
    it('returns true for a compliant Bootstrap 5 responsive navbar', () => {
      const html = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="container-fluid">
            <a class="navbar-brand" href="#">Orbit</a>
            <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navMenu"
              aria-controls="navMenu"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navMenu">
              <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Tracks</a></li>
              </ul>
            </div>
          </div>
        </nav>
      `
      const doc = parseHtml(html)
      expect(checkNavbarStructure(doc)).toBe(true)
    })

    it('rejects navbar missing toggler button', () => {
      const html = `
        <nav class="navbar">
          <div class="navbar-collapse collapse">
            <ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="#">Home</a></li></ul>
          </div>
        </nav>
      `
      expect(checkNavbarStructure(parseHtml(html))).toBe(false)
    })

    it('rejects toggler missing aria-controls or data-bs-toggle="collapse"', () => {
      const html = `
        <nav class="navbar">
          <button class="navbar-toggler" type="button" aria-expanded="false"></button>
          <div class="navbar-collapse collapse">
            <ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="#">Home</a></li></ul>
          </div>
        </nav>
      `
      expect(checkNavbarStructure(parseHtml(html))).toBe(false)
    })

    it('rejects navbar missing .navbar-collapse wrapper', () => {
      const html = `
        <nav class="navbar">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" aria-controls="m" aria-expanded="false"></button>
          <div id="m">
            <ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="#">Home</a></li></ul>
          </div>
        </nav>
      `
      expect(checkNavbarStructure(parseHtml(html))).toBe(false)
    })
  })

  describe('checkGridStructure (FC-28)', () => {
    it('validates container with row and columns matching expected count', () => {
      const html = `
        <div class="container">
          <div class="row g-3">
            <div class="col-12 col-md-4">A</div>
            <div class="col-12 col-md-4">B</div>
            <div class="col-12 col-md-4">C</div>
          </div>
        </div>
      `
      const doc = parseHtml(html)
      expect(checkGridStructure(doc, 3)).toBe(true)
    })

    it('returns false when columns count is less than expectedCols', () => {
      const html = `
        <div class="container">
          <div class="row">
            <div class="col-6">A</div>
            <div class="col-6">B</div>
          </div>
        </div>
      `
      const doc = parseHtml(html)
      expect(checkGridStructure(doc, 3)).toBe(false)
    })

    it('returns false when .container or .row is missing', () => {
      const html = `<div><div class="col-6">A</div></div>`
      expect(checkGridStructure(parseHtml(html))).toBe(false)
    })
  })

  describe('checkFormControls', () => {
    it('returns true when controls have .form-control and associated labels', () => {
      const html = `
        <form>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email">
          </div>
          <div class="mb-3">
            <label for="track" class="form-label">Track</label>
            <select class="form-select" id="track"><option>HTML</option></select>
          </div>
        </form>
      `
      const doc = parseHtml(html)
      expect(checkFormControls(doc)).toBe(true)
    })

    it('returns false when controls lack associated labels', () => {
      const html = `
        <form>
          <input type="text" class="form-control" id="noLabel">
        </form>
      `
      const doc = parseHtml(html)
      expect(checkFormControls(doc)).toBe(false)
    })
  })

  describe('checkValidationFeedback (FC-27)', () => {
    it('returns true when an input has .is-invalid and .invalid-feedback is present', () => {
      const html = `
        <form>
          <input type="email" class="form-control is-invalid" id="mail">
          <div class="invalid-feedback">Invalid email domain.</div>
        </form>
      `
      const doc = parseHtml(html)
      expect(checkValidationFeedback(doc)).toBe(true)
    })

    it('returns false when no control is marked invalid', () => {
      const html = `
        <form>
          <input type="email" class="form-control" id="mail">
          <div class="invalid-feedback">Invalid email domain.</div>
        </form>
      `
      expect(checkValidationFeedback(parseHtml(html))).toBe(false)
    })

    it('returns false when feedback message container is missing', () => {
      const html = `
        <form>
          <input type="email" class="form-control is-invalid" id="mail">
        </form>
      `
      expect(checkValidationFeedback(parseHtml(html))).toBe(false)
    })
  })

  describe('createBootstrapValidator', () => {
    it('evaluates requirements against challenge files', () => {
      const validator = createBootstrapValidator([
        {
          id: 'r1',
          description: 'Grid layout',
          explanation: 'Grid test',
          rule: { kind: 'gridStructure', expectedCols: 2 } as BootstrapRule,
        },
      ])

      const passFiles = [
        {
          name: 'index.html',
          language: 'html',
          content: '<div class="container"><div class="row"><div class="col-6">1</div><div class="col-6">2</div></div></div>',
        },
      ]

      const results = validator.validate(passFiles) as RequirementResult[]
      expect(results[0].met).toBe(true)

      const failFiles = [
        {
          name: 'index.html',
          language: 'html',
          content: '<div>No grid</div>',
        },
      ]
      const failResults = validator.validate(failFiles) as RequirementResult[]
      expect(failResults[0].met).toBe(false)
      expect(failResults[0].detail).toContain('Requirement "Grid layout" was not met.')
    })
  })
})
