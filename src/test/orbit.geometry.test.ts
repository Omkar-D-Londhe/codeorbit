import { topics } from '../data/curriculum'
import {
  chooseOrbitMode, computeOrbitLayout, edgePath, hasLabelCollisions, minNodeDistance, MIN_NODE_SPACING, NODE_SIZE,
} from '../lib/orbitGeometry'

const ids = topics.map((t) => t.id)

describe('Learning Orbit geometry', () => {
  it('forms an UPPER arch (∩): centre is highest, ends are lowest, never a valley', () => {
    const l = computeOrbitLayout(ids, 1200)
    const ys = l.nodes.map((n) => n.y)
    const topY = Math.min(...ys)
    const mid = l.nodes[Math.floor(l.nodes.length / 2)]
    // The highest node (smallest y) is in the middle third.
    const topIdx = ys.indexOf(topY)
    expect(topIdx).toBeGreaterThanOrEqual(Math.floor(ids.length / 3))
    expect(topIdx).toBeLessThanOrEqual(Math.ceil((2 * ids.length) / 3))
    // End nodes sit clearly lower than the centre.
    expect(l.nodes[0].y).toBeGreaterThan(mid.y + 40)
    expect(l.nodes[l.nodes.length - 1].y).toBeGreaterThan(mid.y + 40)
  })

  it('has y values that fall monotonically from the apex toward each end (no valley)', () => {
    const l = computeOrbitLayout(ids, 1280)
    const apex = l.nodes.map((n) => n.y).indexOf(Math.min(...l.nodes.map((n) => n.y)))
    for (let i = apex; i < l.nodes.length - 1; i++) expect(l.nodes[i + 1].y).toBeGreaterThanOrEqual(l.nodes[i].y)
    for (let i = apex; i > 0; i--) expect(l.nodes[i - 1].y).toBeGreaterThanOrEqual(l.nodes[i].y)
  })

  it('x increases strictly with curriculum order (canonical order preserved)', () => {
    const l = computeOrbitLayout(ids, 1100)
    for (let i = 1; i < l.nodes.length; i++) expect(l.nodes[i].x).toBeGreaterThan(l.nodes[i - 1].x)
    expect(l.nodes.map((n) => n.id)).toEqual(ids)
  })

  it('is symmetric about the centre line', () => {
    const l = computeOrbitLayout(ids, 1200)
    const n = l.nodes.length
    for (let i = 0; i < n; i++) {
      expect(l.nodes[i].x + l.nodes[n - 1 - i].x).toBeCloseTo(l.cx * 2, 0)
      expect(l.nodes[i].y).toBeCloseTo(l.nodes[n - 1 - i].y, 0)
    }
  })

  it('is deterministic: identical inputs give identical positions (stable layout)', () => {
    expect(computeOrbitLayout(ids, 1000)).toEqual(computeOrbitLayout(ids, 1000))
  })

  it('does not depend on anything but ids and width (selection cannot move nodes)', () => {
    const a = computeOrbitLayout(ids, 900)
    const b = computeOrbitLayout([...ids], 900)
    expect(a.nodes).toEqual(b.nodes)
  })

  it('keeps every node (including first and last) fully inside the bounds at many widths', () => {
    for (const w of [360, 480, 640, 768, 900, 1024, 1280, 1440, 1920]) {
      const l = computeOrbitLayout(ids, w)
      l.nodes.forEach((n) => {
        expect(n.x - NODE_SIZE / 2).toBeGreaterThanOrEqual(0)
        expect(n.x + NODE_SIZE / 2).toBeLessThanOrEqual(l.width)
        expect(n.y - NODE_SIZE / 2).toBeGreaterThanOrEqual(0)
        expect(n.y + NODE_SIZE / 2).toBeLessThanOrEqual(l.height)
      })
    }
  })

  it('spaces nodes evenly along the arc length', () => {
    const l = computeOrbitLayout(ids, 1280)
    const d = l.nodes.slice(1).map((n, i) => Math.hypot(n.x - l.nodes[i].x, n.y - l.nodes[i].y))
    // Chord lengths of equal-arc-length steps are near equal.
    expect(Math.max(...d) / Math.min(...d)).toBeLessThan(1.1)
  })

  it('shows the full arch with all labels on wide desktop and has no collisions', () => {
    for (const w of [1280, 1440]) {
      expect(chooseOrbitMode(ids, w)).toBe('arch')
      const l = computeOrbitLayout(ids, w)
      expect(minNodeDistance(l)).toBeGreaterThanOrEqual(MIN_NODE_SPACING)
      expect(hasLabelCollisions(l)).toBe(false)
    }
  })

  it('falls back to the carousel on phone widths where the arch would crowd touch targets', () => {
    for (const w of [360, 390, 430]) {
      const l = computeOrbitLayout(ids, w)
      expect(minNodeDistance(l)).toBeLessThan(MIN_NODE_SPACING)
      expect(chooseOrbitMode(ids, w)).toBe('carousel')
    }
  })

  it('never returns "arch" if labels collide, and keeps touch spacing in any arch mode', () => {
    for (let w = 320; w <= 1600; w += 16) {
      const mode = chooseOrbitMode(ids, w)
      const l = computeOrbitLayout(ids, w)
      if (mode !== 'carousel') expect(minNodeDistance(l)).toBeGreaterThanOrEqual(MIN_NODE_SPACING)
      if (mode === 'arch') expect(hasLabelCollisions(l)).toBe(false)
    }
  })

  it('mode changes monotonically with width (no flapping between modes)', () => {
    const rank = { carousel: 0, 'arch-compact': 1, arch: 2 } as const
    let prev = -1
    for (let w = 320; w <= 1600; w += 8) {
      const r = rank[chooseOrbitMode(ids, w)]
      expect(r).toBeGreaterThanOrEqual(prev)
      prev = r
    }
  })

  it('builds connector paths only for existing nodes and keeps them inside the arch interior', () => {
    const l = computeOrbitLayout(ids, 1200)
    expect(edgePath(l, 'html-structure', 'elements-attributes')).toMatch(/^M [\d.]+ [\d.]+ Q [\d.]+ [\d.]+ [\d.]+ [\d.]+$/)
    expect(edgePath(l, 'html-structure', 'nope')).toBeNull()
  })

  it('handles a single node and an empty list without throwing', () => {
    expect(computeOrbitLayout(['a'], 800).nodes).toHaveLength(1)
    expect(computeOrbitLayout([], 800).nodes).toHaveLength(0)
    expect(chooseOrbitMode(['a'], 300)).toBe('arch')
  })

  it('produces an SVG arc path that opens upward (sweep flag 1 from left to right)', () => {
    const l = computeOrbitLayout(ids, 1000)
    expect(l.arcPath).toMatch(/^M [\d.]+ [\d.]+ A [\d.]+ [\d.]+ 0 0 1 [\d.]+ [\d.]+$/)
  })
})
