import { describe, expect, it } from 'vitest'
import {
  stripCppComments,
  definesFunction,
  definesClass,
  containsLoop,
  usesPointerOrReference,
  usesRecursion,
  findCppRuleLocation,
} from '../tracks/cpp/validators'

describe('C++ Structural Validators Unit Tests (Stage 26)', () => {
  describe('stripCppComments', () => {
    it('removes single-line comments while preserving code', () => {
      const code = 'int a = 1; // comment here\nint b = 2;'
      const stripped = stripCppComments(code)
      expect(stripped).not.toContain('comment here')
      expect(stripped).toContain('int a = 1;')
      expect(stripped).toContain('int b = 2;')
    })

    it('removes multi-line comments', () => {
      const code = '/* multi\nline\ncomment */\nint main() {}'
      const stripped = stripCppComments(code)
      expect(stripped).not.toContain('multi')
      expect(stripped).toContain('int main() {}')
    })

    it('preserves comment markers inside strings', () => {
      const code = 'const char* s = "// not a comment";'
      const stripped = stripCppComments(code)
      expect(stripped).toContain('"// not a comment"')
    })
  })

  describe('definesFunction', () => {
    it('detects function declaration with return type and params', () => {
      const code = 'int multiply(int a, int b) { return a * b; }'
      expect(definesFunction(code, 'multiply', 'int', 2)).toBe(true)
      expect(definesFunction(code, 'multiply', 'void', 2)).toBe(false)
      expect(definesFunction(code, 'multiply', 'int', 1)).toBe(false)
    })
  })

  describe('definesClass', () => {
    it('detects class and struct definitions', () => {
      expect(definesClass('class BankAccount {};', 'BankAccount')).toBe(true)
      expect(definesClass('struct Point { int x; int y; };', 'Point')).toBe(true)
      expect(definesClass('class Other {};', 'BankAccount')).toBe(false)
    })
  })

  describe('containsLoop', () => {
    it('detects for, while, and do-while loops', () => {
      expect(containsLoop('for (int i = 0; i < 5; ++i) {}', 'for')).toBe(true)
      expect(containsLoop('while (true) {}', 'while')).toBe(true)
      expect(containsLoop('int x = 10;', 'any')).toBe(false)
    })
  })

  describe('usesPointerOrReference', () => {
    it('detects pointers and references in signatures', () => {
      expect(usesPointerOrReference('void swap(int* a, int* b)', 'pointer')).toBe(true)
      expect(usesPointerOrReference('void swap(int& a, int& b)', 'reference')).toBe(true)
      expect(usesPointerOrReference('int add(int a, int b)', 'any')).toBe(false)
    })
  })

  describe('usesRecursion', () => {
    it('detects recursive call', () => {
      const recursive = 'int fib(int n) { return fib(n - 1) + fib(n - 2); }'
      const iterative = 'int fib(int n) { return n; }'
      expect(usesRecursion(recursive, 'fib')).toBe(true)
      expect(usesRecursion(iterative, 'fib')).toBe(false)
    })
  })

  describe('findCppRuleLocation', () => {
    it('returns valid 1-indexed source location for matched construct', () => {
      const code = '#include <iostream>\nint sum(int n) {\n  return 0;\n}'
      const loc = findCppRuleLocation(code, {
        id: 'r1',
        description: 'function check',
        check: 'definesFunction',
        name: 'sum',
      })
      expect(loc).toBeDefined()
      expect(loc?.line).toBe(2)
      expect(loc?.column).toBeGreaterThan(0)
    })
  })
})
