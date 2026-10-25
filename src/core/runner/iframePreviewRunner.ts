/**
 * Iframe Preview Runner (Stage 06, B4)
 * Executes HTML/CSS preview generation for SandboxedPreview.
 * Never executes scripts; returns rendered document with sandbox="" and CSP.
 */
import type { CodeRunner, RunInput, RunResult } from './types'
import { buildPreviewDocument } from '../../lib/preview'

export class IframePreviewRunner implements CodeRunner {
  readonly kind = 'iframe-preview'

  async run(input: RunInput, signal?: AbortSignal): Promise<RunResult> {
    const start = performance.now()

    if (signal?.aborted) {
      return {
        status: 'error',
        message: 'Execution aborted',
        durationMs: 0,
      }
    }

    try {
      const previewDoc = buildPreviewDocument(input.files)
      const durationMs = Math.round(performance.now() - start)
      return {
        status: 'ok',
        durationMs,
        previewDoc,
      }
    } catch (err) {
      return {
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to build preview document',
        durationMs: Math.round(performance.now() - start),
      }
    }
  }
}
