import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { ErrorEntry } from '../../state/types'
import { getTopic } from '../../data/curriculum'
import { lessonPath, practicePath, quizPath } from '../../lib/routes'
import { Icon } from '../../components/Icon'

export interface FlashcardsProps {
  entries: ErrorEntry[]
  onStatusChange: (id: string, status: 'open' | 'understood') => void
  onDelete?: (id: string) => void
}

export function Flashcards({ entries, onStatusChange, onDelete }: FlashcardsProps) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Clamp index if entries change
  useEffect(() => {
    if (index >= entries.length && entries.length > 0) {
      setIndex(entries.length - 1)
    }
  }, [entries.length, index])

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false)
    if (entries.length > 0 && entries[index]) {
      const e = entries[index]
      setAnnouncement(`Card ${index + 1} of ${entries.length}: ${e.title}`)
    }
  }, [index, entries])

  const current = entries[index]

  const handleNext = useCallback(() => {
    if (entries.length === 0) return
    setIndex((prev) => (prev + 1) % entries.length)
  }, [entries.length])

  const handlePrev = useCallback(() => {
    if (entries.length === 0) return
    setIndex((prev) => (prev - 1 + entries.length) % entries.length)
  }, [entries.length])

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const next = !prev
      setAnnouncement(next ? 'Showing card details and code' : 'Showing card question')
      return next
    })
  }, [])

  const handleMarkReviewAgain = useCallback(() => {
    if (!current) return
    onStatusChange(current.id, 'open')
    setAnnouncement(`Marked as review again: ${current.title}`)
    handleNext()
  }, [current, onStatusChange, handleNext])

  const handleMarkUnderstood = useCallback(() => {
    if (!current) return
    onStatusChange(current.id, 'understood')
    setAnnouncement(`Marked as understood: ${current.title}`)
    handleNext()
  }, [current, onStatusChange, handleNext])

  // Global / Container keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input or textarea
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        handleFlip()
      } else if (e.key === '1') {
        e.preventDefault()
        handleMarkReviewAgain()
      } else if (e.key === '2') {
        e.preventDefault()
        handleMarkUnderstood()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFlip, handleMarkReviewAgain, handleMarkUnderstood, handleNext, handlePrev])

  if (!current || entries.length === 0) {
    return null
  }

  const topic = getTopic(current.topicId)

  return (
    <div
      ref={containerRef}
      className="flashcards-container"
      tabIndex={0}
      aria-label="Error Notebook flashcards. Use Space to flip, 1 to mark review again, 2 to mark understood, Arrow keys to navigate."
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '680px',
        margin: '0 auto',
        outline: 'none',
      }}
    >
      {/* Screen reader live region */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Header with counter and keyboard hints */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text, #f0eff7)' }}>
          Card {index + 1} of {entries.length}
        </span>
        <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--muted, #8b949e)' }}>
          <span><kbd style={{ padding: '2px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>Space</kbd> Flip</span>
          <span>•</span>
          <span><kbd style={{ padding: '2px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>1</kbd> Review again</span>
          <span>•</span>
          <span><kbd style={{ padding: '2px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>2</kbd> Understood</span>
        </div>
      </div>

      {/* Single Large Interactive Card */}
      <div
        className={`card flashcard ${isFlipped ? 'flashcard--flipped' : ''}`}
        onClick={handleFlip}
        role="region"
        aria-label={`Flashcard: ${current.title} (${isFlipped ? 'Back' : 'Front'})`}
        style={{
          width: '100%',
          minHeight: '300px',
          padding: '24px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'var(--surface, #1e1e2e)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
          borderRadius: 'var(--r-lg, 12px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          transition: 'transform 0.2s ease, border-color 0.2s ease',
          userSelect: 'none',
        }}
      >
        {/* Top metadata */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span
              className={`status-chip ${current.status === 'understood' ? 'status-chip--completed' : 'status-chip--in-progress'}`}
              style={{ fontSize: '12px' }}
            >
              <Icon name={current.status === 'understood' ? 'check' : 'dot'} size={14} />
              {current.status === 'understood' ? 'Understood' : 'To review'}
            </span>
            <span className="small muted">
              {current.source === 'quiz' ? 'Quiz Question' : 'Practice Challenge'} · {topic?.title || current.topicId}
            </span>
          </div>

          {/* Front Content */}
          {!isFlipped ? (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent, #9a8bff)', marginBottom: '8px', fontWeight: 600 }}>
                Question / Prompt
              </div>
              <h3 style={{ fontSize: '1.35rem', lineHeight: 1.4, margin: '0 0 16px', color: 'var(--text, #f0eff7)' }}>
                {current.title}
              </h3>
              <p className="muted small" style={{ marginTop: '24px' }}>
                💡 Click anywhere or press <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>Space</kbd> to see explanation and code.
              </p>
            </div>
          ) : (
            /* Back Content */
            <div style={{ marginTop: '10px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent, #9a8bff)', marginBottom: '8px', fontWeight: 600 }}>
                Explanation & Solution Hint
              </div>
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 10px', color: 'var(--text, #f0eff7)' }}>
                {current.title}
              </h4>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text, #f0eff7)', marginBottom: '14px' }}>
                {current.detail}
              </p>

              {current.code && (
                <div style={{ marginBottom: '14px' }}>
                  <span className="small muted" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Your saved code:
                  </span>
                  <pre
                    className="entry__code"
                    tabIndex={0}
                    style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    <code>{current.code}</code>
                  </pre>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                <Link className="btn btn--secondary btn--sm" to={lessonPath(current.topicId)}>
                  Review lesson
                </Link>
                <Link
                  className="btn btn--secondary btn--sm"
                  to={current.source === 'challenge' ? practicePath(current.refId) : quizPath(current.topicId)}
                >
                  {current.source === 'challenge' ? 'Try challenge again' : 'Retake quiz'}
                </Link>
                {onDelete && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onDelete(current.id)}
                    aria-label={`Delete error entry: ${current.title}`}
                  >
                    <Icon name="trash" size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom card footer */}
        <div
          style={{
            borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
            paddingTop: '14px',
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn--sm ${current.status === 'open' ? 'btn--primary' : 'btn--secondary'}`}
              onClick={handleMarkReviewAgain}
              aria-label="Review again (Key 1)"
            >
              <Icon name="dot" size={14} />
              Review again (1)
            </button>
            <button
              type="button"
              className={`btn btn--sm ${current.status === 'understood' ? 'btn--primary' : 'btn--secondary'}`}
              onClick={handleMarkUnderstood}
              aria-label="Mark understood (Key 2)"
            >
              <Icon name="check" size={14} />
              Understood (2)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleFlip}
              aria-label={isFlipped ? 'Flip to question' : 'Flip to answer'}
            >
              <Icon name="repeat" size={14} />
              {isFlipped ? 'Question' : 'Answer'}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={handlePrev}
              disabled={entries.length <= 1}
              aria-label="Previous card (Left Arrow)"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={handleNext}
              disabled={entries.length <= 1}
              aria-label="Next card (Right Arrow)"
            >
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
