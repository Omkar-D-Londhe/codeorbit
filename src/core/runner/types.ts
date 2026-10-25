/**
 * Language-neutral CodeRunner contract per 01_PRODUCT_AND_ARCHITECTURE.md §B4.
 */
import type { ChallengeFile } from '../content/types'

export type RunnerKind = 'iframe-preview' | 'script-preview' | 'worker-exec'

export interface RunInput {
  files: ChallengeFile[]
  stdin?: string
  limits?: {
    timeoutMs: number
    maxOutputBytes: number
  }
}

export type RunResult =
  | {
      status: 'ok'
      stdout?: string
      stderr?: string
      durationMs: number
      previewDoc?: string
    }
  | {
      status: 'timeout' | 'memory' | 'error'
      message: string
      stderr?: string
      durationMs: number
    }

export interface CodeRunner {
  kind: RunnerKind
  run(input: RunInput, signal?: AbortSignal): Promise<RunResult>
}
