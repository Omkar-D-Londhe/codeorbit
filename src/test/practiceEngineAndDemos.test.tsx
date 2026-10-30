import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { checkChallenge } from '../lib/validators'
import { getChallenge } from '../data/challenges'
import { reducer, draftKey } from '../state/reducer'
import { createDefaultState } from '../lib/storage'
import { FullscreenEditor } from '../core/editor/FullscreenEditor'
import { LiveDemo } from '../core/learning/LiveDemo'
import { AppStateProvider } from '../state/AppState'

describe('Practice Engine Reliability & Sandbox Audits', () => {
  beforeEach(() => {
    document.documentElement.className = ''
  })

  afterEach(() => {
    document.documentElement.className = ''
    vi.restoreAllMocks()
  })

  describe('1. Solution Evaluation on Precision Styling with Selectors', () => {
    const cssChallenge = getChallenge('ch-css-selectors')!

    it('finds and loads the Precision Styling with Selectors challenge', () => {
      expect(cssChallenge).toBeDefined()
      expect(cssChallenge.title).toBe('Precision Styling with Selectors')
      expect(cssChallenge.requirements.length).toBe(3)
    })

    it('evaluates the official reference solution as 100% passing across all 3 requirements', () => {
      const htmlFile = cssChallenge.files?.find((f) => f.name.endsWith('.html'))
      const htmlCode = htmlFile?.content ?? '<!DOCTYPE html><html><body><div class="card"><h2 class="card-title">Title</h2></div></body></html>'

      const referenceCss = `.card {
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.card-title {
  color: #1e293b;
  font-size: 1.25rem;
}
`
      const res = checkChallenge(cssChallenge, htmlCode, referenceCss)
      expect(res.passed).toBe(3)
      expect(res.total).toBe(3)
      expect(res.allPassed).toBe(true)
      expect(res.results.every((r) => r.status === 'pass')).toBe(true)
    })

    it('supports whitespace, comment, and formatting variations of valid solutions', () => {
      const htmlCode = '<!DOCTYPE html><html><body><div class="card"><h2 class="card-title">Title</h2></div></body></html>'

      // Variation 1: Comments, compact formatting, different spacing
      const compactCss = `/* Card container */
.card{padding:16px;border-radius:8px;}
/* Title */
.card-title{font-size:1.25rem;color:#1e293b;}`

      const res1 = checkChallenge(cssChallenge, htmlCode, compactCss)
      expect(res1.allPassed).toBe(true)

      // Variation 2: Uppercase hex, property order reordered, extra declarations
      const reorderedCss = `
.card-title {
  font-weight: 700;
  color: #1E293B;
}
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 16px;
}
`
      const res2 = checkChallenge(cssChallenge, htmlCode, reorderedCss)
      expect(res2.allPassed).toBe(true)
    })

    it('fails when selector specificity is violated (ID or element selectors)', () => {
      const htmlCode = '<!DOCTYPE html><html><body><div class="card"><h2 class="card-title">Title</h2></div></body></html>'

      // ID selector on .card
      const idCss = `#card {
  padding: 16px;
}
.card-title {
  color: #1e293b;
}
`
      const resId = checkChallenge(cssChallenge, htmlCode, idCss)
      expect(resId.results.find((r) => r.id === 'title-specificity')?.status).toBe('fail')
      expect(resId.allPassed).toBe(false)

      // Element selector qualification: div.card
      const elementQualifiedCss = `div.card {
  padding: 16px;
}
.card-title {
  color: #1e293b;
}
`
      const resElem = checkChallenge(cssChallenge, htmlCode, elementQualifiedCss)
      expect(resElem.results.find((r) => r.id === 'title-specificity')?.status).toBe('fail')
      expect(resElem.allPassed).toBe(false)

      // Element descendant selector: .card > h2
      const descendantCss = `.card {
  padding: 16px;
}
.card > h2 {
  color: #1e293b;
}
`
      const resDesc = checkChallenge(cssChallenge, htmlCode, descendantCss)
      expect(resDesc.results.find((r) => r.id === 'title-specificity')?.status).toBe('fail')
      expect(resDesc.allPassed).toBe(false)
    })

    it('fails when declarations are placed on the wrong selector or have wrong values', () => {
      const htmlCode = '<!DOCTYPE html><html><body><div class="card"><h2 class="card-title">Title</h2></div></body></html>'

      // padding on .other-card instead of .card
      const wrongSelectorCss = `.other-card {
  padding: 16px;
}
.card-title {
  color: #1e293b;
}
`
      const res = checkChallenge(cssChallenge, htmlCode, wrongSelectorCss)
      expect(res.results.find((r) => r.id === 'card-padding')?.status).toBe('fail')
      expect(res.results.find((r) => r.id === 'title-color')?.status).toBe('pass')
      expect(res.allPassed).toBe(false)
    })

    it('fails when required property value is incorrect', () => {
      const htmlCode = '<!DOCTYPE html><html><body><div class="card"><h2 class="card-title">Title</h2></div></body></html>'

      const wrongValueCss = `.card {
  padding: 32px;
}
.card-title {
  color: #ff0000;
}
`
      const res = checkChallenge(cssChallenge, htmlCode, wrongValueCss)
      expect(res.results.find((r) => r.id === 'card-padding')?.status).toBe('fail')
      expect(res.results.find((r) => r.id === 'title-color')?.status).toBe('fail')
      expect(res.allPassed).toBe(false)
    })
  })

  describe('2. Multi-File Draft Storage & User-Code Execution', () => {
    it('generates correct file-specific draft keys when fileName is provided', () => {
      expect(draftKey('ch-css-selectors')).toBe('ch-css-selectors')
      expect(draftKey('ch-css-selectors', undefined)).toBe('ch-css-selectors')
      expect(draftKey('ch-css-selectors', 'styles.css')).toBe('ch-css-selectors::styles.css')
      expect(draftKey('ch-css-selectors', 'index.html')).toBe('ch-css-selectors::index.html')
      expect(draftKey('ch-single-file', 'index.html', 1)).toBe('ch-single-file')
      expect(draftKey('ch-multi-file', 'styles.css', 2)).toBe('ch-multi-file::styles.css')
    })

    it('stores and retrieves multi-file learner drafts without overwriting or losing changes', () => {
      let state = createDefaultState()

      // User types in styles.css
      const userCss = '.card { padding: 16px; }'
      state = reducer(state, {
        type: 'SET_DRAFT',
        challengeId: 'ch-css-selectors',
        code: userCss,
        fileName: 'styles.css',
      })

      // Must be saved under the multi-file key
      expect(state.drafts['ch-css-selectors::styles.css']).toBe(userCss)

      // User switches to index.html and edits it
      const userHtml = '<div class="card">Hello</div>'
      state = reducer(state, {
        type: 'SET_DRAFT',
        challengeId: 'ch-css-selectors',
        code: userHtml,
        fileName: 'index.html',
      })

      expect(state.drafts['ch-css-selectors::index.html']).toBe(userHtml)
      expect(state.drafts['ch-css-selectors::styles.css']).toBe(userCss)

      // Clearing draft clears both files
      state = reducer(state, {
        type: 'CLEAR_DRAFT',
        challengeId: 'ch-css-selectors',
      })

      expect(state.drafts['ch-css-selectors::styles.css']).toBeUndefined()
      expect(state.drafts['ch-css-selectors::index.html']).toBeUndefined()
    })
  })

  describe('3. Direct Fullscreen Sidebar Behavior', () => {
    it('adds is-fullscreen class to document.documentElement when opened directly', () => {
      expect(document.documentElement.classList.contains('is-fullscreen')).toBe(false)

      const { rerender } = render(
        <AppStateProvider>
          <FullscreenEditor
            open={true}
            onClose={() => {}}
            editor={<div>Editor</div>}
            preview={<div>Preview</div>}
          />
        </AppStateProvider>
      )

      expect(document.documentElement.classList.contains('is-fullscreen')).toBe(true)

      // When closed, removes class and restores layout
      rerender(
        <AppStateProvider>
          <FullscreenEditor
            open={false}
            onClose={() => {}}
            editor={<div>Editor</div>}
            preview={<div>Preview</div>}
          />
        </AppStateProvider>
      )

      expect(document.documentElement.classList.contains('is-fullscreen')).toBe(false)
    })

    it('preserves is-focus state if user was already in focus mode before entering fullscreen', () => {
      document.documentElement.classList.add('is-focus')

      const { unmount } = render(
        <AppStateProvider>
          <FullscreenEditor
            open={true}
            onClose={() => {}}
            editor={<div>Editor</div>}
            preview={<div>Preview</div>}
          />
        </AppStateProvider>
      )

      expect(document.documentElement.classList.contains('is-fullscreen')).toBe(true)
      expect(document.documentElement.classList.contains('is-focus')).toBe(true)

      unmount()

      // Exiting fullscreen leaves focus mode intact
      expect(document.documentElement.classList.contains('is-fullscreen')).toBe(false)
      expect(document.documentElement.classList.contains('is-focus')).toBe(true)
    })

    it('exits fullscreen on Escape key press and restores previous state', () => {
      const handleClose = vi.fn()
      render(
        <AppStateProvider>
          <FullscreenEditor
            open={true}
            onClose={handleClose}
            editor={<div>Editor</div>}
            preview={<div>Preview</div>}
          />
        </AppStateProvider>
      )

      expect(document.documentElement.classList.contains('is-fullscreen')).toBe(true)
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('4. Interactive Demos & Sandboxes Across Tracks', () => {
    it('HTML demo: allows live edits and reflects changed content in preview', async () => {
      const htmlDemo = {
        id: 'demo-test-html',
        title: 'HTML Structure Demo',
        files: [{ name: 'index.html', content: '<h1>Original Heading</h1>' }],
      }

      const { container } = render(<LiveDemo demo={htmlDemo} trackId="html" />)
      const textarea = screen.getByRole('textbox', { name: /code editor for html structure demo/i })
      expect(textarea).toHaveValue('<h1>Original Heading</h1>')

      // Edit 1: change text
      fireEvent.change(textarea, { target: { value: '<h1>Modified Heading 1</h1>' } })
      expect(textarea).toHaveValue('<h1>Modified Heading 1</h1>')
      expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('<h1>Modified Heading 1</h1>')

      // Edit 2: add paragraph
      fireEvent.change(textarea, { target: { value: '<h1>Title</h1><p>New paragraph</p>' } })
      expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('<p>New paragraph</p>')

      // Edit 3: add button
      fireEvent.change(textarea, { target: { value: '<button>Click Me</button>' } })
      expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('<button>Click Me</button>')

      // Reset restores original code
      fireEvent.click(screen.getByRole('button', { name: /reset html structure demo to original/i }))
      expect(textarea).toHaveValue('<h1>Original Heading</h1>')
      expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('<h1>Original Heading</h1>')
    })

    it('CSS demo: allows modifying styles live and updates preview', async () => {
      const cssDemo = {
        id: 'demo-test-css',
        title: 'CSS Selector Demo',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html><html><head><style>.box { background: blue; padding: 10px; }</style></head><body><div class="box">Content</div></body></html>`,
          },
        ],
      }

      const { container } = render(<LiveDemo demo={cssDemo} trackId="css" />)
      const textarea = screen.getByRole('textbox', { name: /code editor for css selector demo/i })

      // Edit 1: change background color
      fireEvent.change(textarea, { target: { value: `<style>.box { background: red; padding: 10px; }</style><div class="box">Content</div>` } })
      expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('background: red;')

      // Edit 2: change padding
      fireEvent.change(textarea, { target: { value: `<style>.box { background: red; padding: 30px; }</style><div class="box">Content</div>` } })
      expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('padding: 30px;')

      // Edit 3: add border-radius
      fireEvent.change(textarea, { target: { value: `<style>.box { border-radius: 12px; }</style><div class="box">Content</div>` } })
      expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('border-radius: 12px;')
    })

    it('JavaScript demo: enables script-preview mode allowing scripts to execute in sandbox', () => {
      const jsDemo = {
        id: 'demo-test-js',
        title: 'JS Variables Demo',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html><html><body><span id="res"></span><script>document.getElementById("res").textContent="42";</script></body></html>`,
          },
        ],
      }

      const { container } = render(<LiveDemo demo={jsDemo} trackId="javascript" />)
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeInTheDocument()
      // JS demo must grant allow-scripts mode
      expect(iframe?.getAttribute('sandbox')).toContain('allow-scripts')
    })

    it('Bootstrap demo: injects bootstrap stylesheets into preview', async () => {
      const bsDemo = {
        id: 'demo-bs-grid-test',
        title: 'Bootstrap Grid Demo',
        files: [
          {
            name: 'index.html',
            content: `<div class="container my-4"><div class="row"><div class="col-6 bg-primary text-white">Left</div></div></div>`,
          },
        ],
      }

      const { container } = render(<LiveDemo demo={bsDemo} trackId="bootstrap" />)
      const textarea = screen.getByRole('textbox', { name: /code editor for bootstrap grid demo/i })

      // Edit 1: change col width
      fireEvent.change(textarea, { target: { value: `<div class="container my-4"><div class="row"><div class="col-12 bg-success">Full</div></div></div>` } })
      expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('col-12 bg-success')
    })

    it('Python demo: renders interactive runner with Run button and terminal output', () => {
      const pyDemo = {
        id: 'demo-py-test',
        title: 'Python Math Demo',
        files: [
          {
            name: 'math_demo.py',
            content: 'x = 10\ny = 20\nprint(f"Sum: {x + y}")',
          },
        ],
      }

      render(<LiveDemo demo={pyDemo} trackId="python" />)
      expect(screen.getByRole('button', { name: /run python math demo/i })).toBeInTheDocument()
      expect(screen.getByTestId('python-demo-output')).toBeInTheDocument()
    })
  })
})
