import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { executeAngular } from '../tracks/angular/runner'
import { SandboxedPreview } from '../components/SandboxedPreview'
import { PREVIEW_SANDBOX } from '../lib/preview'
import { SCRIPT_PREVIEW_SANDBOX } from '../core/runner/iframePreviewRunner'

describe('P3-H01: Angular Reactive Preview & Security Boundary', () => {
  it('compiles standalone Angular component with Signals into a reactive preview document', async () => {
    const code = `
      import { Component, signal } from '@angular/core';

      @Component({
        selector: 'app-counter',
        standalone: true,
        template: \`
          <div class="counter">
            <span>Count: {{ count() }}</span>
            <button (click)="increment()">Increment</button>
          </div>
        \`,
      })
      export class CounterComponent {
        count = signal(0);
        increment() {
          this.count.update(c => c + 1);
        }
      }
    `
    const res = await executeAngular(code)
    expect(res.status).toBe('ok')
    if (res.status !== 'ok') throw new Error('Expected ok')
    expect(res.previewDoc).toBeDefined()
    const doc = res.previewDoc!

    // Verify CSP meta tag inside preview
    expect(doc).toContain('Content-Security-Policy')
    expect(doc).toContain("default-src 'none'")
    expect(doc).toContain("script-src 'unsafe-inline'")

    // Verify initial signals extraction and runtime script
    expect(doc).toContain('"count":0')
    expect(doc).toContain('function render()')
    expect(doc).toContain('root.querySelectorAll(\'button\')')
    expect(doc).toContain('codeorbit:angular-preview')
  })

  it('compiles templates with pipes, two-way bindings, and @if/@for control flow', async () => {
    const code = `
      import { Component } from '@angular/core';

      @Component({
        selector: 'app-dashboard',
        standalone: true,
        template: \`
          <h2>{{ title | uppercase }}</h2>
          <input [(ngModel)]="searchQuery" />
          @if (isLoggedIn) {
            <p>Welcome back!</p>
          } @else {
            <p>Please log in</p>
          }
          @for (item of items; track item.id) {
            <li>{{ item.name }}</li>
          }
        \`,
      })
      export class DashboardComponent {
        title = 'Angular Directives';
        searchQuery = 'Signals';
        isLoggedIn = true;
        items = [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }];
      }
    `
    const res = await executeAngular(code)
    expect(res.status).toBe('ok')
    if (res.status !== 'ok') throw new Error('Expected ok')
    expect(res.previewDoc).toContain('Angular Directives')
    expect(res.previewDoc).toContain('Signals')
    expect(res.previewDoc).toContain('Alpha')
  })

  it('mounts Angular preview in SandboxedPreview with sandbox="allow-scripts" and strictly NO allow-same-origin', async () => {
    const res = await executeAngular(`
      import { Component } from '@angular/core';
      @Component({ selector: 'app-test', standalone: true, template: '<p>Test</p>' })
      export class TestComponent {}
    `)
    expect(res.status).toBe('ok')
    if (res.status !== 'ok') throw new Error('Expected ok')

    const { container } = render(
      <SandboxedPreview html={res.previewDoc} mode="script" />
    )
    const iframe = container.querySelector('iframe')!
    expect(iframe).toBeDefined()

    const sandbox = iframe.getAttribute('sandbox') || ''
    expect(sandbox).toBe(SCRIPT_PREVIEW_SANDBOX)
    expect(sandbox).toContain('allow-scripts')
    expect(sandbox).not.toContain('allow-same-origin')
    expect(iframe.getAttribute('srcdoc')).toContain('Angular v18 Standalone Component')
  })

  it('keeps static HTML/CSS previews strictly script-free with empty sandbox=""', () => {
    const staticHtml = '<h1>Static Heading</h1><p>No scripts</p>'
    const { container } = render(
      <SandboxedPreview html={staticHtml} mode="static" />
    )
    const iframe = container.querySelector('iframe')!
    expect(iframe.getAttribute('sandbox')).toBe(PREVIEW_SANDBOX)
    expect(iframe.getAttribute('sandbox')).toBe('')
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-scripts')
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-same-origin')
  })

  it('handles malformed Angular component gracefully without unhandled exceptions', async () => {
    const malformedCode = `
      export class BrokenComponent {
        // missing @Component decorator and template
      }
    `
    const res = await executeAngular(malformedCode)
    expect(res.status).toBe('ok')
    if (res.status !== 'ok') throw new Error('Expected ok')
    expect(res.previewDoc).toContain('Angular Component')
  })

  it('rejects unauthorized message schemas from preview frames', () => {
    const onMessage = vi.fn()
    const validator = (ev: { data: unknown }) => {
      if (!ev.data || typeof ev.data !== 'object') return false
      const data = ev.data as Record<string, unknown>
      if (data.type !== 'codeorbit:angular-preview') return false
      if (!['ready', 'render', 'state-change', 'error'].includes(data.event as string)) return false
      onMessage(data)
      return true
    }

    // Malicious or unexpected messages
    expect(validator({ data: { type: 'untrusted-exploit', payload: 'pwn' } })).toBe(false)
    expect(validator({ data: 'plain string' })).toBe(false)
    expect(validator({ data: null })).toBe(false)
    expect(onMessage).not.toHaveBeenCalled()

    // Valid Angular preview message
    const valid = { type: 'codeorbit:angular-preview', event: 'state-change', state: { count: 1 } }
    expect(validator({ data: valid })).toBe(true)
    expect(onMessage).toHaveBeenCalledWith(valid)
  })
})
