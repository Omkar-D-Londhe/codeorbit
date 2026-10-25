import type { EditorDiagnostic } from '../editor/types'
import type { RequirementResult } from '../../lib/validators'

/**
 * Maps requirement evaluation results to editor diagnostics (7.1).
 * Only unmet/failed requirements generate editor diagnostics (error squiggles/gutter markers).
 */
export function requirementsToDiagnostics(results: RequirementResult[]): EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = []

  for (const r of results) {
    const isFailed = r.status === 'fail' || r.met === false
    if (isFailed) {
      diagnostics.push({
        line: r.line && r.line > 0 ? r.line : 1,
        column: r.column && r.column > 0 ? r.column : 1,
        severity: 'error',
        message: r.explanation ? `${r.description}: ${r.explanation}` : r.description,
      })
    }
  }

  return diagnostics
}
