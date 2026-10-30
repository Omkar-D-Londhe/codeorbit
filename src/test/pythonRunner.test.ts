import { describe, it, expect } from 'vitest'
import { executePython, PythonRunnerHost } from '../tracks/python/runner'
import { checkBlocksImport } from '../tracks/python/validators'

describe('Stage 25b: Python Web Worker Engine & Sandbox Security (SEC-01..06, L-07)', () => {
  describe('1. Static and Runtime Prohibited Import Rejection (SEC-01)', () => {
    const dangerousModules = [
      'os',
      'subprocess',
      'socket',
      'urllib',
      'http',
      'shutil',
      'ctypes',
      'multiprocessing',
      'requests',
    ]

    for (const mod of dangerousModules) {
      it(`statically rejects import of "${mod}"`, () => {
        const code1 = `import ${mod}`
        const code2 = `from ${mod} import something`
        expect(checkBlocksImport(code1)).toBe(false)
        expect(checkBlocksImport(code2)).toBe(false)
      })

      it(`executePython returns security restriction error for "${mod}"`, async () => {
        const result = await executePython(`import ${mod}`, [], { timeoutMs: 1000 })
        expect(result.status).toBe('error')
        expect(result.message).toContain('Security restriction')
        expect(result.stderr).toContain('Security restriction')
      })
    }

    it('runtime sys.meta_path hook catches dynamic import attempts', async () => {
      // Trying to bypass simple regex with __import__
      const result = await executePython(`m = __import__("os")`, [], { timeoutMs: 1000 })
      expect(result.status).toBe('error')
      expect(result.stderr).toMatch(/Security restriction|ImportError/i)
    })
  })

  describe('2. Infinite Loop and Timeout Enforcement (SEC-02)', () => {
    it('stops infinite loops at approximately the specified timeout without freezing', async () => {
      const start = performance.now()
      const result = await executePython('while True: pass', [], { timeoutMs: 200 })
      const duration = performance.now() - start

      expect(result.status).toBe('timeout')
      expect(result.message).toContain('Execution timed out')
      expect(duration).toBeGreaterThanOrEqual(40)
      expect(duration).toBeLessThan(1500)
    })
  })

  describe('3. Output Buffer Cap and Truncation (SEC-04)', () => {
    it('caps output at 50 KB ceiling with explicit truncation notice', async () => {
      const code = `
for _ in range(1000):
    print("A" * 100)
`
      const result = await executePython(code, [], { timeoutMs: 2000 })
      expect(result.status).toBe('ok')
      expect(result.stdout.length).toBeLessThanOrEqual(52 * 1024)
      expect(result.stdout).toContain('[Output truncated: exceeded 50 KB limit]')
    })
  })

  describe('4. Recursion Limit and Resource Defense (SEC-05)', () => {
    it('fails safely on infinite recursion without crashing', async () => {
      const code = `
def recurse(n):
    return recurse(n + 1)

recurse(1)
`
      const result = await executePython(code, [], { timeoutMs: 2000 })
      expect(result.status).toBe('error')
      expect(result.stderr).toMatch(/RecursionError|maximum recursion depth exceeded/i)
    })
  })

  describe('5. Namespace Cleanliness and State Isolation (SEC-06)', () => {
    it('ensures variables and definitions do not leak between consecutive runs', async () => {
      // First run defines a global secret
      const run1 = await executePython('secret_var = "sensitive_data_123"\nprint(secret_var)', [], { timeoutMs: 1000 })
      expect(run1.status).toBe('ok')
      expect(run1.stdout).toContain('sensitive_data_123')

      // Second run attempts to read secret_var
      const run2 = await executePython('print(secret_var)', [], { timeoutMs: 1000 })
      expect(run2.status).toBe('error')
      expect(run2.stderr).toContain("name 'secret_var' is not defined")
    })

    it('ensures built-in monkey patching does not contaminate subsequent runs', async () => {
      // First run modifies print
      const run1 = await executePython(`
original_len = len
def custom_len(x):
    return 999
len = custom_len
print(len([1, 2]))
`, [], { timeoutMs: 1000 })
      expect(run1.status).toBe('ok')
      expect(run1.stdout).toContain('999')

      // Second run verifies len behavior is pristine
      const run2 = await executePython('print(len([1, 2, 3]))', [], { timeoutMs: 1000 })
      expect(run2.status).toBe('ok')
      expect(run2.stdout).toContain('3')
    })
  })

  describe('6. Test Case Grading in WebAssembly Sandbox', () => {
    it('executes challenge tests and grades passing and failing cases', async () => {
      const code = `
def add(a, b):
    return a + b
`
      const tests = [
        { id: 't1', name: 'add(2, 3)', call: 'add(2, 3)', expect: 5 },
        { id: 't2', name: 'add(-1, 1)', call: 'add(-1, 1)', expect: 0 },
        { id: 't3', name: 'add(10, 20)', call: 'add(10, 20)', expect: 35 }, // will fail
      ]

      const result = await executePython(code, tests, { timeoutMs: 2000 })
      expect(result.status).toBe('ok')
      expect(result.testResults.length).toBe(3)
      expect(result.testResults[0].passed).toBe(true)
      expect(result.testResults[1].passed).toBe(true)
      expect(result.testResults[2].passed).toBe(false)
      expect(result.allPassed).toBe(false)
    })
  })

  describe('7. Language-neutral PythonRunnerHost Contract', () => {
    it('implements CodeRunner with kind worker-exec', async () => {
      const runner = new PythonRunnerHost()
      expect(runner.kind).toBe('worker-exec')

      const runInput = {
        files: [{ name: 'solution.py', language: 'python', content: 'print("Host runner test")' }],
      }
      const res = await runner.run(runInput)
      expect(res.status).toBe('ok')
      if (res.status === 'ok') {
        expect(res.stdout).toContain('Host runner test')
      }
    })
  })
})
