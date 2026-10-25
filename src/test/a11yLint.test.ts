import { describe, it, expect } from 'vitest'
import { lintHtml } from '../tracks/html/a11yLint'

describe('A11y Linter (6.7, FC-04)', () => {
  it('flags missing alt attribute on img, but passes valid alt and decorative alt=""', () => {
    const invalidHtml = '<img src="cat.jpg">'
    const issues = lintHtml(invalidHtml)
    expect(issues.some((i) => i.message.includes('alt attribute'))).toBe(true)

    const validHtml = '<img src="cat.jpg" alt="A fluffy cat">'
    expect(lintHtml(validHtml)).toHaveLength(0)

    const decorativeHtml = '<img src="decor.png" alt="">'
    expect(lintHtml(decorativeHtml)).toHaveLength(0)
  })

  it('flags unlabelled form controls, but passes aria-label, aria-labelledby, and label association', () => {
    const unlabelled = '<input type="text">'
    const issues1 = lintHtml(unlabelled)
    expect(issues1.some((i) => i.message.includes('accessible label'))).toBe(true)

    const ariaLabelled = '<input type="text" aria-label="Search items">'
    expect(lintHtml(ariaLabelled)).toHaveLength(0)

    const explicitlyLabelled = '<label for="name-field">Name</label><input id="name-field">'
    expect(lintHtml(explicitlyLabelled)).toHaveLength(0)

    const wrapped = '<label>Email <input type="email"></label>'
    expect(lintHtml(wrapped)).toHaveLength(0)

    // Hidden inputs are exempt
    const hidden = '<input type="hidden" name="token" value="xyz">'
    expect(lintHtml(hidden)).toHaveLength(0)
  })

  it('flags empty heading elements', () => {
    const emptyH1 = '<h1></h1>'
    const issues = lintHtml(emptyH1)
    expect(issues.some((i) => i.message.includes('Heading <h1> is empty'))).toBe(true)

    const validH1 = '<h1>Accessible Title</h1>'
    expect(lintHtml(validH1)).toHaveLength(0)
  })

  it('flags duplicate id attributes across elements', () => {
    const duplicateIds = '<div id="main-content">One</div><div id="main-content">Two</div>'
    const issues = lintHtml(duplicateIds)
    expect(issues.some((i) => i.message.includes('Duplicate id="main-content"'))).toBe(true)

    const uniqueIds = '<div id="header"></div><div id="footer"></div>'
    expect(lintHtml(uniqueIds)).toHaveLength(0)
  })

  it('flags heading hierarchy skips (e.g. h1 to h3)', () => {
    const skipped = '<h1>Main</h1><h3>Subsection</h3>'
    const issues = lintHtml(skipped)
    expect(issues.some((i) => i.message.includes('Heading order skips from <h1> to <h3>'))).toBe(true)

    const proper = '<h1>Main</h1><h2>Sub</h2><h3>Subsub</h3>'
    expect(lintHtml(proper)).toHaveLength(0)
  })
})
