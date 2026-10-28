import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../state/AppState'
import { useToast } from '../../components/Toast'
import { Icon } from '../../components/Icon'
import { EmptyState } from '../../components/EmptyState'
import {
  dueCards,
  nextDueDate,
  schedule,
  toDayKey,
  type Grade,
  type ReviewCard,
} from './spaced'
import { getTopic } from '../../data/curriculum'
import { lessonPath } from '../../lib/routes'

export function DueReview() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0)

  const today = useMemo(() => toDayKey(), [])
  const due = useMemo(() => dueCards(state.review ?? {}, today), [state.review, today])
  const nextDate = useMemo(() => nextDueDate(state.review ?? {}, today), [state.review, today])

  const currentCard: ReviewCard | undefined = due[0]
  const totalSessionCards = due.length + sessionCompletedCount
  const currentCardNumber = sessionCompletedCount + 1

  const handleGrade = useCallback(
    (grade: Grade) => {
      if (!currentCard) return
      dispatch({
        type: 'ANSWER_REVIEW_CARD',
        cardId: currentCard.id,
        grade,
        now: Date.now(),
      })
      setShowAnswer(false)
      setSessionCompletedCount((c) => c + 1)
      toast.show(`Card reviewed (${grade})`, 'success')
    },
    [currentCard, dispatch, toast]
  )

  // Keyboard navigation: 1-4 when answer is shown; Space/Enter to reveal answer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or textarea
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return
      }

      if (!showAnswer) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          setShowAnswer(true)
        }
      } else {
        if (e.key === '1') {
          e.preventDefault()
          handleGrade('again')
        } else if (e.key === '2') {
          e.preventDefault()
          handleGrade('hard')
        } else if (e.key === '3') {
          e.preventDefault()
          handleGrade('good')
        } else if (e.key === '4') {
          e.preventDefault()
          handleGrade('easy')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAnswer, handleGrade])

  if (!currentCard) {
    return (
      <EmptyState
        variant="review"
        icon="check"
        title="Nothing due today"
        action={
          <Link className="btn btn--secondary" to="/explore">
            Explore curriculum
          </Link>
        }
      >
        {sessionCompletedCount > 0
          ? `Great session! You completed ${sessionCompletedCount} review ${sessionCompletedCount === 1 ? 'card' : 'cards'}. ${nextDate ? `Next card due: ${nextDate}.` : 'No upcoming cards scheduled.'}`
          : `You are completely caught up with spaced repetition! ${nextDate ? `Next card due: ${nextDate}.` : 'Cards will appear here as you practice and study.'}`}
      </EmptyState>
    )
  }

  // Pre-calculate projected intervals for grade buttons
  const againInterval = schedule(currentCard, 'again', today).intervalDays
  const hardInterval = schedule(currentCard, 'hard', today).intervalDays
  const goodInterval = schedule(currentCard, 'good', today).intervalDays
  const easyInterval = schedule(currentCard, 'easy', today).intervalDays

  const topic = currentCard.topicId ? getTopic(currentCard.topicId) : undefined

  return (
    <div className="card due-review-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Progress header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--s-4)',
        }}
      >
        <span className="eyebrow" style={{ margin: 0 }}>
          Spaced Repetition Review
        </span>
        <span className="small muted">
          Card {currentCardNumber} of {totalSessionCards}
        </span>
      </div>

      {/* Card Content */}
      <div style={{ marginBottom: 'var(--s-5)' }}>
        {topic && (
          <div style={{ marginBottom: 'var(--s-2)' }}>
            <Link to={lessonPath(topic.id)} className="chip chip--sm">
              <Icon name="book" size={14} />
              <span>{topic.title}</span>
            </Link>
          </div>
        )}
        <h3 className="card__title" style={{ fontSize: '18px', lineHeight: 1.5 }}>
          {currentCard.prompt || 'Review Card'}
        </h3>
      </div>

      {/* Answer Section */}
      {showAnswer ? (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 'var(--s-4)',
            marginBottom: 'var(--s-6)',
            animation: 'fadeIn 160ms ease-out',
          }}
        >
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>
            Answer &amp; Explanation
          </div>
          <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text)' }}>
            {currentCard.answer}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', margin: 'var(--s-6) 0' }}>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => setShowAnswer(true)}
            autoFocus
          >
            Show answer
          </button>
          <p className="muted small" style={{ marginTop: 'var(--s-2)' }}>
            Press Space or Enter to reveal
          </p>
        </div>
      )}

      {/* Grade Action Controls (visible only when answer is revealed) */}
      {showAnswer && (
        <div>
          <p className="muted small" style={{ textAlign: 'center', marginBottom: 'var(--s-3)' }}>
            How well did you know this? (Shortcut: keys 1–4)
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 'var(--s-2)',
            }}
          >
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => handleGrade('again')}
              title="Failed card. Resets interval."
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>1 · Again</span>
                <span className="small muted">{againInterval}d</span>
              </div>
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => handleGrade('hard')}
              title="Remembered with effort."
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>2 · Hard</span>
                <span className="small muted">{hardInterval}d</span>
              </div>
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => handleGrade('good')}
              title="Standard recall."
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>3 · Good</span>
                <span className="small muted">{goodInterval}d</span>
              </div>
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => handleGrade('easy')}
              title="Effortless recall."
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>4 · Easy</span>
                <span className="small muted">{easyInterval}d</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
