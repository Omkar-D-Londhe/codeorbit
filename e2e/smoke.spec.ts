import { expect, test } from '@playwright/test'

test.describe('CodeOrbit Browser Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => window.localStorage.clear())
  })

  test('Home at 1280, 820 and 390 px has no horizontal overflow', async ({ page }) => {
    const viewports = [
      { width: 1280, height: 800, name: 'desktop (1280px)' },
      { width: 820, height: 1180, name: 'tablet (820px)' },
      { width: 390, height: 844, name: 'mobile (390px)' },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })

      expect(hasHorizontalOverflow, `Horizontal overflow detected at ${vp.name}`).toBe(false)
    }
  })

  test('Legacy orbit selection works by click and keyboard navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/learn/html')

    // Initial selected topic is Document structure
    const detailHeading = page.locator('.detail__title')
    await expect(detailHeading).toHaveText('Document structure')

    // Selection by click on strip node
    const secondNode = page.locator('[data-nav="strip"][data-topic-id="elements-attributes"]')
    await secondNode.click()
    await expect(detailHeading).toHaveText('Elements and attributes')

    // Selection by click on arch node
    const thirdArchNode = page.locator('[data-nav="arc"][data-topic-id="headings-paragraphs"]')
    await thirdArchNode.click()
    await expect(detailHeading).toHaveText('Headings and paragraphs')

    // Keyboard navigation: focus strip node and press ArrowRight
    const thirdStripNode = page.locator('[data-nav="strip"][data-topic-id="headings-paragraphs"]')
    await thirdStripNode.focus()
    await page.keyboard.press('ArrowRight')

    const activeNode = page.locator('[data-nav="strip"]:focus')
    await expect(activeNode).toHaveAttribute('data-topic-id', 'text-semantics')
  })

  test('Lesson completion persists across page reload', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/lesson/html-structure')

    const completeBtn = page.getByRole('button', { name: /mark lesson complete/i })
    await expect(completeBtn).toBeVisible()
    await completeBtn.click()

    const markedBtn = page.getByRole('button', { name: /lesson marked complete/i })
    await expect(markedBtn).toHaveAttribute('aria-pressed', 'true')

    // Reload the page and verify state persistence
    await page.reload()
    const reloadedBtn = page.getByRole('button', { name: /lesson marked complete/i })
    await expect(reloadedBtn).toHaveAttribute('aria-pressed', 'true')
  })

  test('Practice workspace preview iframe has empty sandbox="" and strict CSP', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/practice/ch-html-structure')

    // Click Run to execute preview and mount SandboxedPreview iframe
    const runBtn = page.getByRole('button', { name: /^run$/i })
    await expect(runBtn).toBeVisible()
    await runBtn.click()

    const iframe = page.locator('.preview__frame')
    await expect(iframe).toBeVisible()

    // Assert sandbox is present and empty
    const sandboxAttr = await iframe.getAttribute('sandbox')
    expect(sandboxAttr).toBe('')

    // Assert srcdoc contains CSP meta tag
    const srcdocAttr = await iframe.getAttribute('srcdoc')
    expect(srcdocAttr).not.toBeNull()
    expect(srcdocAttr).toContain("default-src 'none'")
  })

  test('Theme switching (Obsidian, Starlight, Aurora) and accents visibly restyle document attributes and styles', async ({ page }) => {
    await page.goto('/')

    // Test Starlight (light theme)
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'starlight')
      document.documentElement.setAttribute('data-accent', 'teal')
      document.documentElement.setAttribute('data-contrast', 'high')
      document.documentElement.style.colorScheme = 'light'
    })

    const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(themeAttr).toBe('starlight')

    const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
    // Starlight body bg is #f7f6fb -> rgb(247, 246, 251)
    expect(bodyBg).toBe('rgb(247, 246, 251)')

    // Capture visual verification screenshot in light theme
    await page.screenshot({ path: 'test-results/screenshots/starlight-home-1280.png' })

    // Test Aurora (teal dark theme)
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'aurora')
      document.documentElement.setAttribute('data-accent', 'amber')
      document.documentElement.setAttribute('data-contrast', 'normal')
      document.documentElement.style.colorScheme = 'dark'
    })
    const auroraBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
    // Aurora body bg is #0d1517 -> rgb(13, 21, 23)
    expect(auroraBg).toBe('rgb(13, 21, 23)')

    await page.screenshot({ path: 'test-results/screenshots/aurora-home-1280.png' })

    // Test Obsidian (default dark)
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'obsidian')
      document.documentElement.setAttribute('data-accent', 'violet')
      document.documentElement.setAttribute('data-contrast', 'normal')
      document.documentElement.style.colorScheme = 'dark'
    })
    await page.screenshot({ path: 'test-results/screenshots/obsidian-home-1280.png' })

    // Responsive viewports
    await page.setViewportSize({ width: 820, height: 1180 })
    await page.screenshot({ path: 'test-results/screenshots/obsidian-home-820.png' })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: 'test-results/screenshots/obsidian-home-390.png' })

    await page.setViewportSize({ width: 320, height: 640 })
    await page.screenshot({ path: 'test-results/screenshots/obsidian-home-320.png' })

    // Test early script storage application across reload
    await page.evaluate(() => {
      localStorage.setItem('codeorbit:settings:early', JSON.stringify({
        v: 1,
        theme: 'aurora',
        accent: 'azure',
        contrast: 'normal',
        motion: 'system'
      }))
    })
    await page.reload()
    const reloadedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(reloadedTheme).toBe('aurora')
  })

  test('Dev route /__ui is isolated from production build (returns 404 NotFound)', async ({ page }) => {
    await page.goto('/__ui')
    // In production preview build, UiGallery is stripped and NotFound page is shown
    const notFoundText = page.locator('text=That page doesn’t exist')
    await expect(notFoundText).toBeVisible()
  })

  test('Settings page renders form controls, quota meter, and allows data management', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Profile input
    const nameInput = page.locator('#user-name-input')
    await expect(nameInput).toBeVisible()
    await nameInput.fill('Ada Lovelace')

    // Preferred pace select
    const paceSelect = page.locator('#pace-select')
    await expect(paceSelect).toBeVisible()
    await paceSelect.selectOption('intensive')

    // Theme radio selection
    const starlightRadio = page.locator('input[type="radio"][value="starlight"]')
    await expect(starlightRadio).toBeVisible()
    await starlightRadio.check()

    // Export and Reset buttons exist
    const exportBtn = page.locator('button:has-text("Export Backup (.json)")')
    await expect(exportBtn).toBeVisible()

    const resetBtn = page.locator('button:has-text("Reset All Learning Data")')
    await expect(resetBtn).toBeVisible()

    // Quota indicator is rendered
    const quotaLabel = page.locator('text=Storage Usage')
    await expect(quotaLabel).toBeVisible()
  })

  test('Atmosphere layers render behind content and reduced motion disables animations', async ({ page }) => {
    // 1. Visit Home with normal motion
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const atmosphereRoot = page.locator('.atmosphere-root')
    await expect(atmosphereRoot).toBeAttached()
    await expect(atmosphereRoot).toHaveAttribute('aria-hidden', 'true')

    // Nebula is rendered on Home
    const nebula = page.locator('.nebula-backdrop')
    await expect(nebula).toBeAttached()

    // Constellation grid is rendered
    const grid = page.locator('.constellation-grid')
    await expect(grid).toBeAttached()

    // 2. Emulate prefers-reduced-motion: reduce
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Under reduced motion, animated glow classes are suppressed
    const animatedGlow = page.locator('.nebula-glow--animated')
    await expect(animatedGlow).toHaveCount(0)

    // 3. Settings motion control
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const motionSelect = page.locator('#motion-select')
    await expect(motionSelect).toBeVisible()
    await motionSelect.selectOption('reduced')

    const rootMotion = await page.evaluate(() => document.documentElement.getAttribute('data-motion'))
    expect(rootMotion).toBe('reduced')
  })

  test('Stage 05: Editor platform, Splitter, AutoSaveIndicator, Fullscreen, and Editor preferences', async ({ page }) => {
    // 1. Visit Practice page on desktop
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/practice/ch-html-structure')
    await page.waitForLoadState('networkidle')

    // Splitter is rendered
    const splitter = page.locator('div[role="separator"]')
    await expect(splitter).toBeVisible()
    await expect(splitter).toHaveAttribute('aria-valuenow', '50')

    // Auto-save indicator is rendered
    const autoSave = page.locator('.auto-save-indicator')
    await expect(autoSave).toBeVisible()

    // Fullscreen editor button
    const fullscreenBtn = page.getByRole('button', { name: /fullscreen editor/i })
    await expect(fullscreenBtn).toBeVisible()
    await fullscreenBtn.click()

    // Fullscreen dialog opens
    const fullscreenDialog = page.getByRole('dialog', { name: /fullscreen code editor/i })
    await expect(fullscreenDialog).toBeVisible()

    // Press Escape to exit fullscreen
    await page.keyboard.press('Escape')
    await expect(fullscreenDialog).not.toBeVisible()

    // 2. Settings: Editor Preferences
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const engineSelect = page.locator('#editor-engine-select')
    await expect(engineSelect).toBeVisible()
    await expect(engineSelect).toHaveValue('codemirror')

    const fontSizeSelect = page.locator('#editor-font-size-select')
    await expect(fontSizeSelect).toBeVisible()

    const tabSizeSelect = page.locator('#editor-tab-size-select')
    await expect(tabSizeSelect).toBeVisible()
  })

  test('Stage 06: Practice workspace, device frames, snippets, a11y linter, and diff gating', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/practice/ch-html-structure')
    await page.waitForLoadState('networkidle')

    // 1. Device frames
    const runBtn = page.getByRole('button', { name: /^run$/i })
    await runBtn.click()

    const tabletFrameBtn = page.getByRole('button', { name: 'Tablet' })
    await expect(tabletFrameBtn).toBeVisible()
    await tabletFrameBtn.click()
    await expect(page.locator('.device-frame-caption')).toHaveText('Tablet · 768 × 1024')

    const mobileFrameBtn = page.getByRole('button', { name: 'Mobile' })
    await mobileFrameBtn.click()
    await expect(page.locator('.device-frame-caption')).toHaveText('Mobile · 375 × 667')

    // 2. Diff button disabled before reveal
    const diffBtn = page.getByRole('button', { name: /^diff$/i })
    await expect(diffBtn).toBeDisabled()

    // 3. Snippets library drawer
    const snippetsBtn = page.getByRole('button', { name: /snippets/i })
    await expect(snippetsBtn).toBeVisible()
    await snippetsBtn.click()

    const snippetHeading = page.getByRole('heading', { name: 'Code Snippets' })
    await expect(snippetHeading).toBeVisible()

    // Close the drawer before interacting with the background page
    await page.getByRole('button', { name: 'Close drawer' }).click()
    await expect(snippetHeading).not.toBeVisible()

    // 4. Accessibility linter
    const runLinterBtn = page.getByRole('button', { name: /run linter/i })
    await expect(runLinterBtn).toBeVisible()
    await runLinterBtn.click()

    const linterHeading = page.locator('text=Accessibility Linter')
    await expect(linterHeading).toBeVisible()
  })
})
