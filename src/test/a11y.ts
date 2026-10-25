import { expect } from 'vitest'
import { axe } from 'vitest-axe'
import * as matchers from 'vitest-axe/matchers'

expect.extend(matchers)

/**
 * Asserts that the given DOM element or container has zero serious or critical
 * accessibility violations according to axe-core.
 */
export async function expectNoA11yViolations(
  container: Element | HTMLElement,
  options?: Parameters<typeof axe>[1],
): Promise<void> {
  const results = await axe(container, options)
  const seriousOrCritical = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(seriousOrCritical).toEqual([])
}

export { axe }
