import { describe, it, expect } from 'vitest'
import {
  buildScriptPreviewDocument,
  SCRIPT_PREVIEW_CSP,
} from '../lib/preview'
import {
  IframePreviewRunner,
  SCRIPT_PREVIEW_SANDBOX,
  generatePreviewNonce,
} from '../core/runner/iframePreviewRunner'
import { createPreviewHarnessScript } from '../tracks/javascript/previewHarness'

describe('Stage 23a: JavaScript Script Preview & Security Isolation (PLT-11, C-05)', () => {
  it('enforces strict sandbox attribute: allow-scripts ONLY, never allow-same-origin', () => {
    expect(SCRIPT_PREVIEW_SANDBOX).toBe('allow-scripts')
    expect(SCRIPT_PREVIEW_SANDBOX.includes('allow-same-origin')).toBe(false)

    const runner = new IframePreviewRunner('script')
    expect(runner.sandbox).toBe('allow-scripts')
    expect(runner.sandbox.includes('allow-same-origin')).toBe(false)
  })

  it('keeps static preview completely script-free with sandbox empty', () => {
    const runner = new IframePreviewRunner('static')
    expect(runner.sandbox).toBe('')
  })

  it('embeds strict CSP meta tag in generated script preview document', () => {
    const nonce = 'test-nonce-12345'
    const files = [
      { name: 'index.html', language: 'html', content: '<h1>DOM Test</h1>' },
      { name: 'solution.js', language: 'javascript', content: "console.log('from preview');" },
    ]
    const html = buildScriptPreviewDocument(files, nonce)

    expect(html).toContain('http-equiv="Content-Security-Policy"')
    expect(html).toContain(SCRIPT_PREVIEW_CSP)
    expect(html).toContain("default-src 'none'")
    expect(html).toContain("script-src 'unsafe-inline'")
    expect(html).toContain("style-src 'unsafe-inline'")
    expect(html).toContain('img-src data:')
  })

  it('injects harness script tagged with the specific per-run nonce', () => {
    const nonce = 'secure-run-nonce-abc'
    const files = [
      { name: 'index.html', language: 'html', content: '<button id="btn">Click</button>' },
      { name: 'solution.js', language: 'javascript', content: "document.getElementById('btn').click();" },
    ]
    const html = buildScriptPreviewDocument(files, nonce)

    expect(html).toContain(nonce)
    expect(html).toContain('data-codeorbit-harness="true"')
    expect(html).toContain('window.parent.postMessage')
  })

  it('generates distinct cryptographic nonces per run', () => {
    const nonce1 = generatePreviewNonce()
    const nonce2 = generatePreviewNonce()

    expect(nonce1).toBeTruthy()
    expect(nonce2).toBeTruthy()
    expect(nonce1).not.toBe(nonce2)
  })

  it('creates harness script code that captures console and errors with nonce filtering', () => {
    const nonce = 'unique-nonce-xyz'
    const script = createPreviewHarnessScript(nonce)

    expect(script).toContain(nonce)
    expect(script).toContain('window.parent.postMessage')
    expect(script).toContain("window.addEventListener('error'")
    expect(script).toContain('unhandledrejection')
    expect(script).toContain("msg.type === 'dispatch'")
    expect(script).toContain("msg.type === 'query'")
  })
})
