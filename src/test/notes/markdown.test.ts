import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { renderMarkdown, isSafeUrl } from '../../core/notes/markdown'

describe('Safe Markdown Renderer', () => {
  describe('isSafeUrl validator', () => {
    it('allows valid http, https, and relative URLs', () => {
      expect(isSafeUrl('https://example.com')).toBe(true)
      expect(isSafeUrl('http://example.com/page')).toBe(true)
      expect(isSafeUrl('/learn/html')).toBe(true)
      expect(isSafeUrl('./relative')).toBe(true)
      expect(isSafeUrl('../parent')).toBe(true)
      expect(isSafeUrl('#section')).toBe(true)
    })

    it('rejects unsafe protocols and malicious schemas', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false)
      expect(isSafeUrl('javascript:/*--></title></style></textarea></script>*/alert(1)')).toBe(false)
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false)
      expect(isSafeUrl('file:///etc/passwd')).toBe(false)
      expect(isSafeUrl('chrome://settings')).toBe(false)
    })
  })

  describe('Adversarial XSS Corpus (Zero raw HTML in DOM)', () => {
    it('renders script tags as inert plain text and never creates HTML script elements', () => {
      const xssScript = '<script>window.XSS_DETECTED = true; alert(1);</script>'
      const { container } = render(renderMarkdown(xssScript) as React.ReactElement)

      expect(container.querySelector('script')).toBeNull()
      expect(container.textContent).toContain('<script>window.XSS_DETECTED = true; alert(1);</script>')
      expect((window as unknown as Record<string, unknown>).XSS_DETECTED).toBeUndefined()
    })

    it('renders img onerror payload as inert text and never creates img element', () => {
      const xssImg = '<img src="x" onerror="window.XSS_DETECTED = true;" />'
      const { container } = render(renderMarkdown(xssImg) as React.ReactElement)

      expect(container.querySelector('img')).toBeNull()
      expect(container.textContent).toContain('<img src="x" onerror="window.XSS_DETECTED = true;" />')
      expect((window as unknown as Record<string, unknown>).XSS_DETECTED).toBeUndefined()
    })

    it('renders svg onload as inert text and never creates svg element', () => {
      const xssSvg = '<svg onload="alert(1)"><circle cx="10" cy="10" r="10"/></svg>'
      const { container } = render(renderMarkdown(xssSvg) as React.ReactElement)

      expect(container.querySelector('svg')).toBeNull()
      expect(container.textContent).toContain('<svg onload="alert(1)">')
    })

    it('disallows javascript: in markdown link and renders as plain text without anchor', () => {
      const xssLink = '[Click me to exploit](javascript:alert(1))'
      const { container } = render(renderMarkdown(xssLink) as React.ReactElement)

      const anchor = container.querySelector('a')
      expect(anchor).toBeNull()
      expect(container.textContent).toContain('[Click me to exploit](javascript:alert(1))')
    })

    it('disallows data: text/html in markdown link', () => {
      const xssData = '[Click me](data:text/html,<script>alert(1)</script>)'
      const { container } = render(renderMarkdown(xssData) as React.ReactElement)

      const anchor = container.querySelector('a')
      expect(anchor).toBeNull()
    })
  })

  describe('Markdown Syntax Features', () => {
    it('renders headings with correct hierarchy', () => {
      const md = '# Title\n## Subtitle\n### Section'
      const { container } = render(renderMarkdown(md) as React.ReactElement)

      expect(container.querySelector('h3')?.textContent).toBe('Title')
      expect(container.querySelector('h4')?.textContent).toBe('Subtitle')
      expect(container.querySelector('h5')?.textContent).toBe('Section')
    })

    it('renders bold, italic, and inline code', () => {
      const md = 'This is **bold** text, *italic* word, and `const x = 1`.'
      const { container } = render(renderMarkdown(md) as React.ReactElement)

      expect(container.querySelector('strong')?.textContent).toBe('bold')
      expect(container.querySelector('em')?.textContent).toBe('italic')
      expect(container.querySelector('code')?.textContent).toBe('const x = 1')
    })

    it('renders fenced code blocks', () => {
      const md = '```js\nfunction test() {\n  return 42;\n}\n```'
      const { container } = render(renderMarkdown(md) as React.ReactElement)

      const pre = container.querySelector('pre')
      expect(pre).toBeInTheDocument()
      expect(pre?.querySelector('code')?.textContent).toContain('function test()')
    })

    it('renders unordered and ordered lists', () => {
      const md = '- Item A\n- Item B\n\n1. First\n2. Second'
      const { container } = render(renderMarkdown(md) as React.ReactElement)

      const ul = container.querySelector('ul')
      expect(ul?.children.length).toBe(2)
      expect(ul?.children[0].textContent).toBe('Item A')

      const ol = container.querySelector('ol')
      expect(ol?.children.length).toBe(2)
      expect(ol?.children[0].textContent).toBe('First')
    })

    it('renders valid links safely with target and rel', () => {
      const md = '[MDN Web Docs](https://developer.mozilla.org)'
      const { container } = render(renderMarkdown(md) as React.ReactElement)

      const a = container.querySelector('a')
      expect(a).toBeInTheDocument()
      expect(a?.getAttribute('href')).toBe('https://developer.mozilla.org')
      expect(a?.getAttribute('target')).toBe('_blank')
      expect(a?.getAttribute('rel')).toBe('noopener noreferrer')
      expect(a?.textContent).toBe('MDN Web Docs')
    })
  })
})
