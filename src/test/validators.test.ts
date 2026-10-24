import { challenges } from '../data/challenges'
import { checkChallenge, checkRequirements, evaluateRule, parseHtml } from '../lib/validators'

const find = (id: string) => challenges.find((c) => c.id === id)!

describe('challenge validators', () => {
  it.each(challenges.map((c) => [c.id, c] as const))('%s: reference solution passes every requirement', (_id, c) => {
    const r = checkChallenge(c, c.solutionCode)
    expect(r.results.filter((x) => x.status === 'fail').map((x) => x.id)).toEqual([])
    expect(r.allPassed).toBe(true)
  })

  it.each(challenges.map((c) => [c.id, c] as const))('%s: starter code does NOT pass (feedback is meaningful)', (_id, c) => {
    const r = checkChallenge(c, c.starterCode)
    expect(r.allPassed).toBe(false)
    expect(r.passed).toBeLessThan(r.total)
  })

  it.each(challenges.map((c) => [c.id, c] as const))('%s: empty input fails everything or nearly everything without throwing', (_id, c) => {
    expect(() => checkChallenge(c, '')).not.toThrow()
    expect(checkChallenge(c, '').allPassed).toBe(false)
  })

  it('has exactly three progressive hints per challenge and requirement IDs are unique', () => {
    challenges.forEach((c) => {
      expect(c.hints).toHaveLength(3)
      expect(new Set(c.requirements.map((r) => r.id)).size).toBe(c.requirements.length)
      // A hint never contains the full reference solution.
      c.hints.forEach((h) => expect(h.includes(c.solutionCode.trim())).toBe(false))
    })
  })

  it('is deterministic: the same input always yields identical results', () => {
    const c = find('ch-forms')
    expect(checkChallenge(c, c.starterCode)).toEqual(checkChallenge(c, c.starterCode))
  })

  describe('document structure', () => {
    const c = find('ch-html-structure')
    it('reports partial passes accurately', () => {
      const partial = '<!DOCTYPE html><html><head><title>x</title></head><body><h1>Hi</h1></body></html>'
      const r = checkChallenge(c, partial)
      const by = Object.fromEntries(r.results.map((x) => [x.id, x.status]))
      expect(by).toMatchObject({ doctype: 'pass', title: 'pass', h1: 'pass', lang: 'fail', charset: 'fail' })
      expect(r.passed).toBe(3)
    })
    it('tolerates case, whitespace and attribute order', () => {
      const html = '  <!doctype   HTML>\n<HTML LANG="en"><HEAD><META charset="utf-8"><TITLE> T </TITLE></HEAD><BODY><H1>x</H1></BODY></HTML>'
      expect(checkChallenge(c, html).allPassed).toBe(true)
    })
    it('rejects an empty lang and an empty title', () => {
      const html = '<!DOCTYPE html><html lang=""><head><meta charset="utf-8"><title>   </title></head><body><h1>x</h1></body></html>'
      const by = Object.fromEntries(checkChallenge(c, html).results.map((x) => [x.id, x.status]))
      expect(by.lang).toBe('fail')
      expect(by.title).toBe('fail')
    })
  })

  describe('headings', () => {
    const c = find('ch-headings-paragraphs')
    it('flags a skipped level', () => {
      const r = checkChallenge(c, '<h1>A</h1><h3>B</h3><h2>C</h2><h2>D</h2><p>x</p><p>y</p>')
      expect(r.results.find((x) => x.id === 'order')?.status).toBe('fail')
    })
    it('requires starting at h1', () => {
      expect(evaluateRule({ kind: 'headingOrder' }, parseHtml('<h2>A</h2>'), '')).toBe(false)
    })
    it('allows moving back up the outline', () => {
      expect(evaluateRule({ kind: 'headingOrder' }, parseHtml('<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>'), '')).toBe(true)
    })
    it('fails with no headings', () => {
      expect(evaluateRule({ kind: 'headingOrder' }, parseHtml('<p>x</p>'), '')).toBe(false)
    })
    it('requires exactly one h1', () => {
      const r = checkChallenge(c, '<h1>A</h1><h1>B</h1><h2>x</h2><h2>y</h2><p>1</p><p>2</p>')
      expect(r.results.find((x) => x.id === 'one-h1')?.status).toBe('fail')
    })
  })

  describe('lists', () => {
    const c = find('ch-lists')
    it('rejects loose <li> elements', () => {
      const r = checkChallenge(c, '<ul><li>a</li><li>b</li><li>c</li></ul><ol><li>1</li><li>2</li><li>3</li></ol><div><li>loose</li></div>')
      expect(r.results.find((x) => x.id === 'li-parent')?.status).toBe('fail')
    })
    it('needs at least three items in each list', () => {
      const r = checkChallenge(c, '<ul><li>a</li><li>b</li></ul><ol><li>1</li></ol>')
      expect(r.results.filter((x) => x.status === 'fail').map((x) => x.id)).toEqual(['ul', 'ol'])
    })
  })

  describe('links', () => {
    const c = find('ch-links')
    it('requires noopener whenever target=_blank is used', () => {
      const html = '<a href="https://a.dev" target="_blank">Docs</a><a href="#x">Jump</a><p id="x">t</p>'
      expect(checkChallenge(c, html).results.find((x) => x.id === 'noopener')?.status).toBe('fail')
    })
    it('accepts noopener with other rel tokens in any order', () => {
      const html = '<a href="https://a.dev" target="_blank" rel="noreferrer NOOPENER">Docs</a>'
      expect(checkChallenge(c, html).results.find((x) => x.id === 'noopener')?.status).toBe('pass')
    })
    it('fails fragment links whose target id is missing', () => {
      const html = '<a href="#missing">Jump</a>'
      expect(checkChallenge(c, html).results.find((x) => x.id === 'fragment')?.status).toBe('fail')
    })
    it('rejects "click here" regardless of case and punctuation', () => {
      expect(checkChallenge(c, '<a href="https://a.dev">Click Here.</a>').results.find((x) => x.id === 'text')?.status).toBe('fail')
    })
  })

  describe('images', () => {
    const c = find('ch-images')
    it('rejects an empty alt (informative image) but accepts a descriptive one', () => {
      const bad = '<figure><img src="data:," alt="" width="1" height="1"><figcaption>x</figcaption></figure>'
      expect(checkChallenge(c, bad).results.find((x) => x.id === 'alt')?.status).toBe('fail')
      const good = bad.replace('alt=""', 'alt="A violet square"')
      expect(checkChallenge(c, good).allPassed).toBe(true)
    })
    it('requires every image, not just one, to have alt', () => {
      const html = '<figure><img src="data:," alt="a" width="1" height="1"><img src="data:,"><figcaption>x</figcaption></figure>'
      expect(checkChallenge(c, html).results.find((x) => x.id === 'alt')?.status).toBe('fail')
    })
  })

  describe('forms', () => {
    const c = find('ch-forms')
    it('accepts wrapping labels and aria-label as accessible names', () => {
      const html = '<form><label>Name <input name="n" required></label><input type="email" aria-label="Email" required><button type="submit">Go</button></form>'
      expect(checkChallenge(c, html).allPassed).toBe(true)
    })
    it('rejects a label whose for does not match', () => {
      const html = '<form><label for="a">Name</label><input id="b" type="email" required><button type="submit">Go</button></form>'
      expect(checkChallenge(c, html).results.find((x) => x.id === 'labels')?.status).toBe('fail')
    })
    it('rejects an empty label', () => {
      const html = '<form><label for="a"> </label><input id="a" type="email" required><button type="submit">Go</button></form>'
      expect(checkChallenge(c, html).results.find((x) => x.id === 'labels')?.status).toBe('fail')
    })
    it('requires the controls to be inside a form', () => {
      expect(checkChallenge(c, c.starterCode).results.find((x) => x.id === 'form')?.status).toBe('fail')
    })
  })

  describe('tables and semantics', () => {
    it('requires scope on every th', () => {
      const c = find('ch-tables')
      const html = '<table><caption>c</caption><thead><tr><th scope="col">a</th><th>b</th><th scope="col">c</th></tr></thead><tbody><tr><td>1</td></tr><tr><td>2</td></tr></tbody></table>'
      expect(checkChallenge(c, html).results.find((x) => x.id === 'scope')?.status).toBe('fail')
    })
    it('requires exactly one main', () => {
      const c = find('ch-semantic-layout')
      const html = '<header>h</header><nav><a href="#a">a</a><a href="#b">b</a></nav><main>1</main><main>2</main><footer>f</footer>'
      expect(checkChallenge(c, html).results.find((x) => x.id === 'main')?.status).toBe('fail')
    })
  })

  it('treats an invalid selector as a failed check instead of throwing', () => {
    const r = checkRequirements([{ id: 'x', description: 'd', explanation: 'e', rule: { kind: 'selector', selector: '###', min: 1 } }], '<p>x</p>')
    expect(r.results[0].status).toBe('fail')
  })
})
