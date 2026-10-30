import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

describe('Stage 25b: Pyodide Vendored Assets & Integrity (O-03, L-14)', () => {
  const pyodideDir = path.resolve(__dirname, '../../public/pyodide')
  const dependencyDocPath = path.resolve(__dirname, '../tracks/python/vendor/DEPENDENCY.md')
  const licensePath = path.resolve(__dirname, '../tracks/python/vendor/LICENSE-pyodide')

  const EXPECTED_HASHES: Record<string, string> = {
    'pyodide.js': 'C0069107621D5B942A659E737A12E774CC0451FEAA2256F475D72E071D844EC7',
    'pyodide.mjs': '7F24C6655A79EACF0061D3D4E6A60DC0B1938812D15C52D7FF8B37D9E0689E51',
    'pyodide.asm.js': '919560652ED3DAD3707CB3A394785DA1E046FB13DC0DEFA162058FF230CB7EED',
    'pyodide.asm.wasm': 'B7E66A19427A55010AC3367C1B6C64B893F9826F783412945FDF0C3337F3BC94',
    'python_stdlib.zip': '72894522B791858B9D613AC786B951D8B5094035DCF376313EA24A466810F336',
    'pyodide-lock.json': 'CD50B49DE944C579045E122FE8628B31F9CE446379F032F36C05E273D38766E0',
    'package.json': 'F7BEAFE72F10B3702D177F6B72BF3C113036C35D982C382FAEF15564740D1250',
  }

  it('verifies that public/pyodide contains all required runtime assets', () => {
    expect(fs.existsSync(pyodideDir)).toBe(true)
    for (const file of Object.keys(EXPECTED_HASHES)) {
      const fullPath = path.join(pyodideDir, file)
      expect(fs.existsSync(fullPath), `Missing expected file: ${file}`).toBe(true)
    }
  })

  it('verifies exact SHA-256 integrity checksums for all vendored Pyodide v0.26.4 assets', () => {
    for (const [file, expectedHash] of Object.entries(EXPECTED_HASHES)) {
      const fullPath = path.join(pyodideDir, file)
      const buffer = fs.readFileSync(fullPath)
      const calculatedHash = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase()
      expect(calculatedHash).toBe(expectedHash)
    }
  })

  it('verifies that DEPENDENCY.md records version, upstream URL, and checksums', () => {
    expect(fs.existsSync(dependencyDocPath)).toBe(true)
    const content = fs.readFileSync(dependencyDocPath, 'utf8')
    expect(content).toContain('0.26.4')
    expect(content).toContain('Apache-2.0')
    expect(content).toContain('pyodide.asm.wasm')
    for (const expectedHash of Object.values(EXPECTED_HASHES)) {
      expect(content).toContain(expectedHash)
    }
  })

  it('verifies that license file LICENSE-pyodide is present and valid', () => {
    expect(fs.existsSync(licensePath)).toBe(true)
    const content = fs.readFileSync(licensePath, 'utf8')
    expect(content).toContain('Apache License')
    expect(content).toContain('Version 2.0')
  })
})
