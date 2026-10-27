import { useRef, useEffect, useState } from 'react'
import type { CodeOrbitState } from '../../state/types'
import { useApp } from '../../state/AppState'
import { useTrack } from '../content/useTrack'
import { trackProgress } from '../../lib/progress'
import { streakInfo, dayKey } from '../gamification/streak'
import { computeXp } from '../gamification/xp'
import { Icon } from '../../components/Icon'

export interface ShareCardStats {
  trackName: string
  userName?: string
  completedTopics: number
  totalTopics: number
  masteredTopics: number
  streakDays?: number
  level?: number
  xp?: number
}

export function buildShareCardStats(
  state: CodeOrbitState,
  track: { id: string; name: string } | null | undefined
): ShareCardStats | null {
  if (!track) return null

  const tp = trackProgress(state, track.id)
  const today = dayKey(Date.now())
  const streak = streakInfo(state.activityDays || [], today)
  const gamification = state.settings.gamificationEnabled !== false
  const xp = gamification ? computeXp(state) : null

  return {
    trackName: track.name,
    userName: state.settings.userName ? state.settings.userName.trim() : undefined,
    completedTopics: tp.completedTopics,
    totalTopics: tp.totalTopics,
    masteredTopics: tp.masteredTopics,
    streakDays: streak.current > 0 ? streak.current : undefined,
    level: xp ? xp.level : undefined,
    xp: xp ? xp.total : undefined,
  }
}

export function ShareCard() {
  const { state } = useApp()
  const track = useTrack()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const stats = buildShareCardStats(state, track)

  useEffect(() => {
    if (!stats || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, w, h)
    bgGradient.addColorStop(0, '#0d0d14')
    bgGradient.addColorStop(0.5, '#161426')
    bgGradient.addColorStop(1, '#0a0a0f')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, w, h)

    // Border
    ctx.strokeStyle = '#382bf0'
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3)

    // Inner subtle glow
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(8, 8, w - 16, h - 16)

    // Header branding
    ctx.fillStyle = '#a855f7'
    ctx.font = 'bold 13px Inter, sans-serif'
    ctx.fillText('CODEORBIT · LEARNING PROGRESS', 28, 38)

    // Track Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Fraunces, Georgia, serif'
    ctx.fillText(`${stats.trackName} Track`, 28, 74)

    // Optional Learner Name
    let currentY = 104
    if (stats.userName) {
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '15px Inter, sans-serif'
      ctx.fillText(`Learner: ${stats.userName}`, 28, currentY)
      currentY += 28
    }

    // Stats Grid
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px Inter, sans-serif'
    ctx.fillText('TOPICS COMPLETE', 28, currentY)
    ctx.fillText('TOPICS MASTERED', 220, currentY)

    currentY += 26
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 22px Inter, sans-serif'
    ctx.fillText(`${stats.completedTopics} / ${stats.totalTopics}`, 28, currentY)

    ctx.fillStyle = '#a855f7'
    ctx.fillText(`${stats.masteredTopics}`, 220, currentY)

    currentY += 42
    // Streak & XP (only if active / enabled)
    let extraX = 28
    if (stats.streakDays !== undefined) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px Inter, sans-serif'
      ctx.fillText('ACTIVE STREAK', extraX, currentY)

      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 20px Inter, sans-serif'
      ctx.fillText(`🔥 ${stats.streakDays} days`, extraX, currentY + 26)
      extraX += 190
    }

    if (stats.level !== undefined && stats.xp !== undefined) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px Inter, sans-serif'
      ctx.fillText('LEVEL & XP', extraX, currentY)

      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 20px Inter, sans-serif'
      ctx.fillText(`Lvl ${stats.level} · ${stats.xp} XP`, extraX, currentY + 26)
    }

    // Footer
    ctx.fillStyle = '#64748b'
    ctx.font = '11px Inter, sans-serif'
    ctx.fillText('Measured on this device · Generated locally by CodeOrbit', 28, h - 22)
  }, [stats])

  if (!stats) return null

  const handleDownload = () => {
    try {
      setDownloadError(null)
      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas unavailable')

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `codeorbit-progress-${stats.trackName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()
    } catch {
      setDownloadError('Unable to generate image on this device.')
    }
  }

  // Construct accessible alt text
  const altText = [
    `CodeOrbit progress card for ${stats.trackName} track.`,
    stats.userName ? `Learner: ${stats.userName}.` : '',
    `${stats.completedTopics} of ${stats.totalTopics} topics complete.`,
    stats.masteredTopics > 0 ? `${stats.masteredTopics} topics mastered.` : '',
    stats.streakDays ? `Current streak: ${stats.streakDays} days.` : '',
    stats.level !== undefined ? `Level ${stats.level} (${stats.xp} XP).` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className="card card--quiet share-card-section" aria-labelledby="share-card-title">
      <div className="share-card-header">
        <p className="eyebrow">Share progress</p>
        <h2 id="share-card-title" className="card__title">Progress Sharing Card</h2>
        <p className="muted small">
          Download a private progress card generated locally on this browser. Zero metrics are uploaded or shared.
        </p>
      </div>

      <div className="share-card-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={560}
          height={300}
          className="share-card-canvas"
          role="img"
          aria-label={altText}
        />
      </div>

      {/* Semantic Text Equivalent (Spec §13, Accessibility) */}
      <div className="share-card-text-summary sr-only" role="region" aria-label="Progress sharing card textual alternative">
        <p>{altText}</p>
        <ul>
          <li>Track: {stats.trackName}</li>
          {stats.userName && <li>Learner: {stats.userName}</li>}
          <li>Topics complete: {stats.completedTopics} of {stats.totalTopics}</li>
          <li>Topics mastered: {stats.masteredTopics}</li>
          {stats.streakDays && <li>Current streak: {stats.streakDays} days</li>}
          {stats.level !== undefined && <li>Level {stats.level} with {stats.xp} XP</li>}
        </ul>
      </div>

      <div className="btn-row share-card-actions">
        <button type="button" className="btn btn--secondary" onClick={handleDownload}>
          <Icon name="download" size={16} />
          Download Progress Card (PNG)
        </button>
        {downloadError && <span className="muted small error-text">{downloadError}</span>}
      </div>
    </section>
  )
}
