import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(
  process.cwd(),
  'docs',
  'antigravity',
  'status',
  'screenshots',
  'stage-12'
)

test.describe('Dashboard UI Visual Verification (Stage 12)', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.localStorage.clear())
  })

  test('captures responsive Dashboard screenshots across 5 viewports with zero horizontal overflow', async ({
    page,
  }) => {
    test.setTimeout(60000)

    const viewports = [
      { name: 'dashboard-desktop-1440.png', width: 1440, height: 900 },
      { name: 'dashboard-laptop-1280.png', width: 1280, height: 800 },
      { name: 'dashboard-tablet-820.png', width: 820, height: 1180 },
      { name: 'dashboard-mobile-390.png', width: 390, height: 844 },
      { name: 'dashboard-narrow-320.png', width: 320, height: 640 },
    ]

    // Populate a realistic returning learner state
    await page.goto('/')
    await page.evaluate(() => {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      const state = {
        schemaVersion: 5,
        topics: {
          'html-structure': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } },
          'elements-attributes': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 2, total: 3 } },
        },
        quizSessions: {},
        drafts: {},
        challenges: {
          'ch-html-structure': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true, history: [] },
        },
        notes: { 'html-structure': { text: 'Key elements to remember', updatedAt: Date.now() } },
        bookmarks: ['html-structure'],
        sectionBookmarks: [],
        errorNotebook: [
          { id: 'err-1', source: 'quiz', topicId: 'headings-paragraphs', refId: 'q-1', title: 'h1 heading usage', detail: 'Only one h1 per page', status: 'open', createdAt: Date.now() },
        ],
        settings: {
          userName: 'Explorer',
          pace: 'regular',
          theme: 'obsidian',
          accent: 'violet',
          contrast: 'normal',
          motion: 'system',
          gamificationEnabled: true,
        },
        activity: [
          { id: 'a1', type: 'lesson-complete', topicId: 'html-structure', at: Date.now() - 3600000 },
          { id: 'a2', type: 'quiz-finish', topicId: 'html-structure', at: Date.now() - 1800000, meta: { score: 3, total: 3 } },
        ],
        activityDays: [today],
        dailyDone: [],
        dailyAssigned: { [today]: 'ch-html-structure' },
        streakBest: 1,
        badges: {
          'first-challenge': { firstSeenAt: Date.now(), backfilled: false },
        },
        personalBests: {
          longestStreak: 1,
        },
        lastVisited: { topicId: 'headings-paragraphs', activity: 'lesson', at: Date.now() },
      }
      localStorage.setItem('codeorbit:state', JSON.stringify(state))
    })

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await page.waitForSelector('.hero-ring-card')
      await page.waitForSelector('.dashboard-container')

      // Check horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalOverflow, `Horizontal overflow at ${vp.width}px`).toBe(false)

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, vp.name),
        fullPage: false,
      })
    }
  })

  test('captures first-run empty dashboard with honest empty copy and no fabricated numbers', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.waitForSelector('.hero-ring-card')

    await expect(page.getByRole('heading', { level: 1, name: /learn html by exploring it/i })).toBeVisible()
    await expect(page.locator('.hero-ring-stat')).toContainText(/0 of 1[23] topics complete/)
    await expect(page.getByText(/no activity recorded yet/i)).toBeVisible()
    await expect(page.locator('.activity-feed-card')).toHaveCount(0)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dashboard-first-run-1280.png'),
    })
  })

  test('captures High Contrast mode on Dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/settings')
    await page.locator('label:has-text("High Contrast Mode")').click()

    await page.goto('/')
    await page.waitForSelector('.hero-ring-card')
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dashboard-high-contrast.png'),
    })
  })

  test('captures Reduced Motion mode on Dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/settings')
    await page.locator('#motion-select').selectOption('reduced')

    await page.goto('/')
    await page.waitForSelector('.hero-ring-card')
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dashboard-reduced-motion.png'),
    })
  })
})
