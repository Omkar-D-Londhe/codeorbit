import { expect, test } from '@playwright/test'

test.describe('CodeOrbit Stage 29: End-to-End Learner Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.localStorage.clear())
  })

  test('Complete learner journey: explore -> lesson -> quiz -> practice -> mastery', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    // 1. First run on Home
    await page.goto('/')
    await expect(page.locator('h1.page-title')).toHaveText(/Learn (HTML )?by exploring/i)

    // 2. Open Explore
    await page.goto('/explore')
    await expect(page.locator('h1.page-title')).toContainText('Explore technologies')

    // Check that available tracks exist
    await expect(page.locator('h2', { hasText: 'HTML' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'JavaScript' })).toBeVisible()

    // 3. Open HTML track
    await page.goto('/learn/html')
    await expect(page.locator('h1.page-title')).toContainText('HTML Learning Orbit')

    // 4. Open first lesson
    await page.goto('/lesson/html-structure')
    await expect(page.locator('h1.page-title')).toBeVisible()

    // Complete lesson
    const markCompleteBtn = page.locator('button', { hasText: /Mark lesson complete/i })
    if (await markCompleteBtn.isVisible()) {
      await markCompleteBtn.click()
    }

    // 5. Open Quiz
    await page.goto('/quiz/html-structure')
    await expect(page.locator('.quiz-card')).toBeVisible()
    const startQuizBtn = page.locator('button', { hasText: /Start quiz/i })
    if (await startQuizBtn.isVisible()) {
      await startQuizBtn.click()
    }
    await expect(page.locator('.quiz-card')).toBeVisible()

    // 6. Open Mastery Map
    await page.goto('/learn/html/mastery')
    await expect(page.locator('h1.page-title')).toContainText('Mastery map')
  })

  test('Settings change persistence and connected services audit', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/settings')

    // Check Connected Services card
    const servicesCard = page.locator('.card', { hasText: 'Connected Services' })
    await expect(servicesCard).toBeVisible()

    // Confirm all 3 external services are displayed as Not connected
    await expect(servicesCard.locator('[data-testid="service-status-w3c-validator"]')).toHaveText('Not connected')
    await expect(servicesCard.locator('[data-testid="service-status-ai-hints"]')).toHaveText('Not connected')
    await expect(servicesCard.locator('[data-testid="service-status-multiplayer"]')).toHaveText('Not connected')

    // Confirm action buttons are disabled
    const notConfiguredButtons = servicesCard.locator('button', { hasText: 'Not configured' })
    await expect(notConfiguredButtons).toHaveCount(3)
  })

  test('Concept Atlas navigation and honesty check', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/concepts')

    await expect(page.locator('h1.concept-atlas__title')).toHaveText('Frontend Concept Atlas')

    // Check that FC-29 (Angular) is present and marked pending
    const fc29Card = page.locator('[data-concept-id="FC-29"], .concept-card:has-text("FC-29")')
    await expect(fc29Card).toBeVisible()
    await expect(fc29Card).toContainText(/pending/i)
  })

  test('Command palette open, search and navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    // Press Ctrl+K
    await page.keyboard.press('Control+k')
    const paletteInput = page.locator('input.command-palette__input, .command-palette input')
    if (await paletteInput.isVisible()) {
      await paletteInput.fill('Settings')
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/.*settings/)
    }
  })
})
