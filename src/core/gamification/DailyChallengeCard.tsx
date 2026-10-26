import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTopic } from '../../data/curriculum'
import { getDailyPool, resolveDailyChallenge } from './daily'
import { practicePath } from '../../lib/routes'
import { dayKey } from './streak'
import { useApp } from '../../state/AppState'
import { Icon } from '../../components/Icon'

/**
 * Today's challenge, chosen by a stable, date-based rule from this device's local date (REF-04).
 * Always remains visible as a learning feature even when gamification is toggled off (Rule P-04).
 */
export function DailyChallengeCard() {
  const { state, dispatch } = useApp()
  const today = dayKey(Date.now())
  const pool = getDailyPool()
  const { challenge } = resolveDailyChallenge(state, today, pool)

  // Freeze assignment on first view of today's challenge
  useEffect(() => {
    if (challenge && !state.dailyAssigned?.[today]) {
      dispatch({ type: 'ASSIGN_DAILY', dayKey: today, challengeId: challenge.id })
    }
  }, [challenge, today, state.dailyAssigned, dispatch])

  const done = state.dailyDone.includes(today)
  const topic = challenge ? getTopic(challenge.topicId) : undefined

  return (
    <section className="card card--quiet daily" id="daily-challenge" aria-labelledby="daily-h">
      <p className="eyebrow">Daily challenge</p>
      {challenge ? (
        <>
          <h2 id="daily-h" className="card__title">
            {challenge.title}
          </h2>
          <p className="muted small">
            {topic?.title ? `${topic.title} · ` : ''}
            {challenge.difficulty[0].toUpperCase() + challenge.difficulty.slice(1)}
          </p>
          <div className={`daily__state ${done ? 'is-done' : ''}`}>
            <Icon name={done ? 'check' : 'circle'} size={16} />
            <span>{done ? 'Passed today' : 'Not passed today'}</span>
            {done && <span className="daily__stamp">Completed</span>}
          </div>
          <div className="daily__actions">
            <Link className="btn btn--secondary" to={practicePath(challenge.id)}>
              {done ? 'Practise again' : 'Start challenge'}
            </Link>
          </div>
          <p className="muted small">
            Picked from this device's date. It is not shared with other people or devices.
          </p>
        </>
      ) : (
        <>
          <h2 id="daily-h" className="card__title">
            Daily challenge
          </h2>
          <p className="muted">No challenges available today.</p>
        </>
      )}
    </section>
  )
}
