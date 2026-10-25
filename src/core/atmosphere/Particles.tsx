import { useEffect, useRef } from 'react'
import { useMotionAllowed } from './useMotionAllowed'
import { useAppOptional } from '../../state/AppState'

export interface ParticlesProps {
  maxParticles?: number
  className?: string
  style?: React.CSSProperties
}

export const HARD_PARTICLE_CAP = 30
export const DEFAULT_PARTICLE_COUNT = 20

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  alphaSpeed: number
}

/**
 * 1.6 Ambient Particle Field (optional, opt-in)
 * Canvas-based floating ambient particles (15-30 dots).
 * Hard-capped at 30 particles.
 * Paused when off-screen (IntersectionObserver) or hidden (visibilitychange).
 * Silent fallback if canvas is not supported.
 * Pointer-events none and aria-hidden.
 */
export function Particles({
  maxParticles = DEFAULT_PARTICLE_COUNT,
  className = '',
  style,
}: ParticlesProps) {
  const motionAllowed = useMotionAllowed()
  const app = useAppOptional()
  const isHighContrast = app?.state?.settings?.contrast === 'high'

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const count = Math.min(Math.max(15, Math.floor(maxParticles)), HARD_PARTICLE_CAP)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !motionAllowed || isHighContrast) return

    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      return // Silently skip if canvas context is unsupported
    }
    if (!ctx) return

    let rafId: number | null = null
    let isVisible = true
    let isIntersecting = true

    let width = (canvas.width = canvas.offsetWidth || 300)
    let height = (canvas.height = canvas.offsetHeight || 300)

    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.5,
        alphaSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      })
    }

    const render = () => {
      if (!ctx || !isVisible || !isIntersecting) {
        rafId = null
        return
      }

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha += p.alphaSpeed

        if (p.alpha <= 0.15 || p.alpha >= 0.7) {
          p.alphaSpeed = -p.alphaSpeed
        }

        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0

        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      rafId = window.requestAnimationFrame(render)
    }

    const startAnimation = () => {
      if (rafId === null && isVisible && isIntersecting) {
        rafId = window.requestAnimationFrame(render)
      }
    }

    const stopAnimation = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    const onVisibilityChange = () => {
      isVisible = !document.hidden
      if (isVisible) startAnimation()
      else stopAnimation()
    }

    const onResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth || width
      height = canvas.height = canvas.offsetHeight || height
    }

    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0]
        isIntersecting = entry ? entry.isIntersecting : true
        if (isIntersecting) startAnimation()
        else stopAnimation()
      })
      observer.observe(canvas)
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('resize', onResize, { passive: true })
    startAnimation()

    return () => {
      stopAnimation()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('resize', onResize)
      if (observer) observer.disconnect()
    }
  }, [motionAllowed, isHighContrast, count])

  if (isHighContrast || !motionAllowed) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`atmosphere-particles ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  )
}
