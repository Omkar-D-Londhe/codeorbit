/**
 * Iframe Preview Runner (Stage 06, Stage 23a, PLT-11, C-05).
 * Executes HTML/CSS/JS preview generation for SandboxedPreview.
 * - 'static': sandbox="" and CSP forbidding scripts (HTML/CSS tracks).
 * - 'script': sandbox="allow-scripts" only (never allow-same-origin), injecting the preview harness (JS track).
 */
import type { CodeRunner, RunInput, RunResult, RunnerKind } from './types'
import {
  buildPreviewDocument,
  buildScriptPreviewDocument,
  PREVIEW_SANDBOX,
} from '../../lib/preview'

export const SCRIPT_PREVIEW_SANDBOX = 'allow-scripts'

export type PreviewMode = 'static' | 'script'

export function generatePreviewNonce(): string {
  return `preview-nonce-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export class IframePreviewRunner implements CodeRunner {
  readonly kind: RunnerKind
  readonly mode: PreviewMode

  constructor(mode: PreviewMode = 'static') {
    this.mode = mode
    this.kind = mode === 'script' ? 'script-preview' : 'iframe-preview'
  }

  get sandbox(): string {
    return this.mode === 'script' ? SCRIPT_PREVIEW_SANDBOX : PREVIEW_SANDBOX
  }

  async run(input: RunInput, signal?: AbortSignal, customNonce?: string): Promise<RunResult & { nonce?: string; sandbox: string }> {
    const start = performance.now()

    if (signal?.aborted) {
      return {
        status: 'error',
        message: 'Execution aborted',
        durationMs: 0,
        sandbox: this.sandbox,
      }
    }

    try {
      let previewDoc: string
      let nonce: string | undefined

      if (this.mode === 'script') {
        nonce = customNonce || generatePreviewNonce()
        previewDoc = buildScriptPreviewDocument(input.files, nonce, { stylesheets: input.stylesheets })
      } else {
        previewDoc = buildPreviewDocument(input.files, { stylesheets: input.stylesheets })
      }

      const durationMs = Math.round(performance.now() - start)
      return {
        status: 'ok',
        durationMs,
        previewDoc,
        nonce,
        sandbox: this.sandbox,
      }
    } catch (err) {
      return {
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to build preview document',
        durationMs: Math.round(performance.now() - start),
        sandbox: this.sandbox,
      }
    }
  }
}
