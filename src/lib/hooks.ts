import { useEffect, useState, type RefObject } from 'react'

export function useMediaQuery(query: string): boolean {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false)
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Observe an element's width. Updates state only when the width changed by at least `step` px,
 * so continuous resizing does not cause continuous re-layout.
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>, step = 8): number {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = Math.round((el.clientWidth || window.innerWidth) / step) * step
      setWidth((prev) => (prev === w ? prev : w))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, step])
  return width
}

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · CodeOrbit`
  }, [title])
}
