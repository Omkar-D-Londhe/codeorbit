import { expect, test } from '@playwright/test'

test.describe('PWA & Offline Functionality (Catalog 16.3 & 17.6)', () => {
  test('PWA manifest and icon links are present and respond with valid metadata', async ({ page }) => {
    await page.goto('/')
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest')

    const res = await page.request.get('/manifest.webmanifest')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.name).toBe('CodeOrbit')
    expect(json.short_name).toBe('CodeOrbit')
    expect(json.display).toBe('standalone')
    expect(json.start_url).toBe('/')
    expect(json.icons.length).toBeGreaterThanOrEqual(4)
  })

  test('Service worker is present in production preview', async ({ page }) => {
    const swRes = await page.request.get('/sw.js')
    expect(swRes.status()).toBe(200)
    const swText = await swRes.text()
    expect(swText).toContain("APP_VERSION = '0.1.0'")
    expect(swText).toContain('codeorbit-shell-v')
    expect(swText).toContain('codeorbit-assets-v')
  })

  test('offline navigation and direct deep links load successfully after precaching', async ({ page, context }) => {
    // 1. Initial online visit
    await page.goto('/?enable-sw=1')
    await page.waitForLoadState('networkidle')

    // Wait for service worker to activate and control the client
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker.ready
      return Boolean(reg && reg.active)
    })

    // Give service worker a moment to complete precaching and idle prefetch
    await page.waitForTimeout(1000)

    // Prepopulate learner data in localStorage
    await page.evaluate(() => {
      const s = {
        schemaVersion: 7,
        topics: { 'html-structure': { completed: true } },
        settings: { userName: 'Offline Astronaut' },
      }
      localStorage.setItem('codeorbit:state', JSON.stringify(s))
    })

    // 2. Simulate offline mode (airplane mode)
    await context.setOffline(true)

    // Direct reload while offline
    await page.reload({ waitUntil: 'domcontentloaded' })

    // Header and Shell render successfully offline
    const title = page.locator('.page-title, .hero-title, .brand__name, header')
    await expect(title.first()).toBeVisible()

    // 3. Direct navigation to /settings while offline
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText('Settings')

    // Verify localStorage data was preserved and accessible offline
    const learnerName = await page.inputValue('#user-name-input')
    expect(learnerName).toBe('Offline Astronaut')

    // Restore online status
    await context.setOffline(false)
  })
})
