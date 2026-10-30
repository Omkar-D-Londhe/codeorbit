import { describe, expect, it } from 'vitest'
import {
  checkDefinesFunction,
  checkContainsLoop,
  checkUsesComprehension,
  checkUsesRecursion,
  checkUsesConstruct,
  checkSourceMatches,
  stripComments,
  evaluatePythonRule,
  createPythonValidator,
} from '../tracks/python/validators'

describe('Python Structural Validators Unit Tests (Stage 25a)', () => {
  describe('stripComments', () => {
    it('removes line comments while preserving indentation', () => {
      const code = 'def hello():\n    # this is a comment\n    return "hi"'
      const stripped = stripComments(code)
      expect(stripped).not.toContain('this is a comment')
      expect(stripped).toContain('def hello():')
      expect(stripped).toContain('return "hi"')
    })

    it('does not strip # inside strings', () => {
      const code = 'color = "#ffffff"\n# actual comment'
      const stripped = stripComments(code)
      expect(stripped).toContain('"#ffffff"')
      expect(stripped).not.toContain('actual comment')
    })
  })

  describe('checkDefinesFunction', () => {
    it('detects simple function definition', () => {
      expect(checkDefinesFunction('def calculate():\n    pass', 'calculate')).toBe(true)
      expect(checkDefinesFunction('def calculate():\n    pass', 'other')).toBe(false)
    })

    it('validates parameter count', () => {
      const code = 'def add(a, b):\n    return a + b'
      expect(checkDefinesFunction(code, 'add', 2)).toBe(true)
      expect(checkDefinesFunction(code, 'add', 1)).toBe(false)
      expect(checkDefinesFunction(code, 'add', 3)).toBe(false)
    })

    it('validates parameter names and handles type annotations and defaults', () => {
      const code = 'def greet(name: str, count: int = 1):\n    return name * count'
      expect(checkDefinesFunction(code, 'greet', 2, ['name', 'count'])).toBe(true)
      expect(checkDefinesFunction(code, 'greet', 2, ['user', 'count'])).toBe(false)
    })

    it('verifies presence of return statement when requested', () => {
      const withReturn = 'def compute(x):\n    result = x * 2\n    return result'
      const withoutReturn = 'def compute(x):\n    result = x * 2\n    print(result)'

      expect(checkDefinesFunction(withReturn, 'compute', 1, undefined, true)).toBe(true)
      expect(checkDefinesFunction(withoutReturn, 'compute', 1, undefined, true)).toBe(false)
    })

    it('ignores commented-out functions', () => {
      const code = '# def old_func():\n#     pass\ndef new_func():\n    pass'
      expect(checkDefinesFunction(code, 'old_func')).toBe(false)
      expect(checkDefinesFunction(code, 'new_func')).toBe(true)
    })
  })

  describe('checkContainsLoop', () => {
    it('detects for and while loops', () => {
      expect(checkContainsLoop('for x in range(10):\n    pass', 'for')).toBe(true)
      expect(checkContainsLoop('for x in range(10):\n    pass', 'while')).toBe(false)
      expect(checkContainsLoop('while x > 0:\n    x -= 1', 'while')).toBe(true)
      expect(checkContainsLoop('while x > 0:\n    x -= 1', 'any')).toBe(true)
    })

    it('detects nested loops when minNesting is 2', () => {
      const flat = 'for x in xs:\n    pass\nfor y in ys:\n    pass'
      const nested = 'for x in xs:\n    for y in ys:\n        pass'

      expect(checkContainsLoop(flat, 'for', 2)).toBe(false)
      expect(checkContainsLoop(nested, 'for', 2)).toBe(true)
    })
  })

  describe('checkUsesComprehension', () => {
    it('identifies list comprehensions', () => {
      expect(checkUsesComprehension('[x * 2 for x in nums]', 'list')).toBe(true)
      expect(checkUsesComprehension('[x for x in nums if x > 0]', 'list')).toBe(true)
      expect(checkUsesComprehension('{x: x * 2 for x in nums}', 'list')).toBe(false)
    })

    it('identifies dictionary and set comprehensions', () => {
      expect(checkUsesComprehension('{k: v for k, v in pairs}', 'dict')).toBe(true)
      expect(checkUsesComprehension('{x * x for x in items}', 'set')).toBe(true)
    })
  })

  describe('checkUsesRecursion', () => {
    it('verifies that a function calls itself in its body', () => {
      const recursive = `def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)
`
      const iterative = `def fact(n):
    res = 1
    for i in range(1, n + 1):
        res *= i
    return res
`
      expect(checkUsesRecursion(recursive, 'fact')).toBe(true)
      expect(checkUsesRecursion(iterative, 'fact')).toBe(false)
    })
  })

  describe('checkUsesConstruct', () => {
    it('verifies if-elif-else constructs', () => {
      const code = 'if a:\n    pass\nelif b:\n    pass\nelse:\n    pass'
      expect(checkUsesConstruct(code, 'if-elif-else')).toBe(true)
      expect(checkUsesConstruct('if a:\n    pass\nelse:\n    pass', 'if-elif-else')).toBe(false)
    })

    it('verifies assert statements', () => {
      expect(checkUsesConstruct('assert x == 5', 'assert')).toBe(true)
      expect(checkUsesConstruct('# assert x == 5', 'assert')).toBe(false)
      expect(checkUsesConstruct('x = 5', 'assert')).toBe(false)
    })

    it('verifies try-except blocks', () => {
      const code = 'try:\n    x = 1 / 0\nexcept ZeroDivisionError:\n    pass'
      expect(checkUsesConstruct(code, 'try-except')).toBe(true)
    })

    it('verifies docstrings', () => {
      const code = 'def fn():\n    """Docstring explanation."""\n    pass'
      expect(checkUsesConstruct(code, 'docstring')).toBe(true)
    })

    it('verifies source pattern matching', () => {
      expect(checkSourceMatches('price * 1.05', '1.05')).toBe(true)
      expect(checkSourceMatches('price * 1.05', /1\.05/)).toBe(true)
      expect(checkSourceMatches('price * 1.05', '2.50')).toBe(false)
    })
  })

  describe('Security and Bounded Limits', () => {
    it('detects blocked dangerous modules', () => {
      expect(evaluatePythonRule({ kind: 'blocksImport' }, 'import math\nimport json')).toBe(true)
      expect(evaluatePythonRule({ kind: 'blocksImport' }, 'import os')).toBe(false)
      expect(evaluatePythonRule({ kind: 'blocksImport' }, 'from subprocess import Popen')).toBe(false)
      expect(evaluatePythonRule({ kind: 'blocksImport' }, 'import socket')).toBe(false)
    })

    it('handles malformed syntax gracefully without throwing', () => {
      const malformed = 'def (((( unterminated \n  """ unclosed quote \n  for for for'
      expect(() => checkDefinesFunction(malformed, 'test')).not.toThrow()
      expect(() => checkContainsLoop(malformed)).not.toThrow()
      expect(() => checkUsesComprehension(malformed)).not.toThrow()
      expect(() => checkUsesConstruct(malformed, 'if-elif-else')).not.toThrow()
    })

    it('handles oversized files (>10,000 lines) safely in bounded time', () => {
      const bigCode = 'x = 1\n'.repeat(10000) + 'def target_fn():\n    return 42\n'
      const start = performance.now()
      const result = checkDefinesFunction(bigCode, 'target_fn')
      const duration = performance.now() - start

      // Max lines limit clamps parsing safely
      expect(duration).toBeLessThan(150) // completed in < 150ms
      expect(typeof result).toBe('boolean')
    })
  })

  describe('createPythonValidator', () => {
    it('evaluates challenge requirements deterministically', async () => {
      const validator = createPythonValidator([
        {
          id: 'r1',
          description: 'Defines greet',
          explanation: 'Function needed',
          rule: { kind: 'definesFunction', name: 'greet', paramsCount: 1 },
        },
        {
          id: 'r2',
          description: 'Uses loop',
          explanation: 'Loop needed',
          rule: { kind: 'containsLoop', loopType: 'for' },
        },
      ])

      const passingFiles = [
        {
          name: 'solution.py',
          language: 'python',
          content: 'def greet(name):\n    for ch in name:\n        pass',
        },
      ]

      const results = (await validator.validate(passingFiles)) as Array<{ id: string; met: boolean }>
      expect(results[0].met).toBe(true)
      expect(results[1].met).toBe(true)
    })
  })
})
