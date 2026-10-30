import { describe, it, expect } from 'vitest'
import { javaRunner, executeJava } from '../tracks/java/runner'
import { executeJavaSource } from '../tracks/java/runnerWorker'

describe('Java In-Browser Execution Toolchain (O-04)', () => {
  it('exposes javaRunner instance with worker-exec kind', () => {
    expect(javaRunner.kind).toBe('worker-exec')
  })

  it('compiles and outputs greeting using System.out.println', async () => {
    const code = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java on CodeOrbit!");
    }
}`
    const res = await executeJava(code)
    expect(res.status).toBe('ok')
    if (res.status === 'ok') {
      expect(res.stdout).toContain('Hello from Java on CodeOrbit!')
      expect(res.durationMs).toBeGreaterThanOrEqual(0)
    }
  })

  it('handles primitive variables, string concatenation, and expressions', async () => {
    const code = `public class Main {
    public static void main(String[] args) {
        int x = 20;
        int y = 22;
        String label = "Result: ";
        System.out.println(label + (x + y));
    }
}`
    const res = await executeJava(code)
    expect(res.status).toBe('ok')
    if (res.status === 'ok') {
      expect(res.stdout).toContain('Result: 42')
    }
  })

  it('rejects code missing main method with error', async () => {
    const code = `public class Main {
    public void helper() {}
}`
    const res = await executeJava(code)
    expect(res.status).toBe('error')
    if (res.status === 'error') {
      expect(res.stderr).toContain('Main method not found')
    }
  })

  it('enforces 3,000ms watchdog termination on infinite loops', async () => {
    const code = `public class Main {
    public static void main(String[] args) {
        while (true) {
            // infinite loop
        }
    }
}`
    const res = await executeJava(code, '', { timeoutMs: 100 })
    expect(res.status).toBe('timeout')
    if (res.status === 'timeout') {
      expect(res.message).toContain('watchdog kill')
    }
  })

  it('blocks dangerous system calls in the sandbox', () => {
    const malicious = `public class Main {
    public static void main(String[] args) {
        Runtime.getRuntime().exec("rm -rf /");
    }
}`
    const res = executeJavaSource(malicious)
    expect(res.error).toBe('Security violation')
    expect(res.stderr).toContain('Process invocation and System.exit are prohibited')
  })

  it('enforces 64KB output buffer limit', () => {
    const verbose = `public class Main {
    public static void main(String[] args) {
        System.out.println("${'A'.repeat(70000)}");
    }
}`
    const res = executeJavaSource(verbose, '', 1000)
    expect(res.stdout).toContain('[Output truncated at 64KB]')
    expect(res.stdout.length).toBeLessThan(1100)
  })
})
