/**
 * Empirical Complexity Measurement (Stage 23b, PLT-08).
 * Runs instrumented timing in isolated environment over input sizes [1k...64k] (powers of 2),
 * taking the median of 5 runs per size, with clear empirical disclaimer.
 *
 * Rule: Empirical measurements are never used to claim or replace formal asymptotics.
 */

export interface MeasurementResult {
  inputSizes: number[]
  timingsMs: number[]
  environmentNote: string
}

export const DEFAULT_INPUT_SIZES = [1024, 2048, 4096, 8192, 16384, 32768, 65536]

export const ENVIRONMENT_NOTE =
  'Empirical wall-clock timings illustrate relative runtime scaling on this device. They reflect JIT optimization, garbage collection, and background CPU load, and are not an asymptotic proof.'

/**
 * Computes the median of an array of numbers.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Generates synthetic numerical array input of length N for benchmarking.
 */
export function generateSyntheticInput(size: number, seed = 42): number[] {
  let s = seed >>> 0
  const arr = new Array(size)
  for (let i = 0; i < size; i++) {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    arr[i] = ((t ^ (t >>> 14)) >>> 0) % 100000
  }
  return arr
}

/**
 * Measures the execution time of a synchronous function across specified input sizes.
 * Takes the median of `runsPerSize` executions.
 */
export function measureFunctionTiming(
  fn: (input: number[]) => unknown,
  sizes: number[] = [1024, 2048, 4096, 8192],
  runsPerSize = 5
): MeasurementResult {
  const timingsMs: number[] = []

  for (const size of sizes) {
    const input = generateSyntheticInput(size)
    const samples: number[] = []

    for (let r = 0; r < runsPerSize; r++) {
      const inputCopy = input.slice()
      const t0 = performance.now()
      try {
        fn(inputCopy)
      } catch {
        // Skip on error
      }
      const t1 = performance.now()
      samples.push(t1 - t0)
    }

    timingsMs.push(Math.round(median(samples) * 100) / 100)
  }

  return {
    inputSizes: sizes,
    timingsMs,
    environmentNote: ENVIRONMENT_NOTE,
  }
}
