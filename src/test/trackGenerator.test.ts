import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

describe('Stage 21: Track Scaffolding Generator (PLT-12)', () => {
  const testTrackId = 'test-scaffold-tmp'
  const rootDir = path.resolve(__dirname, '..', '..')
  const trackDir = path.join(rootDir, 'src', 'tracks', testTrackId)
  const testFilePath = path.join(rootDir, 'src', 'test', 'tracks', `${testTrackId}.test.ts`)

  const cleanUp = () => {
    try {
      if (fs.existsSync(trackDir)) {
        fs.rmSync(trackDir, { recursive: true, force: true })
      }
      if (fs.existsSync(testFilePath)) {
        fs.rmSync(testFilePath, { force: true })
      }
    } catch {
      // Ignore cleanup error
    }
  }

  beforeAll(() => {
    cleanUp()
  })

  afterAll(() => {
    cleanUp()
  })

  it('scaffolds a complete track module and failing-until-filled test', () => {
    // Run generator
    const scriptPath = path.join(rootDir, 'scripts', 'new-track.mjs')
    const result = execSync(`node "${scriptPath}" ${testTrackId}`, {
      cwd: rootDir,
      encoding: 'utf8',
    })

    expect(result).toContain(`Successfully scaffolded new track`)
    expect(result).toContain(testTrackId)

    // Verify all track module files exist
    expect(fs.existsSync(path.join(trackDir, 'curriculum.ts'))).toBe(true)
    expect(fs.existsSync(path.join(trackDir, 'track.ts'))).toBe(true)
    expect(fs.existsSync(path.join(trackDir, 'lessons.ts'))).toBe(true)
    expect(fs.existsSync(path.join(trackDir, 'quizzes.ts'))).toBe(true)
    expect(fs.existsSync(path.join(trackDir, 'challenges.ts'))).toBe(true)
    expect(fs.existsSync(path.join(trackDir, 'achievements.ts'))).toBe(true)
    expect(fs.existsSync(path.join(trackDir, 'snippets.ts'))).toBe(true)

    // Verify test file exists
    expect(fs.existsSync(testFilePath)).toBe(true)

    // Verify content of curriculum
    const curriculumContent = fs.readFileSync(path.join(trackDir, 'curriculum.ts'), 'utf8')
    expect(curriculumContent).toContain(`id: '${testTrackId}-foundations'`)
    expect(curriculumContent).toContain(`technologyId: '${testTrackId}'`)

    // Verify test file has failing-until-filled assertion
    const testContent = fs.readFileSync(testFilePath, 'utf8')
    expect(testContent).toContain('expect.fail')
    expect(testContent).toContain('requires curriculum completion')
  })
})
