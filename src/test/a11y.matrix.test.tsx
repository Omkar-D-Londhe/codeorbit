import { describe, it, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { expectNoA11yViolations } from './a11y'
import { applyAppearance } from '../core/settings/appearance'

const ROUTES = [
  '/',
  '/explore',
  '/learn/html',
  '/lesson/html-intro',
  '/quiz/html-intro',
  '/practice/ch-html-tags',
  '/progress',
  '/review',
  '/settings',
]

const MATRIX = [
  { theme: 'obsidian' as const, contrast: 'normal' as const, scale: 1 as const },
  { theme: 'starlight' as const, contrast: 'normal' as const, scale: 1 as const },
  { theme: 'obsidian' as const, contrast: 'high' as const, scale: 1.5 as const },
  { theme: 'starlight' as const, contrast: 'high' as const, scale: 1.5 as const },
]

describe('A11y Matrix Sweep (FC-32, Spec §6 & §13)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-contrast')
    document.documentElement.style.removeProperty('--font-scale')
  })

  for (const config of MATRIX) {
    describe(`Theme: ${config.theme}, Contrast: ${config.contrast}, Scale: ${config.scale}`, () => {
      beforeEach(() => {
        applyAppearance({
          theme: config.theme,
          accent: 'violet',
          contrast: config.contrast,
          motion: 'full',
          fontScale: config.scale,
        })
      })

      for (const route of ROUTES) {
        it(`route "${route}" has zero serious or critical a11y violations`, async () => {
          const { container } = render(
            <MemoryRouter initialEntries={[route]}>
              <App />
            </MemoryRouter>
          )

          await expectNoA11yViolations(container)
        })
      }
    })
  }
})
