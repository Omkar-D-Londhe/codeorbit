import { describe, it, expect } from 'vitest'
import { requirementsToDiagnostics } from '../core/learning/diagnostics'
import type { RequirementResult } from '../lib/validators'

describe('diagnostics (7.1)', () => {
  it('returns an empty array when all requirements pass', () => {
    const results: RequirementResult[] = [
      { id: 'doctype', description: 'Starts with <!DOCTYPE html>', explanation: 'Standards mode', status: 'pass', met: true, line: 1 },
      { id: 'h1', description: 'Has h1', explanation: 'Main title', status: 'pass', met: true, line: 4 },
    ]
    const diags = requirementsToDiagnostics(results)
    expect(diags).toEqual([])
  })

  it('maps failed requirements to EditorDiagnostic objects with line and column', () => {
    const results: RequirementResult[] = [
      { id: 'doctype', description: 'Starts with <!DOCTYPE html>', explanation: 'Standards mode', status: 'pass', met: true, line: 1 },
      { id: 'alt', description: 'Every image has alt', explanation: 'Screen readers need alt', status: 'fail', met: false, line: 6, column: 3 },
    ]
    const diags = requirementsToDiagnostics(results)
    expect(diags).toHaveLength(1)
    expect(diags[0]).toEqual({
      line: 6,
      column: 3,
      severity: 'error',
      message: 'Every image has alt: Screen readers need alt',
    })
  })

  it('falls back to line 1 and column 1 if line is omitted or 0', () => {
    const results: RequirementResult[] = [
      { id: 'unknown', description: 'Required tag missing', explanation: 'Needed structure', status: 'fail', met: false },
    ]
    const diags = requirementsToDiagnostics(results)
    expect(diags).toHaveLength(1)
    expect(diags[0].line).toBe(1)
    expect(diags[0].column).toBe(1)
    expect(diags[0].severity).toBe('error')
  })
})
