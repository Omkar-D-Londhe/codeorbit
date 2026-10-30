import type { CodeOrbitState } from '../../state/types'
import { migrate, sanitizeState, SCHEMA_VERSION } from '../../lib/storage'
import { SOFT_BUDGET_BYTES } from './quota'

export interface ExportFile {
  app: 'codeorbit'
  exportVersion: 1
  schemaVersion: number
  exportedAt: number
  state: CodeOrbitState
}

export interface ImportSummary {
  topicsTouched: number
  notesCount: number
  bookmarksCount: number
  errorsCount: number
  activityDaysCount: number
  challengesCompleted: number
}

export type ImportResult =
  | { ok: true; state: CodeOrbitState; summary: ImportSummary; repaired: boolean }
  | { ok: false; error: string }

export function buildExport(
  state: CodeOrbitState,
  exportedAt = Date.now(),
  options?: { includeAnalysisHistory?: boolean }
): string {
  // Analysis history excluded from export unless the learner opts in (Stage 20 §11)
  const stateToExport: CodeOrbitState = options?.includeAnalysisHistory
    ? state
    : {
        ...state,
        analysis: state.analysis ? { ...state.analysis, history: [] } : { history: [] },
      }

  const exportPayload: ExportFile = {
    app: 'codeorbit',
    exportVersion: 1,
    schemaVersion: state.schemaVersion || SCHEMA_VERSION,
    exportedAt,
    state: stateToExport,
  }
  return JSON.stringify(exportPayload, null, 2)
}

export function parseImport(text: string): ImportResult {
  if (typeof text !== 'string' || text.trim() === '') {
    return { ok: false, error: 'Import file is empty' }
  }

  // Check size cap (≤ 4 MiB)
  const byteLength = typeof Blob !== 'undefined' ? new Blob([text]).size : text.length
  if (byteLength > SOFT_BUDGET_BYTES) {
    return { ok: false, error: 'Import file exceeds the 4 MB limit' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'File is not valid JSON' }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'Invalid backup structure' }
  }

  const record = parsed as Record<string, unknown>
  if (record.app !== 'codeorbit') {
    return { ok: false, error: 'File was not created by CodeOrbit' }
  }

  const rawState = record.state
  if (typeof rawState !== 'object' || rawState === null || Array.isArray(rawState)) {
    return { ok: false, error: 'Backup does not contain valid state data' }
  }

  const migrated = migrate(rawState as Record<string, unknown>)
  if (!migrated) {
    return { ok: false, error: 'Backup was created with a newer version of CodeOrbit and cannot be loaded' }
  }

  const { state, repaired } = sanitizeState(migrated)

  // Compute summary
  const topicsTouched = Object.values(state.topics).filter(
    (t) => t.lessonComplete || t.quizAttempts > 0
  ).length

  const challengesCompleted = Object.values(state.challenges).filter((c) => c.completed).length

  const summary: ImportSummary = {
    topicsTouched,
    notesCount: Object.keys(state.notes).length,
    bookmarksCount: state.bookmarks.length,
    errorsCount: state.errorNotebook.length,
    activityDaysCount: state.activityDays.length,
    challengesCompleted
  }

  return { ok: true, state, summary, repaired }
}
