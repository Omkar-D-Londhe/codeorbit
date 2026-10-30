import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { SandboxedPreview } from '../components/SandboxedPreview'

describe('Stage 24: Bootstrap Responsive Breakpoints & Device Frames (G3, §7.6)', () => {
  it('renders sandboxed preview with responsive device frames', () => {
    const sampleGrid = `
      <div class="container">
        <div class="row">
          <div class="col-12 col-md-6 col-lg-4">Card 1</div>
          <div class="col-12 col-md-6 col-lg-4">Card 2</div>
        </div>
      </div>
    `
    const fakeBootstrapCss = `
      .container { width: 100%; margin: auto; }
      @media (min-width: 768px) { .col-md-6 { width: 50%; } }
      @media (min-width: 992px) { .col-lg-4 { width: 33.333%; } }
    `

    // 1. Mobile frame (390×844 / 375×667)
    const { container: mobileContainer, unmount: unmountMobile } = render(
      <SandboxedPreview
        html={sampleGrid}
        frame="mobile"
        stylesheets={[fakeBootstrapCss]}
      />
    )
    const mobileIframe = mobileContainer.querySelector('iframe')
    expect(mobileIframe).toBeInTheDocument()
    expect(mobileIframe).toHaveClass('preview__frame--mobile')
    expect(mobileIframe?.getAttribute('sandbox')).toBe('')
    expect(mobileIframe?.getAttribute('srcdoc')).toContain('<style data-track-stylesheet="true">')
    unmountMobile()

    // 2. Tablet frame (820×1180 / 768px)
    const { container: tabletContainer, unmount: unmountTablet } = render(
      <SandboxedPreview
        html={sampleGrid}
        frame="tablet"
        stylesheets={[fakeBootstrapCss]}
      />
    )
    const tabletIframe = tabletContainer.querySelector('iframe')
    expect(tabletIframe).toBeInTheDocument()
    expect(tabletIframe).toHaveClass('preview__frame--tablet')
    unmountTablet()

    // 3. Desktop frame (1280×800)
    const { container: desktopContainer, unmount: unmountDesktop } = render(
      <SandboxedPreview
        html={sampleGrid}
        frame="desktop"
        stylesheets={[fakeBootstrapCss]}
      />
    )
    const desktopIframe = desktopContainer.querySelector('iframe')
    expect(desktopIframe).toBeInTheDocument()
    expect(desktopIframe).toHaveClass('preview__frame--desktop')
    unmountDesktop()
  })

  it('guarantees preview iframe retains sandbox="" and no script execution for Bootstrap track', () => {
    const maliciousHtml = `<script>window.parent.hacked = true;</script><div class="container">Clean</div>`
    const { container } = render(
      <SandboxedPreview html={maliciousHtml} mode="static" stylesheets={['/* bs */']} />
    )
    const iframe = container.querySelector('iframe')
    expect(iframe?.getAttribute('sandbox')).toBe('')
    // srcdoc has CSP default-src 'none' preventing scripts
    expect(iframe?.getAttribute('srcdoc')).toContain("Content-Security-Policy\" content=\"default-src 'none'")
  })
})
