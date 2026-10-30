import { describe, expect, it } from 'vitest'
import {
  stripJavaComments,
  definesClass,
  definesMethod,
  containsLoop,
  usesRecursion,
  findJavaRuleLocation,
} from '../tracks/java/validators'

describe('Java Structural Validators Unit Tests (Stage 26)', () => {
  describe('stripJavaComments', () => {
    it('removes single-line comments while preserving syntax', () => {
      const code = 'int a = 1; // comment here\nint b = 2;'
      const stripped = stripJavaComments(code)
      expect(stripped).not.toContain('comment here')
      expect(stripped).toContain('int a = 1;')
      expect(stripped).toContain('int b = 2;')
    })

    it('removes multi-line comments', () => {
      const code = '/* multi\nline\ncomment */\nclass Test {}'
      const stripped = stripJavaComments(code)
      expect(stripped).not.toContain('multi')
      expect(stripped).toContain('class Test {}')
    })

    it('preserves comment markers inside strings', () => {
      const code = 'String s = "// not a comment";'
      const stripped = stripJavaComments(code)
      expect(stripped).toContain('"// not a comment"')
    })
  })

  describe('definesClass', () => {
    it('detects class definitions', () => {
      expect(definesClass('public class Greeter {}', 'Greeter')).toBe(true)
      expect(definesClass('class User {}', 'User')).toBe(true)
      expect(definesClass('class User {}', 'Other')).toBe(false)
    })

    it('detects extends clause', () => {
      expect(definesClass('class Dog extends Animal {}', 'Dog', 'Animal')).toBe(true)
      expect(definesClass('class Dog extends Animal {}', 'Dog', 'Pet')).toBe(false)
    })
  })

  describe('definesMethod', () => {
    it('detects method declaration with return type and params', () => {
      const code = 'public static int add(int a, int b) { return a + b; }'
      expect(definesMethod(code, 'add', 'int', 2)).toBe(true)
      expect(definesMethod(code, 'add', 'void', 2)).toBe(false)
      expect(definesMethod(code, 'add', 'int', 1)).toBe(false)
    })
  })

  describe('containsLoop', () => {
    it('detects for and while loops', () => {
      expect(containsLoop('for (int i = 0; i < 10; i++) {}', 'for')).toBe(true)
      expect(containsLoop('while (true) {}', 'while')).toBe(true)
      expect(containsLoop('int a = 1;', 'any')).toBe(false)
    })
  })

  describe('usesRecursion', () => {
    it('detects recursive call', () => {
      const recursive = 'int f(int n) { return f(n - 1); }'
      const iterative = 'int f(int n) { return n; }'
      expect(usesRecursion(recursive, 'f')).toBe(true)
      expect(usesRecursion(iterative, 'f')).toBe(false)
    })
  })

  describe('findJavaRuleLocation', () => {
    it('returns valid 1-indexed source location for matched construct', () => {
      const code = 'public class Test {\n  public static int count() {\n    return 0;\n  }\n}'
      const loc = findJavaRuleLocation(code, {
        id: 'r1',
        description: 'method check',
        check: 'definesMethod',
        name: 'count',
      })
      expect(loc).toBeDefined()
      expect(loc?.line).toBe(2)
      expect(loc?.column).toBeGreaterThan(0)
    })
  })
})
