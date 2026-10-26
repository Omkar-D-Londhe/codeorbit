import { test, expect } from '@playwright/test'
import path from 'node:path'

const SCREENSHOT_DIR = path.resolve('docs/antigravity/status/screenshots/stage-11')

test.describe('Gamification & Engagement UI Visual Verification (Stage 11)', () => {
  test.setTimeout(60000)

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('captures responsive Progress page screenshots across viewports', async ({ page }) => {
    const viewports = [
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'laptop-1280', width: 1280, height: 800 },
      { name: 'tablet-820', width: 820, height: 1180 },
      { name: 'mobile-390', width: 390, height: 844 },
      { name: 'narrow-320', width: 320, height: 640 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/progress')
      await page.waitForSelector('.xp-bar-card')
      await page.waitForSelector('.daily')
      await page.waitForSelector('.badge-gallery-section')

      // Assert no accidental horizontal overflow
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(isOverflowing).toBe(false)

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `progress-${vp.name}.png`),
        fullPage: false,
      })
    }
  })

  test('captures daily challenge completed state with completion stamp', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    // Seed state where today's daily challenge is completed
    await page.goto('/')
    await page.evaluate(() => {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      const baseState = {
        schemaVersion: 5,
        topics: { 'html-structure': { lessonComplete: true, quizAttempts: 1, quizBest: { correct: 3, total: 3 } } },
        quizSessions: {},
        drafts: {},
        challenges: { 'ch-lists': { attempts: 1, hintsRevealed: 0, solutionRevealed: false, completed: true, completedWithoutSolution: true, history: [] } },
        notes: {},
        bookmarks: [],
        sectionBookmarks: [],
        errorNotebook: [],
        settings: {
          userName: 'Explorer',
          pace: 'regular',
          theme: 'obsidian',
          accent: 'violet',
          contrast: 'normal',
          motion: 'system',
          gamificationEnabled: true,
        },
        activity: [],
        activityDays: [today],
        dailyDone: [today],
        dailyAssigned: { [today]: 'ch-lists' },
        streakBest: 1,
        badges: {
          'first-challenge': { firstSeenAt: Date.now(), backfilled: false },
        },
        personalBests: {
          longestStreak: 1,
        },
      }
      localStorage.setItem('codeorbit:state', JSON.stringify(baseState))
    })

    await page.goto('/progress')
    await page.waitForSelector('.daily__stamp')
    await expect(page.locator('.daily__stamp')).toContainText('Completed')
    await expect(page.locator('.badge-card--earned').first()).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'daily-completed-1440.png'),
    })
  })

  test('captures Settings page with Motivation & Gamification toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/settings')
    await page.waitForSelector('text=Show XP and achievements')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'settings-gamification-toggle.png'),
    })
  })

  test('captures High Contrast mode on Progress page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/settings')
    await page.locator('label:has-text("High Contrast Mode")').click()

    await page.goto('/progress')
    await page.waitForSelector('.xp-bar-card')
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'progress-high-contrast.png'),
    })
  })

  test('captures Reduced Motion mode on Progress page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/settings')
    await page.locator('#motion-select').selectOption('reduced')

    await page.goto('/progress')
    await page.waitForSelector('.xp-bar-card')
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'progress-reduced-motion.png'),
    })
  })
})
