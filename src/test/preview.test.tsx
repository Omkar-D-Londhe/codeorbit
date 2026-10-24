import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { render } from '@testing-library/react'
import { SandboxedPreview } from '../components/SandboxedPreview'
import { PREVIEW_SANDBOX, buildPreviewDocument } from '../lib/preview'

describe('preview security boundary', () => {
  const evil = '<script>window.top.document.title="pwned"</script><img src=x onerror="alert(1)"><iframe src="javascript:alert(1)"></iframe>'

  it('uses an EMPTY sandbox attribute (no scripts, no same-origin, no forms, no popups)', () => {
    expect(PREVIEW_SANDBOX).toBe('')
    const { container } = render(<SandboxedPreview html={evil} />)
    const frame = container.querySelector('iframe')!
    expect(frame.hasAttribute('sandbox')).toBe(true)
    expect(frame.getAttribute('sandbox')).toBe('')
  })

  it('never grants allow-scripts, and never pairs it with allow-same-origin', () => {
    const { container } = render(<SandboxedPreview html="<p>x</p>" />)
    const sb = container.querySelector('iframe')!.getAttribute('sandbox') ?? ''
    expect(sb).not.toContain('allow-scripts')
    expect(sb).not.toContain('allow-same-origin')
  })

  it('does not inject learner markup into the trusted parent DOM', () => {
    const { container } = render(<SandboxedPreview html={evil} />)
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(document.title).not.toBe('pwned')
    // learner content exists only inside the srcdoc attribute string
    expect(container.querySelector('iframe')!.getAttribute('srcdoc')).toContain('<script>')
  })

  it('adds a restrictive Content-Security-Policy ahead of the learner content', () => {
    const doc = buildPreviewDocument('<p>hi</p>')
    expect(doc.indexOf('Content-Security-Policy')).toBeGreaterThan(-1)
    expect(doc.indexOf('Content-Security-Policy')).toBeLessThan(doc.indexOf('<p>hi</p>'))
    expect(doc).toContain("default-src 'none'")
    expect(doc).not.toMatch(/script-src/)
  })

  it('has no dangerouslySetInnerHTML, innerHTML, or document.write anywhere in the source', () => {
    const dirs = ['components', 'pages', 'lib', 'state']
    const files: string[] = []
    const walk = (d: string) => readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(join(d, e.name)) : /\.tsx?$/.test(e.name) && files.push(join(d, e.name))))
    dirs.forEach((d) => walk(join(__dirname, '..', d)))
    files.forEach((f) => {
      // Strip comments so prose that merely mentions these APIs is not flagged.
      const src = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      expect(src, f).not.toMatch(/dangerouslySetInnerHTML|\.innerHTML\s*=|document\.write|allow-scripts|allow-same-origin/)
    })
  })
})
