import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { checkChallenge } from '../lib/validators'
import { javaTrack } from '../tracks/java/track'
import { cppTrack } from '../tracks/cpp/track'

describe('Hard Gate O-04 & Capability Honesty Verification (Pass 2, O-04, L-06, L-09)', () => {
  it('provides genuine execution capability for Java and C++ tracks (O-04)', () => {
    expect(javaTrack.capabilities).toContain('execution')
    expect(javaTrack.runner).toBeDefined()
    expect(javaTrack.availability).toBe('available')

    expect(cppTrack.capabilities).toContain('execution')
    expect(cppTrack.runner).toBeDefined()
    expect(cppTrack.availability).toBe('available')
  })

  it('validating infinite loops or malicious payloads does not execute code', () => {
    const dangerousJava = [
      'while (true) {}',
      'Runtime.getRuntime().exec("rm -rf /");',
      'System.exit(1);',
    ]
    for (const code of dangerousJava) {
      for (const ch of javaTrack.challenges) {
        expect(() => checkChallenge(ch, code)).not.toThrow()
      }
    }

    const dangerousCpp = [
      'while(true) {}',
      'system("rm -rf /");',
      'exit(1);',
    ]
    for (const code of dangerousCpp) {
      for (const ch of cppTrack.challenges) {
        expect(() => checkChallenge(ch, code)).not.toThrow()
      }
    }
  })

  it('guarantees zero calls to Web Worker during checkChallenge for Java and C++', () => {
    const workerSpy = vi.fn()
    const globalAny = globalThis as unknown as { Worker?: unknown }
    const originalWorker = globalAny.Worker

    try {
      globalAny.Worker = workerSpy

      const javaCh = javaTrack.challenges[0]
      const javaRes = checkChallenge(javaCh, javaCh.solutionCode)
      expect(javaRes.allPassed).toBe(true)

      const cppCh = cppTrack.challenges[0]
      const cppRes = checkChallenge(cppCh, cppCh.solutionCode)
      expect(cppRes.allPassed).toBe(true)

      expect(workerSpy).not.toHaveBeenCalled()
    } finally {
      globalAny.Worker = originalWorker
    }
  })

  it('renders Java Practice with Run button and Execution Sandbox pane', () => {
    const javaCh = javaTrack.challenges[0]

    render(
      <MemoryRouter initialEntries={[`/practice/${javaCh.id}`]}>
        <App />
      </MemoryRouter>
    )

    // Run button is PRESENT
    expect(screen.getByRole('button', { name: /^Run$/i })).toBeInTheDocument()

    // Check solution button is PRESENT
    expect(screen.getByRole('button', { name: /Check solution/i })).toBeInTheDocument()

    // Execution Sandbox pane is rendered
    expect(screen.getByText(/Java Execution Sandbox/i)).toBeInTheDocument()
    expect(screen.getByText(/3,000ms watchdog/i)).toBeInTheDocument()
  })

  it('renders C++ Practice with Run button and Execution Sandbox pane', () => {
    const cppCh = cppTrack.challenges[0]

    render(
      <MemoryRouter initialEntries={[`/practice/${cppCh.id}`]}>
        <App />
      </MemoryRouter>
    )

    // Run button is PRESENT
    expect(screen.getByRole('button', { name: /^Run$/i })).toBeInTheDocument()

    // Check solution button is PRESENT
    expect(screen.getByRole('button', { name: /Check solution/i })).toBeInTheDocument()

    // Execution Sandbox pane is rendered
    expect(screen.getByText(/C\+\+ Execution Sandbox/i)).toBeInTheDocument()
    expect(screen.getByText(/3,000ms watchdog/i)).toBeInTheDocument()
  })

  it('displays Run: not available chip on Explore page for non-executing tracks', () => {
    render(
      <MemoryRouter initialEntries={['/explore']}>
        <App />
      </MemoryRouter>
    )

    const unavailChips = screen.getAllByTestId('capability-run-unavailable')
    expect(unavailChips.length).toBeGreaterThanOrEqual(1)
  })

  it('guarantees Explore track cards display deduplicated capability chips with no duplicate labels', () => {
    render(
      <MemoryRouter initialEntries={['/explore']}>
        <App />
      </MemoryRouter>
    )

    const capabilityContainers = document.querySelectorAll('.track-capabilities')
    expect(capabilityContainers.length).toBeGreaterThan(0)

    for (const container of capabilityContainers) {
      const chips = Array.from(container.querySelectorAll('.badge')).map((el) => el.textContent?.trim())
      const uniqueChips = new Set(chips)
      expect(uniqueChips.size).toBe(chips.length)
    }
  })
})
