import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppStateProvider } from '../state/AppState'
import Explore from '../pages/Explore'
import Track from '../pages/Track'
import fs from 'node:fs'
import path from 'node:path'

function renderWithProviders(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppStateProvider>
        <Routes>
          <Route path="/explore" element={<Explore />} />
          <Route path="/learn/:technologyId" element={<Track />} />
          <Route path="/concepts" element={<div>Concept Atlas Mock</div>} />
        </Routes>
      </AppStateProvider>
    </MemoryRouter>
  )
}

describe('Pass 2 — Angular Track & Architectural Boundaries (O-05, L-14)', () => {
  it('displays the Angular track card with Available badge on Explore page', () => {
    renderWithProviders('/explore')

    // Find Angular track title
    const angularHeader = screen.getByRole('heading', { name: 'Angular' })
    expect(angularHeader).toBeInTheDocument()

    // Find Available badge
    const badges = screen.getAllByText('Available')
    expect(badges.length).toBeGreaterThan(0)

    // Practice capability is rendered
    expect(screen.getAllByTestId('capability-practice').length).toBeGreaterThan(0)
  })

  it('renders Angular track page with lessons and quizzes', () => {
    renderWithProviders('/learn/angular')

    // Track title and description are rendered
    expect(screen.getByRole('heading', { name: 'Angular Learning Orbit' })).toBeInTheDocument()
    expect(screen.getByText(/0 of 6 topics complete/)).toBeInTheDocument()

    // Continue track button directs to first lesson
    const continueBtn = screen.getByRole('link', { name: /Continue track/i })
    expect(continueBtn).toBeInTheDocument()
    expect(continueBtn.getAttribute('href')).toBe('/lesson/ng-components')
  })

  it('verifies that no Angular framework imports exist in src/core (Rule L-14)', () => {
    const coreDir = path.resolve(__dirname, '../core')

    function scanDir(dir: string): string[] {
      const files: string[] = []
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          files.push(...scanDir(fullPath))
        } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
          files.push(fullPath)
        }
      }
      return files
    }

    const coreFiles = scanDir(coreDir)
    expect(coreFiles.length).toBeGreaterThan(10)

    for (const filePath of coreFiles) {
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).not.toMatch(/from\s+['"]@angular\//)
      expect(content).not.toMatch(/require\(['"]@angular\//)
    }
  })

  it('verifies decision memo docs/ANGULAR_OPTIONS.md contains empirical measured sizes', () => {
    const memoPath = path.resolve(__dirname, '../../docs/ANGULAR_OPTIONS.md')
    expect(fs.existsSync(memoPath)).toBe(true)

    const memoContent = fs.readFileSync(memoPath, 'utf-8')
    expect(memoContent).toContain('5,040,415 bytes') // @angular/compiler unpacked
    expect(memoContent).toContain('2,497,498 bytes') // typescript unpacked
    expect(memoContent).toContain('Gate O-05')
    expect(memoContent).toContain('Option (a)')
    expect(memoContent).toContain('Option (b)')
    expect(memoContent).toContain('Option (c)')
  })
})
