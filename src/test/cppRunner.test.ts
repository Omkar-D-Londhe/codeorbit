import { describe, it, expect } from 'vitest'
import { cppRunner, executeCpp } from '../tracks/cpp/runner'
import { executeCppSource } from '../tracks/cpp/runnerWorker'

describe('C++ In-Browser Execution Toolchain (O-04)', () => {
  it('exposes cppRunner instance with worker-exec kind', () => {
    expect(cppRunner.kind).toBe('worker-exec')
  })

  it('compiles and outputs greeting using std::cout', async () => {
    const code = `#include <iostream>

int main() {
    std::cout << "Hello from C++ on CodeOrbit!" << std::endl;
    return 0;
}
`
    const res = await executeCpp(code)
    expect(res.status).toBe('ok')
    if (res.status === 'ok') {
      expect(res.stdout).toContain('Hello from C++ on CodeOrbit!')
      expect(res.durationMs).toBeGreaterThanOrEqual(0)
    }
  })

  it('handles multiple streaming operators and numbers', async () => {
    const code = `#include <iostream>

int main() {
    std::cout << "Answer: " << 42 << std::endl;
    return 0;
}
`
    const res = await executeCpp(code)
    expect(res.status).toBe('ok')
    if (res.status === 'ok') {
      expect(res.stdout).toContain('Answer: 42')
    }
  })

  it('rejects code missing main function with linker error', async () => {
    const code = `#include <iostream>
void helper() {}
`
    const res = await executeCpp(code)
    expect(res.status).toBe('error')
    if (res.status === 'error') {
      expect(res.stderr).toContain('undefined reference to `main`')
    }
  })

  it('enforces 3,000ms watchdog termination on infinite loops', async () => {
    const code = `#include <iostream>

int main() {
    while (true) {
        // infinite loop
    }
    return 0;
}
`
    const res = await executeCpp(code, '', { timeoutMs: 100 })
    expect(res.status).toBe('timeout')
    if (res.status === 'timeout') {
      expect(res.message).toContain('watchdog kill')
    }
  })

  it('blocks dangerous system calls in the sandbox', () => {
    const malicious = `#include <cstdlib>

int main() {
    system("rm -rf /");
    return 0;
}
`
    const res = executeCppSource(malicious)
    expect(res.error).toBe('Security violation')
    expect(res.stderr).toContain('Process spawning and system() are prohibited')
  })

  it('enforces 64KB output buffer limit', () => {
    const verbose = `#include <iostream>

int main() {
    std::cout << "${'A'.repeat(70000)}" << std::endl;
    return 0;
}
`
    const res = executeCppSource(verbose, '', 1000)
    expect(res.stdout).toContain('[Output truncated at 64KB]')
    expect(res.stdout.length).toBeLessThan(1100)
  })
})
