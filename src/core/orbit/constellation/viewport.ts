import type { ConstellationLayout, ViewTransform, LayoutNode } from './types'

export function baseFitScale(
  layout: ConstellationLayout,
  container: { w: number; h: number },
  padding = 50
): number {
  if (container.w <= 0 || container.h <= 0) return 1
  const availW = Math.max(100, container.w - padding * 2)
  const availH = Math.max(100, container.h - padding * 2)
  return Math.min(availW / layout.width, availH / layout.height)
}

export function fitTransform(
  layout: ConstellationLayout,
  container: { w: number; h: number },
  padding = 50
): ViewTransform {
  if (container.w <= 0 || container.h <= 0) {
    return { x: 0, y: 0, zoom: 1 }
  }

  const scale = baseFitScale(layout, container, padding)
  const scaledW = layout.width * scale
  const scaledH = layout.height * scale

  const x = (container.w - scaledW) / 2
  const y = (container.h - scaledH) / 2

  return { x, y, zoom: 1 }
}

export function clampTransform(
  t: ViewTransform,
  layout: ConstellationLayout,
  container: { w: number; h: number },
  padding = 50
): ViewTransform {
  const zoom = Math.max(0.75, Math.min(3.0, t.zoom))

  if (container.w <= 0 || container.h <= 0) {
    return { x: t.x, y: t.y, zoom }
  }

  // Calculate base fit scale
  const fitScale = baseFitScale(layout, container, padding)
  const effectiveScale = fitScale * zoom

  const fieldW = layout.width * effectiveScale
  const fieldH = layout.height * effectiveScale

  // Keep at least 25% of the field visible inside the container
  const minX = -fieldW + container.w * 0.25
  const maxX = container.w * 0.75
  const minY = -fieldH + container.h * 0.25
  const maxY = container.h * 0.75

  const x = Math.max(minX, Math.min(maxX, t.x))
  const y = Math.max(minY, Math.min(maxY, t.y))

  return { x, y, zoom }
}

export function nextNodeInDirection(
  layout: ConstellationLayout,
  fromId: string,
  dir: 'left' | 'right' | 'up' | 'down'
): string | null {
  const current = layout.nodes.find((n) => n.topicId === fromId)
  if (!current) return null

  let bestNode: LayoutNode | null = null
  let bestDist = Infinity

  for (const node of layout.nodes) {
    if (node.topicId === fromId) continue
    const dx = node.x - current.x
    const dy = node.y - current.y
    const dist = Math.hypot(dx, dy)

    let inDirection = false
    switch (dir) {
      case 'right':
        // Primary cone: dx > 0 and |dy| <= dx * 1.5
        inDirection = dx > 0 && Math.abs(dy) <= dx * 1.5
        break
      case 'left':
        inDirection = dx < 0 && Math.abs(dy) <= -dx * 1.5
        break
      case 'down':
        inDirection = dy > 0 && Math.abs(dx) <= dy * 1.5
        break
      case 'up':
        inDirection = dy < 0 && Math.abs(dx) <= -dy * 1.5
        break
    }

    if (inDirection && dist < bestDist) {
      bestDist = dist
      bestNode = node
    }
  }

  // If no node in cone, fallback to wider half-plane
  if (!bestNode) {
    for (const node of layout.nodes) {
      if (node.topicId === fromId) continue
      const dx = node.x - current.x
      const dy = node.y - current.y
      const dist = Math.hypot(dx, dy)

      let inHalfPlane = false
      switch (dir) {
        case 'right':
          inHalfPlane = dx > 0
          break
        case 'left':
          inHalfPlane = dx < 0
          break
        case 'down':
          inHalfPlane = dy > 0
          break
        case 'up':
          inHalfPlane = dy < 0
          break
      }

      if (inHalfPlane && dist < bestDist) {
        bestDist = dist
        bestNode = node
      }
    }
  }

  return bestNode?.topicId ?? null
}
