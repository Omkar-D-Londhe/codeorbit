import { describe, it, expect } from 'vitest'
import { executeJavaScript } from '../tracks/javascript/runner'
import type { ChallengeTestCase } from '../core/content/types'

describe('Stage 23a: JavaScript Worker Runner Engine', () => {
  it('executes valid code and passes all visible unit test cases', async () => {
    const code = `
      function add(a, b) {
        return a + b;
      }
    `
    const tests: ChallengeTestCase[] = [
      { id: 't1', name: 'adds positives', call: 'add(2, 3)', expect: 5 },
      { id: 't2', name: 'adds negatives', call: 'add(-1, -4)', expect: -5 },
      { id: 't3', name: 'adds zero', call: 'add(10, 0)', expect: 10 },
      { id: 't4', name: 'adds floats', call: 'add(0.5, 0.5)', expect: 1, hidden: true },
    ]

    const result = await executeJavaScript(code, tests)
    expect(result.status).toBe('ok')
    expect(result.allPassed).toBe(true)
    expect(result.testResults).toHaveLength(4)
    expect(result.testResults.every((t) => t.passed)).toBe(true)
  })

  it('correctly reports failing unit tests with expected vs actual values', async () => {
    const code = `
      function multiply(a, b) {
        return a + b; // Buggy implementation
      }
    `
    const tests: ChallengeTestCase[] = [
      { id: 't1', name: 'multiplies 2 and 3', call: 'multiply(2, 3)', expect: 6 },
    ]

    const result = await executeJavaScript(code, tests)
    expect(result.status).toBe('ok')
    expect(result.allPassed).toBe(false)
    expect(result.testResults[0].passed).toBe(false)
    expect(result.testResults[0].actual).toBe(5)
    expect(result.testResults[0].expected).toBe(6)
  })

  it('stops execution on infinite loop and returns timeout status within limit', async () => {
    const infiniteLoopCode = `
      function infinite() {
        while (true) {}
      }
    `
    const tests: ChallengeTestCase[] = [
      { id: 't-inf', name: 'runs loop', call: 'infinite()', expect: true },
    ]

    const start = Date.now()
    const result = await executeJavaScript(infiniteLoopCode, tests, { timeoutMs: 300 })
    const elapsed = Date.now() - start

    expect(result.status).toBe('timeout')
    expect(result.allPassed).toBe(false)
    expect(result.message).toContain('ran longer than')
    expect(elapsed).toBeLessThan(1500)
  })

  it('catches and reports runtime errors gracefully', async () => {
    const throwingCode = `
      function explode() {
        throw new Error('Boom in learner code');
      }
    `
    const tests: ChallengeTestCase[] = [
      { id: 't-err', name: 'calls boom', call: 'explode()', expect: 'ok' },
    ]

    const result = await executeJavaScript(throwingCode, tests)
    expect(result.status).toBe('ok')
    expect(result.allPassed).toBe(false)
    expect(result.testResults[0].passed).toBe(false)
    expect(result.testResults[0].error).toContain('Boom in learner code')
  })

  it('captures console.log output without leaking to host console', async () => {
    const loggingCode = `
      console.log('Step 1 complete');
      console.log('Value is:', 42);
      function dummy() { return true; }
    `
    const tests: ChallengeTestCase[] = [
      { id: 't-log', name: 'dummy check', call: 'dummy()', expect: true },
    ]

    const result = await executeJavaScript(loggingCode, tests)
    expect(result.status).toBe('ok')
    expect(result.logs.some((l) => l.text.includes('Step 1 complete'))).toBe(true)
    expect(result.logs.some((l) => l.text.includes('Value is: 42'))).toBe(true)
  })

  it('rejects access to parent window and document through sandbox guard', async () => {
    const escapeCode = `
      const win = window;
      function test() { return win; }
    `
    const tests: ChallengeTestCase[] = [
      { id: 't-esc', name: 'leak window', call: 'test()', expect: null },
    ]

    const result = await executeJavaScript(escapeCode, tests)
    expect(result.status).toBe('error')
    expect(result.message).toContain('Forbidden worker API reference')
  })

  it('provides deterministic Math.random output when seed is provided', async () => {
    const code = `
      function roll() {
        return Math.floor(Math.random() * 100);
      }
    `
    const tests: ChallengeTestCase[] = [
      { id: 't-rnd-1', name: 'first roll', call: 'roll()', expect: null },
      { id: 't-rnd-2', name: 'second roll', call: 'roll()', expect: null },
    ]

    const run1 = await executeJavaScript(code, tests, { seed: 12345 })
    const run2 = await executeJavaScript(code, tests, { seed: 12345 })

    expect(run1.testResults[0].actual).toBe(run2.testResults[0].actual)
    expect(run1.testResults[1].actual).toBe(run2.testResults[1].actual)
  })
})
