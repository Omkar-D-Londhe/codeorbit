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
    const runBtn = page.getByRole('button', { name: /run/i })
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
})
