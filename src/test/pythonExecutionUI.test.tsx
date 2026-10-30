import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import fs from 'node:fs'
import path from 'node:path'

describe('Stage 25b: Python Opt-In UX, Non-Executing Preview & Lazy Loading (O-03, L-08, L-14)', () => {
  const renderPractice = (challengeId = 'py-ch-basics') => {
    return render(
      <MemoryRouter initialEntries={[`/practice/${challengeId}`]}>
        <App />
      </MemoryRouter>
    )
  }

  it('renders Python Practice in non-executing Structure Preview by default when execution is not enabled', async () => {
    localStorage.removeItem('codeorbit:python:execution_enabled')
    renderPractice('py-ch-basics')

    expect(await screen.findByRole('heading', { name: /structure preview/i })).toBeDefined()
    expect(screen.getByText(/structure check mode — your code is not run/i)).toBeDefined()
    expect(screen.getByText(/Python Execution Sandbox/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Download & Enable Python/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Keep Structure Preview/i })).toBeDefined()

    // Toolbar Run button is hidden while execution is disabled
    expect(screen.queryByRole('button', { name: /^Run$/i })).toBeNull()
  })

  it('allows learner to decline execution and continue using Structure Preview', async () => {
    localStorage.removeItem('codeorbit:python:execution_enabled')
    renderPractice('py-ch-basics')

    const declineBtn = await screen.findByRole('button', { name: /Keep Structure Preview/i })
    fireEvent.click(declineBtn)

    // Disclosure card is dismissed
    await waitFor(() => {
      expect(screen.queryByText(/Python Execution Sandbox/i)).toBeNull()
    })

    // Structure preview remains active
    expect(screen.getByRole('heading', { name: /structure preview/i })).toBeDefined()
    expect(screen.queryByRole('button', { name: /^Run$/i })).toBeNull()
  })

  it('switches to Python Sandbox and reveals Run button when execution is enabled', async () => {
    localStorage.setItem('codeorbit:python:execution_enabled', 'true')
    renderPractice('py-ch-basics')

    expect(await screen.findByRole('heading', { name: /python sandbox/i })).toBeDefined()
    expect(screen.getByText(/WebAssembly Worker/i)).toBeDefined()

    // Run button in toolbar is now visible
    expect(screen.getByRole('button', { name: /^Run$/i })).toBeDefined()

    // Can toggle back to Structure Preview
    const toggleBtn = screen.getByRole('button', { name: /Structure Preview/i })
    fireEvent.click(toggleBtn)

    expect(await screen.findByRole('heading', { name: /structure preview/i })).toBeDefined()
  })

  it('verifies that Pyodide assets are excluded from the main Vite application bundle', () => {
    // Inspect index.html and package.json
    const indexHtml = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8')
    expect(indexHtml).not.toContain('pyodide.asm.wasm')
    expect(indexHtml).not.toContain('/pyodide/pyodide.js')

    const appTsx = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf8')
    expect(appTsx).not.toContain('pyodide')
  })

  it('verifies that sw.js contains dedicated caching for Pyodide assets', () => {
    const swJs = fs.readFileSync(path.resolve(__dirname, '../../public/sw.js'), 'utf8')
    expect(swJs).toContain('codeorbit-pyodide-v1')
    expect(swJs).toContain('isPyodideAsset')
    expect(swJs).toContain('/pyodide/')
    expect(swJs).toContain('wasm')
    expect(swJs).toContain('PYODIDE_CACHE')
  })
})
