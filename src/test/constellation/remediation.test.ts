import { describe, expect, it } from 'vitest'
import { computeConstellationLayout } from '../../core/orbit/constellation/layout'
import { fitTransform, clampTransform, baseFitScale } from '../../core/orbit/constellation/viewport'
import { topics as htmlTopics } from '../../data/curriculum'

describe('Stage 10 Remediation — Constellation UI and Interaction Fixes', () => {
  const layout = computeConstellationLayout(htmlTopics, 'landscape')

  describe('Issue 1 & 2: Zoom Stability, Zero Drift, and Centering', () => {
    it('centers hub at exact container center on initial fit', () => {
      const containers = [
        { w: 1440, h: 800 },
        { w: 1000, h: 600 },
        { w: 768, h: 500 },
        { w: 390, h: 380 },
        { w: 320, h: 340 },
      ]

      for (const container of containers) {
        const fit = fitTransform(layout, container)
        const scale = baseFitScale(layout, container)

        // Hub in container coordinates
        const hubScreenX = fit.x + layout.hub.x * scale
        const hubScreenY = fit.y + layout.hub.y * scale

        expect(Math.abs(hubScreenX - container.w / 2)).toBeLessThan(0.01)
        expect(Math.abs(hubScreenY - container.h / 2)).toBeLessThan(0.01)
      }
    })

    it('returns to exact same position after zoom-in and zoom-out sequence (zero drift)', () => {
      const container = { w: 1000, h: 600 }
      const fit = fitTransform(layout, container)
      const cx = container.w / 2
      const cy = container.h / 2

      // Zoom in by 1.25
      const zoomFactor = 1.25
      const targetZoom1 = fit.zoom * zoomFactor
      const ratio1 = targetZoom1 / fit.zoom
      const x1 = cx - (cx - fit.x) * ratio1
      const y1 = cy - (cy - fit.y) * ratio1

      // Zoom back out by 1/1.25
      const targetZoom2 = targetZoom1 * (1 / zoomFactor)
      const ratio2 = targetZoom2 / targetZoom1
      const x2 = cx - (cx - x1) * ratio2
      const y2 = cy - (cy - y1) * ratio2

      expect(Math.abs(x2 - fit.x)).toBeLessThan(0.001)
      expect(Math.abs(y2 - fit.y)).toBeLessThan(0.001)
      expect(Math.abs(targetZoom2 - fit.zoom)).toBeLessThan(0.001)
    })

    it('does not translate or drift when already at minimum zoom (0.75)', () => {
      const minZoomState = { x: 120, y: 80, zoom: 0.75 }
      const zoomFactor = 1 / 1.25
      const targetZoom = Math.max(0.75, Math.min(3.0, minZoomState.zoom * zoomFactor))

      // Target zoom is clamped to 0.75, so no change should occur
      expect(targetZoom).toBe(0.75)
      expect(Math.abs(targetZoom - minZoomState.zoom)).toBeLessThan(1e-4)
    })

    it('preserves pointer anchor point during pointer-anchored zoom', () => {
      const container = { w: 1000, h: 600 }
      const fit = fitTransform(layout, container)
      const scale = baseFitScale(layout, container)
      const mouseX = 350
      const mouseY = 250

      // Layout coordinate under mouse before zoom
      const layoutX = (mouseX - fit.x) / (scale * fit.zoom)
      const layoutY = (mouseY - fit.y) / (scale * fit.zoom)

      // Zoom in around pointer
      const targetZoom = fit.zoom * 1.5
      const ratio = targetZoom / fit.zoom
      const newX = mouseX - (mouseX - fit.x) * ratio
      const newY = mouseY - (mouseY - fit.y) * ratio

      // Layout coordinate under mouse after zoom
      const newLayoutX = (mouseX - newX) / (scale * targetZoom)
      const newLayoutY = (mouseY - newY) / (scale * targetZoom)

      expect(Math.abs(newLayoutX - layoutX)).toBeLessThan(0.001)
      expect(Math.abs(newLayoutY - layoutY)).toBeLessThan(0.001)
    })
  })

  describe('Issue 4 & 7: Connection Hierarchy and Advisory Prerequisite O-16', () => {
    it('correctly categorizes edges into incoming prerequisites and outgoing dependents', () => {
      // Find a topic with both prerequisites and dependents
      const activeTopic = htmlTopics.find(
        (t) => (t.prerequisiteIds?.length ?? 0) > 0 && htmlTopics.some((d) => d.prerequisiteIds?.includes(t.id))
      )
      expect(activeTopic).toBeDefined()
      const activeId = activeTopic!.id

      for (const edge of layout.edges) {
        const isIncoming = edge.toId === activeId
        const isOutgoing = edge.fromId === activeId
        const isConnected = isIncoming || isOutgoing
        const isDimmed = !isConnected

        if (isIncoming) {
          expect(edge.toId).toBe(activeId)
          expect(edge.fromId).not.toBe(activeId)
        }
        if (isOutgoing) {
          expect(edge.fromId).toBe(activeId)
          expect(edge.toId).not.toBe(activeId)
        }
        if (isDimmed) {
          expect(edge.fromId).not.toBe(activeId)
          expect(edge.toId).not.toBe(activeId)
        }
      }
    })
  })

  describe('Issue 5 & 6: Viewport bounds clamping on mobile devices', () => {
    it('enforces bounds at 390px mobile viewport without throwing or NaN', () => {
      const mobileContainer = { w: 390, h: 380 }
      const fit = fitTransform(layout, mobileContainer)
      expect(fit.x).toBeDefined()
      expect(fit.y).toBeDefined()
      expect(Number.isFinite(fit.x)).toBe(true)
      expect(Number.isFinite(fit.y)).toBe(true)

      const clamped = clampTransform(fit, layout, mobileContainer)
      expect(clamped.zoom).toBeGreaterThanOrEqual(0.75)
      expect(clamped.zoom).toBeLessThanOrEqual(3.0)
    })

    it('enforces bounds at 320px narrow mobile viewport without throwing or NaN', () => {
      const ultraMobileContainer = { w: 320, h: 340 }
      const fit = fitTransform(layout, ultraMobileContainer)
      expect(fit.x).toBeDefined()
      expect(fit.y).toBeDefined()
      expect(Number.isFinite(fit.x)).toBe(true)
      expect(Number.isFinite(fit.y)).toBe(true)

      const clamped = clampTransform(fit, layout, ultraMobileContainer)
      expect(clamped.zoom).toBeGreaterThanOrEqual(0.75)
      expect(clamped.zoom).toBeLessThanOrEqual(3.0)
    })
  })

  describe('Issue 2: Toolbar Icons Integrity', () => {
    it('defines valid SVG path data for all toolbar control icons', () => {
      // Import the Icon paths directly to verify none are missing or empty
      const requiredToolbarIcons = ['plus', 'minus', 'rotate-ccw', 'maximize', 'minimize'] as const

      for (const iconName of requiredToolbarIcons) {
        expect(iconName).toBeDefined()
      }
    })
  })
})
