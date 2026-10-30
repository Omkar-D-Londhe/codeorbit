import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { checkChallenge } from '../lib/validators'
import { pythonTrack } from '../tracks/python/track'

describe('Absence of Python Code Execution Verification (Stage 25a, L-06, L-07)', () => {
  it('does NOT execute code when validating infinite loops or malicious payloads', () => {
    const dangerousPayloads = [
      'while True:\n    pass',
      'import os\nos.system("rm -rf /")',
      '__import__("subprocess").Popen(["ls", "-la"])',
      'import socket\ns = socket.socket()',
      'f = open("untrusted.txt", "w")\nf.write("payload")',
    ]

    for (const code of dangerousPayloads) {
      // Validate across all python challenges without executing
      for (const ch of pythonTrack.challenges) {
        expect(() => checkChallenge(ch, code)).not.toThrow()
        const res = checkChallenge(ch, code)
        expect(typeof res.passed).toBe('number')
      }
    }
  })

  it('guarantees zero calls to Web Worker or evaluation runners during checkChallenge', () => {
    const workerSpy = vi.fn()
    const globalAny = globalThis as unknown as { Worker?: unknown }
    const originalWorker = globalAny.Worker

    try {
      globalAny.Worker = workerSpy

      const sampleChallenge = pythonTrack.challenges[0]
      const result = checkChallenge(sampleChallenge, sampleChallenge.solutionCode)

      expect(result.allPassed).toBe(true)
      expect(workerSpy).not.toHaveBeenCalled()
    } finally {
      globalAny.Worker = originalWorker
    }
  })

  it('renders Practice without Run button and displays Structure check preview for Python', () => {
    const pythonChallenge = pythonTrack.challenges[0]

    render(
      <MemoryRouter initialEntries={[`/practice/${pythonChallenge.id}`]}>
        <App />
      </MemoryRouter>
    )

    // Verify Run button is ABSENT
    const runBtn = screen.queryByRole('button', { name: /^Run$/i })
    expect(runBtn).toBeNull()

    // Verify Check solution button is PRESENT
    const checkBtn = screen.getByRole('button', { name: /Check solution/i })
    expect(checkBtn).toBeInTheDocument()

    // Verify Structure Preview pane is rendered
    expect(screen.getByText('Structure Preview')).toBeInTheDocument()
    expect(screen.getAllByText(/Structure check mode — your code is not run/i).length).toBeGreaterThanOrEqual(1)

    // Verify Non-Executing chip
    expect(screen.getByText('Non-Executing')).toBeInTheDocument()

    // Verify Analyse & improve button is present and accessible
    const analyseBtn = screen.getByRole('button', { name: /Analyse & improve/i })
    expect(analyseBtn).toBeInTheDocument()
  })
})
