import { test, expect } from '@playwright/test'
import path from 'node:path'

const SCREENSHOT_DIR = path.resolve('docs/antigravity/status/screenshots/stage-10b')

test.describe('Learning Orbit: Constellation Map Visual and Interactive Verification (Stage 10b Promoted)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('captures responsive constellation map screenshots across required viewports on default route', async ({ page }) => {
    const viewports = [
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'laptop-1280', width: 1280, height: 800 },
      { name: 'tablet-820', width: 820, height: 1180 },
      { name: 'mobile-390', width: 390, height: 844 },
      { name: 'narrow-320', width: 320, height: 640 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      // Promoted default route without query parameters
      await page.goto('/learn/html')
      await page.waitForSelector('.constellation-root')

      // Assert no accidental horizontal overflow on the page body
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(isOverflowing).toBe(false)

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `orbit-${vp.name}.png`),
        fullPage: false,
      })
    }
  })

  test('topic selection, connections, and hub overview interactions on promoted route', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    // Click on Topic 1: Document structure
    const star1 = page.locator('.constellation-star').first()
    await star1.click()

    // Verify topic details panel displayed
    await expect(page.locator('.constellation-panel')).toBeVisible()
    await expect(page.locator('.constellation-panel h2')).toContainText('Document structure')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'orbit-selected-topic.png'),
    })

    // Click on Hub to see Track Overview
    const hub = page.locator('.constellation-hub-btn')
    await hub.click()
    await expect(page.locator('.constellation-panel h2')).toContainText('HTML Track Overview')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'orbit-hub-overview.png'),
    })
  })

  test('switching to list view and persistence across reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    // Click list view toggle
    const listBtn = page.getByRole('button', { name: 'List', exact: true })
    await listBtn.click()

    await expect(page.locator('.constellation-list-view')).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'orbit-list-view.png'),
    })

    // Reload and check persistence
    await page.reload()
    await expect(page.locator('.constellation-list-view')).toBeVisible()

    // Switch to mobile and capture list view
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'orbit-list-mobile.png'),
    })

    // Switch back to Map
    const mapBtn = page.getByRole('button', { name: 'Map', exact: true })
    await mapBtn.click()
    await expect(page.locator('.constellation-map-wrapper')).toBeVisible()
  })

  test('expanded view and escape key handling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    // Click expand button
    const expandBtn = page.getByRole('button', { name: /Expand constellation view/i })
    await expandBtn.click()

    await expect(page.locator('.constellation-root--expanded')).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'orbit-expanded.png'),
    })

    // Press Escape to collapse
    await page.keyboard.press('Escape')
    await expect(page.locator('.constellation-root--expanded')).not.toBeVisible()
  })

  test('reduced motion and high contrast mode visuals', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    // Set high contrast in state
    await page.goto('/learn/html')
    await page.evaluate(() => {
      const raw = localStorage.getItem('codeorbit:app:state:v1')
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.settings = { ...parsed.settings, contrast: 'high' }
      localStorage.setItem('codeorbit:app:state:v1', JSON.stringify(parsed))
    })
    await page.reload()
    await page.waitForSelector('.constellation-root')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'orbit-high-contrast.png'),
    })

    // Set reduced motion in settings
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
      path: path.join(SCREENSHOT_DIR, 'orbit-reduced-motion.png'),
    })
  })

  test('legacy orbit fallback remains accessible via ?orbit=legacy', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html?orbit=legacy')
    await page.waitForSelector('.orbit-card')

    await expect(page.locator('.orbit')).toBeVisible()
    await expect(page.locator('.strip')).toBeVisible()
    await expect(page.locator('.arch')).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'orbit-legacy-fallback.png'),
    })
  })
})
