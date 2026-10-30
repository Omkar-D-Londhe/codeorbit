/**
 * Language-neutral CodeRunner contract per 01_PRODUCT_AND_ARCHITECTURE.md §B4.
 */
import type { ChallengeFile } from '../content/types'

export type RunnerKind = 'iframe-preview' | 'script-preview' | 'worker-exec'

export const DEFAULT_TIMEOUT_MS = 3000
export const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024 // 64 KiB

export interface RunInput {
  files: ChallengeFile[]
  stdin?: string
  stylesheets?: string[]
  limits?: {
    timeoutMs?: number
    maxOutputBytes?: number
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
  readonly kind: RunnerKind
  run(input: RunInput, signal?: AbortSignal): Promise<RunResult>
}

/**
 * Message protocols for Worker-based runner communication.
 */
export interface HostRunMessage {
  type: 'run'
  files: ChallengeFile[]
  stdin?: string
  limits?: {
    timeoutMs?: number
    maxOutputBytes?: number
  }
}

export type HostMessage = HostRunMessage

export interface WorkerResultMessage {
  type: 'result'
  status: 'ok'
  stdout?: string
  stderr?: string
  durationMs: number
}

export interface WorkerLogMessage {
  type: 'log'
  stream: 'stdout' | 'stderr'
  data: string
}

export interface WorkerErrorMessage {
  type: 'error'
  message: string
  stderr?: string
  durationMs?: number
}

export type WorkerMessage =
  | WorkerResultMessage
  | WorkerLogMessage
  | WorkerErrorMessage

export function isHostRunMessage(data: unknown): data is HostRunMessage {
  if (typeof data !== 'object' || data === null) return false
  const candidate = data as Partial<HostRunMessage>
  if (candidate.type !== 'run') return false
  if (!Array.isArray(candidate.files)) return false
  for (const f of candidate.files) {
    if (typeof f !== 'object' || f === null) return false
    if (typeof f.name !== 'string' || typeof f.content !== 'string') return false
  }
  if (candidate.stdin !== undefined && typeof candidate.stdin !== 'string') return false
  if (candidate.limits !== undefined) {
    if (typeof candidate.limits !== 'object' || candidate.limits === null) return false
    if (candidate.limits.timeoutMs !== undefined && typeof candidate.limits.timeoutMs !== 'number') return false
    if (candidate.limits.maxOutputBytes !== undefined && typeof candidate.limits.maxOutputBytes !== 'number') return false
  }
  return true
}

export function isWorkerMessage(data: unknown): data is WorkerMessage {
  if (typeof data !== 'object' || data === null) return false
  const candidate = data as Record<string, unknown>
  if (candidate.type === 'result') {
    return (
      candidate.status === 'ok' &&
      typeof candidate.durationMs === 'number' &&
      (candidate.stdout === undefined || typeof candidate.stdout === 'string') &&
      (candidate.stderr === undefined || typeof candidate.stderr === 'string')
    )
  }
  if (candidate.type === 'log') {
    return (
      (candidate.stream === 'stdout' || candidate.stream === 'stderr') &&
      typeof candidate.data === 'string'
    )
  }
  if (candidate.type === 'error') {
    return (
      typeof candidate.message === 'string' &&
      (candidate.stderr === undefined || typeof candidate.stderr === 'string') &&
      (candidate.durationMs === undefined || typeof candidate.durationMs === 'number')
    )
  }
  return false
}
