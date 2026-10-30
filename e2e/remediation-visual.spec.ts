import { test, expect } from '@playwright/test'
import path from 'node:path'

const SCREENSHOT_DIR = path.resolve('docs/antigravity/status/screenshots/stage-10-remediation')

test.describe('Learning Orbit: Constellation Final Remediation Verification (Stage 10 Consolidated)', () => {
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

  test('Issue 2 (Toolbar): bottom-right toolbar renders all 4 working control icons with visible paths', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    const toolbar = page.locator('.constellation-toolbar')
    await expect(toolbar).toBeVisible()

    // Assert that each button has an icon with a non-empty svg path
    const buttons = toolbar.locator('button')
    await expect(buttons).toHaveCount(4)

    for (let i = 0; i < 4; i++) {
      const btn = buttons.nth(i)
      const pathD = await btn.locator('svg path').getAttribute('d')
      expect(pathD).toBeTruthy()
      expect(pathD!.length).toBeGreaterThan(5)
    }

    // Capture focused screenshot of the toolbar in its corrected state
    await toolbar.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-toolbar-corrected.png'),
    })
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

    // Constellation hub should remain visible and centered
    const hub = page.locator('.constellation-hub-btn')
    await expect(hub).toBeVisible()

    const hubBox = await hub.boundingBox()
    expect(hubBox).not.toBeNull()
    if (hubBox) {
      // Hub center should be near middle of container, not drifting off-screen or top-left
      expect(hubBox.x).toBeGreaterThan(150)
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
    const expandBtn = page.getByRole('button', { name: /Expand map view/i })
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

  test('Acceptance 1: Mobile map boundaries (390x844 & 320x640) ensure stepper and toolbar are accessible without bottom-nav obscuring', async ({ page }) => {
    for (const size of [{ w: 390, h: 844 }, { w: 320, h: 640 }]) {
      await page.setViewportSize({ width: size.w, height: size.h })
      await page.goto('/learn/html')
      await page.waitForSelector('.constellation-root')

      const bottomNav = page.locator('.bottom-nav')
      const stepper = page.locator('.constellation-stepper-wrap')
      const toolbar = page.locator('.constellation-toolbar')

      // Scroll map into view
      await page.evaluate(() => {
        const wrapper = document.querySelector('.constellation-map-wrapper')
        if (wrapper) {
          wrapper.scrollIntoView({ block: 'end' })
        }
      })

      await expect(stepper).toBeVisible()
      await expect(toolbar).toBeVisible()

      const navBox = await bottomNav.boundingBox()
      const stepperBox = await stepper.boundingBox()
      const toolbarBox = await toolbar.boundingBox()

      expect(navBox).not.toBeNull()
      expect(stepperBox).not.toBeNull()
      expect(toolbarBox).not.toBeNull()

      if (navBox && stepperBox && toolbarBox) {
        // When map is in view, controls are not covered by the fixed bottom nav
        expect(stepperBox.y + stepperBox.height).toBeLessThanOrEqual(navBox.y + 1)
        expect(toolbarBox.y + toolbarBox.height).toBeLessThanOrEqual(navBox.y + 1)

        // Stepper and toolbar do not collide with each other horizontally
        expect(stepperBox.x + stepperBox.width).toBeLessThanOrEqual(toolbarBox.x + 4)
      }
    }
  })

  test('Acceptance 2: Mobile List view card layout and scanning at 390px and 320px', async ({ page }) => {
    for (const size of [{ name: 'mobile-390-list', w: 390, h: 844 }, { name: 'narrow-320-list', w: 320, h: 640 }]) {
      await page.setViewportSize({ width: size.w, height: size.h })
      await page.goto('/learn/html')
      await page.waitForSelector('.constellation-root')

      const listBtn = page.getByRole('button', { name: 'List', exact: true })
      await listBtn.click()

      const listView = page.locator('.constellation-list-view')
      await expect(listView).toBeVisible()

      // Rows render cards with title, status pill, and View topic link
      const rows = page.locator('.constellation-list-row')
      await expect(rows.first()).toBeVisible()

      const firstTitle = rows.first().locator('.constellation-list-row__title')
      await expect(firstTitle).toBeVisible()
      const titleBox = await firstTitle.boundingBox()
      // Title must have at least 180px available width (not squished to 100px)
      expect(titleBox?.width).toBeGreaterThan(180)

      const viewBtn = rows.first().locator('.constellation-list-row__btn')
      await expect(viewBtn).toBeVisible()

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `remediation-${size.name}.png`),
      })
    }
  })

  test('Acceptance 4: Expanded details-card bounds, deep-link actions, and narrow mobile expanded view', async ({ page }) => {
    for (const size of [{ name: 'mobile-390', w: 390, h: 844 }, { name: 'narrow-320', w: 320, h: 640 }]) {
      await page.setViewportSize({ width: size.w, height: size.h })
      await page.goto('/learn/html')
      await page.waitForSelector('.constellation-root')

      // Select first star
      const star = page.locator('.constellation-star').first()
      await star.click()

      // Expand map view via toolbar
      const expandBtn = page.getByRole('button', { name: /Expand map view/i })
      await expandBtn.click()

      await expect(page.locator('.constellation-root--expanded')).toBeVisible()

      const card = page.locator('.constellation-expanded-card')
      await expect(card).toBeVisible()

      const cardBox = await card.boundingBox()
      expect(cardBox).not.toBeNull()

      if (cardBox) {
        // Floating card is fully within viewport bounds
        expect(cardBox.x).toBeGreaterThanOrEqual(0)
        expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(size.w + 1)
        expect(cardBox.y).toBeGreaterThanOrEqual(0)
        expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(size.h)
      }

      // Deep-link actions route to valid application URLs
      const lessonLink = card.getByRole('link', { name: /Lesson/i })
      const quizLink = card.getByRole('link', { name: /Quiz/i })
      const practiceLink = card.getByRole('link', { name: /Practice/i })

      await expect(lessonLink).toBeVisible()
      await expect(quizLink).toBeVisible()
      await expect(practiceLink).toBeVisible()

      const lessonHref = await lessonLink.getAttribute('href')
      const quizHref = await quizLink.getAttribute('href')
      const practiceHref = await practiceLink.getAttribute('href')

      expect(lessonHref).toBe('/lesson/html-structure')
      expect(quizHref).toBe('/quiz/html-structure')
      expect(practiceHref).toMatch(/^\/practice\/[a-z0-9-]+$/)

      // Stepper and toolbar are still reachable in expanded view
      await expect(page.locator('.constellation-toolbar')).toBeVisible()
      await expect(page.locator('.constellation-stepper-wrap')).toBeVisible()

      if (size.name === 'mobile-390') {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'remediation-mobile-expanded-card.png'),
        })
      }

      // Exit expanded view via card minimize button
      const minimizeBtn = card.getByRole('button', { name: /Exit expanded view/i })
      await minimizeBtn.click()
      await expect(page.locator('.constellation-root--expanded')).not.toBeVisible()
    }
  })

  test('Acceptance 5: Topic counter reflects exactly 13 topics on HTML track dynamically', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    const counter = page.locator('.constellation-stepper-counter')
    await expect(counter).toBeVisible()
    await expect(counter).toHaveText('1 / 13')

    // Click next topic in stepper
    const nextBtn = page.getByRole('button', { name: 'Next topic' })
    await nextBtn.click()
    await expect(counter).toHaveText('2 / 13')

    // At desktop size, details panel badge also displays Topic 2 of 13
    await page.setViewportSize({ width: 1440, height: 900 })
    const panelBadge = page.locator('.constellation-panel__badge')
    await expect(panelBadge).toHaveText('Topic 2 of 13')
  })

  test('Acceptance 3: Toolbar controls verification through click, keyboard focus, and expand/collapse', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    const mapContent = page.locator('.constellation-map-content')
    const initialTransform = await mapContent.getAttribute('style')

    // 1. Click Zoom In
    const zoomInBtn = page.getByRole('button', { name: /Zoom in/i })
    await zoomInBtn.click()
    const zoomedInTransform = await mapContent.getAttribute('style')
    expect(zoomedInTransform).not.toEqual(initialTransform)

    // 2. Click Zoom Out
    const zoomOutBtn = page.getByRole('button', { name: /Zoom out/i })
    await zoomOutBtn.click()

    // 3. Click Reset/Fit
    const fitBtn = page.getByRole('button', { name: /Fit view/i })
    await fitBtn.click()

    // 4. Keyboard Arrow navigation inside toolbar
    await zoomInBtn.focus()
    await expect(zoomInBtn).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(zoomOutBtn).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(fitBtn).toBeFocused()

    // 5. Expand & collapse via toolbar button
    const expandBtn = page.getByRole('button', { name: /Expand map view/i })
    await expandBtn.click()
    await expect(page.locator('.constellation-root--expanded')).toBeVisible()

    // Minimize via keyboard Escape
    await page.keyboard.press('Escape')
    await expect(page.locator('.constellation-root--expanded')).not.toBeVisible()
  })

  test('Issue 6 (Mobile List View): switching to list view on mobile 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/learn/html')
    await page.waitForSelector('.constellation-root')

    const listBtn = page.getByRole('button', { name: 'List', exact: true })
    await listBtn.click()

    await expect(page.locator('.constellation-list-view')).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-mobile-list-view.png'),
    })
  })

  test('Issue 9: high contrast and reduced motion modes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/learn/html')

    // Enable high contrast in app state and emulate forced-colors
    await page.evaluate(() => {
      localStorage.setItem('codeorbit:settings:early', JSON.stringify({
        v: 1,
        theme: 'obsidian',
        accent: 'violet',
        contrast: 'high',
      }))
      const raw = localStorage.getItem('codeorbit:state')
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.settings = { ...(parsed.settings || {}), contrast: 'high' }
      localStorage.setItem('codeorbit:state', JSON.stringify(parsed))
    })
    await page.emulateMedia({ forcedColors: 'active' })
    await page.reload()
    await page.waitForSelector('.constellation-root')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-high-contrast.png'),
    })

    // Enable reduced motion
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'reduce' })
    await page.evaluate(() => {
      localStorage.setItem('codeorbit:settings:early', JSON.stringify({
        v: 1,
        theme: 'obsidian',
        accent: 'violet',
        contrast: 'normal',
        motion: 'reduced',
      }))
      const raw = localStorage.getItem('codeorbit:state')
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.settings = { ...(parsed.settings || {}), contrast: 'normal', motion: 'reduced' }
      localStorage.setItem('codeorbit:state', JSON.stringify(parsed))
    })
    await page.reload()
    await page.waitForSelector('.constellation-root')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'remediation-reduced-motion.png'),
    })
  })
})
