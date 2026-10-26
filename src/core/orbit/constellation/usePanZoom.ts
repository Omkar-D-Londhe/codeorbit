import { useEffect, useRef, useState, useCallback } from 'react'
import type { ConstellationLayout, ViewTransform } from './types'
import { clampTransform, fitTransform } from './viewport'

export interface UsePanZoomOptions {
  layout: ConstellationLayout
  containerRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  onTransformChange?: (transform: ViewTransform) => void
  disabled?: boolean
}

export function usePanZoom({
  layout,
  containerRef,
  contentRef,
  onTransformChange,
  disabled = false,
}: UsePanZoomOptions) {
  const [transform, setTransformState] = useState<ViewTransform>({ x: 0, y: 0, zoom: 1 })
  const transformRef = useRef<ViewTransform>({ x: 0, y: 0, zoom: 1 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 })
  const hasExceededThresholdRef = useRef(false)
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>())
  const initialPinchDistRef = useRef<number | null>(null)
  const initialPinchZoomRef = useRef<number>(1)
  const rafIdRef = useRef<number | null>(null)

  // Direct DOM transform application to avoid React re-renders on pan/zoom
  const applyTransform = useCallback((t: ViewTransform) => {
    transformRef.current = t
    if (contentRef.current) {
      contentRef.current.style.transform = `translate3d(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px, 0) scale(${t.zoom.toFixed(3)})`
    }
    if (onTransformChange) {
      onTransformChange(t)
    }
  }, [contentRef, onTransformChange])

  const scheduleApply = useCallback((t: ViewTransform) => {
    transformRef.current = t
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = requestAnimationFrame(() => {
      applyTransform(t)
    })
  }, [applyTransform])

  const resetToFit = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const fit = fitTransform(layout, { w: rect.width, h: rect.height })
    transformRef.current = fit
    applyTransform(fit)
    setTransformState(fit)
  }, [containerRef, layout, applyTransform])

  const zoomBy = useCallback((factor: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const current = transformRef.current
    const targetZoom = current.zoom * factor
    // Zoom centered on container
    const cx = rect.width / 2
    const cy = rect.height / 2
    const ratio = targetZoom / current.zoom
    const newX = cx - (cx - current.x) * ratio
    const newY = cy - (cy - current.y) * ratio
    const clamped = clampTransform(
      { x: newX, y: newY, zoom: targetZoom },
      layout,
      { w: rect.width, h: rect.height }
    )
    applyTransform(clamped)
    setTransformState(clamped)
  }, [containerRef, layout, applyTransform])

  const panBy = useCallback((dx: number, dy: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const current = transformRef.current
    const clamped = clampTransform(
      { x: current.x + dx, y: current.y + dy, zoom: current.zoom },
      layout,
      { w: rect.width, h: rect.height }
    )
    applyTransform(clamped)
    setTransformState(clamped)
  }, [containerRef, layout, applyTransform])

  // Initial fit on mount / container resize
  useEffect(() => {
    if (disabled || !containerRef.current) return

    const el = containerRef.current
    const updateFit = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        const fit = fitTransform(layout, { w: rect.width, h: rect.height })
        transformRef.current = fit
        applyTransform(fit)
        setTransformState(fit)
      }
    }

    updateFit()

    const observer = new ResizeObserver(() => {
      updateFit()
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [disabled, containerRef, layout, applyTransform])

  // Pointer & Touch handlers
  useEffect(() => {
    const el = containerRef.current
    if (disabled || !el) return

    const onPointerDown = (e: PointerEvent) => {
      // Ignore clicks on interactive buttons/stars
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a')) {
        return
      }

      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (activePointersRef.current.size === 1) {
        isDraggingRef.current = true
        hasExceededThresholdRef.current = false
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          initialX: transformRef.current.x,
          initialY: transformRef.current.y,
        }
        if (typeof el.setPointerCapture === 'function') {
          try {
            el.setPointerCapture(e.pointerId)
          } catch {
            // ignore
          }
        }
        el.style.cursor = 'grabbing'
      } else if (activePointersRef.current.size === 2) {
        // Pinch start
        const pts = Array.from(activePointersRef.current.values())
        initialPinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        initialPinchZoomRef.current = transformRef.current.zoom
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!activePointersRef.current.has(e.pointerId)) return
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (activePointersRef.current.size === 2 && initialPinchDistRef.current) {
        // Handle pinch zoom
        const pts = Array.from(activePointersRef.current.values())
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        const scale = currentDist / (initialPinchDistRef.current || 1)
        const targetZoom = initialPinchZoomRef.current * scale

        const rect = el.getBoundingClientRect()
        const midX = (pts[0].x + pts[1].x) / 2 - rect.left
        const midY = (pts[0].y + pts[1].y) / 2 - rect.top
        const ratio = targetZoom / transformRef.current.zoom
        const newX = midX - (midX - transformRef.current.x) * ratio
        const newY = midY - (midY - transformRef.current.y) * ratio

        const clamped = clampTransform(
          { x: newX, y: newY, zoom: targetZoom },
          layout,
          { w: rect.width, h: rect.height }
        )
        scheduleApply(clamped)
      } else if (isDraggingRef.current && activePointersRef.current.size === 1) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y

        if (!hasExceededThresholdRef.current) {
          if (Math.hypot(dx, dy) >= 4) {
            hasExceededThresholdRef.current = true
          }
        }

        if (hasExceededThresholdRef.current) {
          const rect = el.getBoundingClientRect()
          const clamped = clampTransform(
            {
              x: dragStartRef.current.initialX + dx,
              y: dragStartRef.current.initialY + dy,
              zoom: transformRef.current.zoom,
            },
            layout,
            { w: rect.width, h: rect.height }
          )
          scheduleApply(clamped)
        }
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId)
      if (typeof el.hasPointerCapture === 'function' && el.hasPointerCapture(e.pointerId)) {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          // ignore
        }
      }

      if (activePointersRef.current.size === 0) {
        isDraggingRef.current = false
        el.style.cursor = 'grab'
        if (hasExceededThresholdRef.current) {
          setTransformState(transformRef.current)
        }
      } else if (activePointersRef.current.size === 1) {
        // Reset drag baseline after pinch
        const remaining = Array.from(activePointersRef.current.values())[0]
        dragStartRef.current = {
          x: remaining.x,
          y: remaining.y,
          initialX: transformRef.current.x,
          initialY: transformRef.current.y,
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      // 10 §7.1: Only Ctrl/Cmd+wheel or trackpad pinch zooms! Plain wheel scrolls the page!
      if (!e.ctrlKey && !e.metaKey) {
        return // Let browser scroll naturally
      }

      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15
      const targetZoom = transformRef.current.zoom * zoomFactor
      const ratio = targetZoom / transformRef.current.zoom

      const newX = mouseX - (mouseX - transformRef.current.x) * ratio
      const newY = mouseY - (mouseY - transformRef.current.y) * ratio

      const clamped = clampTransform(
        { x: newX, y: newY, zoom: targetZoom },
        layout,
        { w: rect.width, h: rect.height }
      )
      applyTransform(clamped)
      setTransformState(clamped)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          panBy(80, 0)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          panBy(-80, 0)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          panBy(0, 80)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          panBy(0, -80)
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomBy(1.25)
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomBy(1 / 1.25)
      } else if (e.key === '0') {
        e.preventDefault()
        resetToFit()
      }
    }

    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('keydown', onKeyDown)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('keydown', onKeyDown)
    }
  }, [disabled, containerRef, layout, applyTransform, scheduleApply, panBy, zoomBy, resetToFit])

  return {
    transform,
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(1 / 1.25),
    resetToFit,
    panBy,
  }
}
