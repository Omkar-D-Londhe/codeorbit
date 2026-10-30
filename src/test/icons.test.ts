import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Icon Registry Coverage (UI-13)', () => {
  it('every referenced icon name in source code exists in Icon.tsx PATHS', () => {
    const iconFile = fs.readFileSync(path.resolve(__dirname, '../components/Icon.tsx'), 'utf8')
    const matches = [...iconFile.matchAll(/^\s+([a-zA-Z0-9_-]+|'[a-zA-Z0-9_-]+'):/gm)]
    const definedNames = new Set(matches.map((m) => m[1].replace(/'/g, '')))

    // Search for <Icon name="..." in all src files
    const srcDir = path.resolve(__dirname, '../')
    const walk = (d: string, out: string[] = []): string[] => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name === 'test' || e.name === 'vendor') continue
        const p = path.join(d, e.name)
        if (e.isDirectory()) walk(p, out)
        else if (/\.(tsx|ts)$/.test(e.name)) out.push(p)
      }
      return out
    }

    const files = walk(srcDir)
    const referenced = new Set<string>()
    for (const f of files) {
      const code = fs.readFileSync(f, 'utf8')
      for (const m of code.matchAll(/<Icon\s+[^>]*name=["']([a-zA-Z0-9_-]+)["']/g)) {
        referenced.add(m[1])
      }
    }

    const missing: string[] = []
    for (const name of referenced) {
      if (!definedNames.has(name)) {
        missing.push(name)
      }
    }

    expect(missing).toEqual([])
  })
})
