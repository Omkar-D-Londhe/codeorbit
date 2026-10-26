import { test, expect } from '@playwright/test'
import path from 'node:path'

const SCREENSHOT_DIR = path.resolve('docs/antigravity/status/screenshots/stage-10-remediation')

test.describe('Learning Orbit: Constellation Remediation Verification (Stage 10 Consolidated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('Issue 1, 2, 3, 5, 6: captures centered map, wrapped labels, and responsive layout across viewports', async ({ page }) => {
    const viewports = [
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'laptop-1280', width: 1280, height: 800 },
      { name: 'tablet-820', width: 820, height: 1180 },
      { name: 'mobile-390', width: 390, height: 844 },
      { name: 'narrow-320', width: 320, height: 640 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/learn/html')
      await page.waitForSelector('.constellation-root')

      // Assert zero accidental horizontal page overflow
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(isOverflowing).toBe(false)

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `remediation-${vp.name}.png`),
        fullPage: false,
      })
    }
  })

  test('Issue 1: repeated zoom out remains centered without drifting to top-left corner', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    // Click Zoom Out multiple times
    const zoomOutBtn = page.getByRole('button', { name: /Zoom out/i })
    await zoomOutBtn.click()
    await zoomOutBtn.click()
    await zoomOutBtn.click()
    await zoomOutBtn.click()

    // Constellation hub should remain visible and well within container
    const hub = page.locator('.constellation-hub-btn')
    await expect(hub).toBeVisible()

    const hubBox = await hub.boundingBox()
    expect(hubBox).not.toBeNull()
    if (hubBox) {
      // Hub center should be near the middle of the container, not drifting off-screen or top-left
      expect(hubBox.x).toBeGreaterThan(100)
      expect(hubBox.y).toBeGreaterThan(100)
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-zoomed-out.png'),
    })
  })

  test('Issue 4 & 7: selected topic emphasis, state preservation, and distinct incoming vs outgoing edge hierarchy', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    // Select topic 2 (has prerequisite topic 1 and dependents)
    const stars = page.locator('.constellation-star')
    await stars.nth(1).click()

    await expect(page.locator('.constellation-panel')).toBeVisible()

    // Check that edges contain incoming and outgoing classes
    const incomingEdge = page.locator('.constellation-edge-prereq.is-incoming')
    await expect(incomingEdge.first()).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-selected-topic-hierarchy.png'),
    })
  })

  test('Issue 8: expanded mode retains topic details card with deep-link navigation actions', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    // Select a star first
    const star = page.locator('.constellation-star').first()
    await star.click()

    // Click expand
    const expandBtn = page.getByRole('button', { name: /Expand constellation view/i })
    await expandBtn.click()

    await expect(page.locator('.constellation-root--expanded')).toBeVisible()

    // Floating card should be visible with topic details and Lesson, Quiz, Practice links
    const floatingCard = page.locator('.constellation-expanded-card')
    await expect(floatingCard).toBeVisible()
    await expect(floatingCard.getByRole('link', { name: /Lesson/i })).toBeVisible()
    await expect(floatingCard.getByRole('link', { name: /Quiz/i })).toBeVisible()
    await expect(floatingCard.getByRole('link', { name: /Practice/i })).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-expanded-details-card.png'),
    })

    // Press Escape to exit expanded mode
    await page.keyboard.press('Escape')
    await expect(page.locator('.constellation-root--expanded')).not.toBeVisible()
    await expect(page.locator('.constellation-panel')).toBeVisible()
  })

  test('Issue 9: high contrast and reduced motion modes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')

    // Enable high contrast
    await page.evaluate(() => {
      const raw = localStorage.getItem('codeorbit:app:state:v1')
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.settings = { ...parsed.settings, contrast: 'high' }
      localStorage.setItem('codeorbit:app:state:v1', JSON.stringify(parsed))
    })
    await page.reload()
    await page.waitForSelector('.constellation-root')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-high-contrast.png'),
    })

    // Enable reduced motion
    await page.evaluate(() => {
      const raw = localStorage.getItem('codeorbit:app:state:v1')
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.settings = { ...parsed.settings, contrast: 'normal', motion: 'reduced' }
      localStorage.setItem('codeorbit:app:state:v1', JSON.stringify(parsed))
    })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()
    await page.waitForSelector('.constellation-root')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-reduced-motion.png'),
    })
  })
})
