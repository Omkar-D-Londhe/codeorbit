import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { buildPreviewDocument, CSP } from '../lib/preview'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'
import { AppStateProvider } from '../state/AppState'

describe('Stage 24: Bootstrap Vendor & Preview Stylesheet Isolation', () => {
  const vendorDir = path.resolve(__dirname, '../tracks/bootstrap/vendor')
  const cssPath = path.join(vendorDir, 'bootstrap.min.css')
  const licensePath = path.join(vendorDir, 'LICENSE-bootstrap')
  const dependencyDocPath = path.resolve(__dirname, '../tracks/bootstrap/DEPENDENCY.md')

  it('vendors official Bootstrap 5.3.3 CSS with correct SHA256 checksum', () => {
    expect(fs.existsSync(cssPath), 'bootstrap.min.css must exist').toBe(true)
    const content = fs.readFileSync(cssPath)
    expect(content.length).toBeGreaterThan(150000) // ~232 KB

    const hash = crypto.createHash('sha256').update(content).digest('hex')
    const dependencyDoc = fs.readFileSync(dependencyDocPath, 'utf-8')
    expect(dependencyDoc).toContain(hash)
    expect(hash).toBe('3c8f27e6009ccfd710a905e6dcf12d0ee3c6f2ac7da05b0572d3e0d12e736fc8')
  })

  it('includes official MIT licence file alongside the vendored stylesheet', () => {
    expect(fs.existsSync(licensePath), 'LICENSE-bootstrap must exist').toBe(true)
    const licenseText = fs.readFileSync(licensePath, 'utf-8')
    expect(licenseText).toContain('MIT License')
    expect(licenseText).toContain('The Bootstrap Authors')
  })

  it('injects track stylesheets as <style data-track-stylesheet="true"> in preview <head>', () => {
    const fakeCss = '.test-bs-grid { display: flex; }'
    const doc = buildPreviewDocument('<div class="test-bs-grid">Content</div>', {
      stylesheets: [fakeCss],
    })

    expect(doc).toContain('<style data-track-stylesheet="true">.test-bs-grid { display: flex; }</style>')
    expect(doc).toContain('<meta http-equiv="Content-Security-Policy"')
  })

  it('strictly enforces no-network CSP on preview documents with injected stylesheets', () => {
    const doc = buildPreviewDocument('<div class="container">Test</div>', {
      stylesheets: ['/* bootstrap styles */'],
    })

    expect(doc).toContain(`content="${CSP}"`)
    expect(CSP).toContain("default-src 'none'")
    expect(doc).not.toContain('http://')
    expect(doc).not.toContain('https://')
    expect(doc).not.toContain('cdn.jsdelivr.net')
  })

  it('preserves complete style isolation: platform pages are unaffected by vendored Bootstrap CSS', () => {
    const { container } = render(
      <AppStateProvider>
        <MemoryRouter initialEntries={['/']}>
          <Home />
        </MemoryRouter>
      </AppStateProvider>,
    )

    // Verify platform uses its own design system tokens and has no foreign Bootstrap classes
    expect(container.querySelector('.container')).toBeNull()
    expect(container.querySelector('.row')).toBeNull()
    expect(container.querySelector('.navbar')).toBeNull()
  })
})
