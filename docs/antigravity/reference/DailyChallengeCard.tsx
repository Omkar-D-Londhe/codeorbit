import { Link } from 'react-router-dom'
import { getTopic } from '../data/curriculum'
import { dailyChallengeFor } from '../lib/daily'
import { practicePath } from '../lib/routes'
import { dayKey } from '../lib/streak'
import { useApp } from '../state/AppState'
import { Icon } from './Icon'

/** Today's challenge, chosen by a stable rule from this device's local date. */
export function DailyChallengeCard() {
  const { state } = useApp()
  const today = dayKey(Date.now())
  const challenge = dailyChallengeFor(today)
  const done = state.dailyDone.includes(today)
  const topic = getTopic(challenge.topicId)
  return (
    <section className="card card--quiet daily" aria-labelledby="daily-h">
      <p className="eyebrow">Daily challenge</p>
      <h2 id="daily-h" className="card__title">{challenge.title}</h2>
      <p className="muted small">{topic?.title} · {challenge.difficulty[0].toUpperCase() + challenge.difficulty.slice(1)}</p>
      <p className={`daily__state ${done ? 'is-done' : ''}`}>
        <Icon name={done ? 'check' : 'circle'} size={16} />
        {done ? 'Passed today' : 'Not passed today'}
      </p>
      <Link className="btn btn--secondary" to={practicePath(challenge.id)}>{done ? 'Practise again' : 'Start challenge'}</Link>
      <p className="muted small">Picked from this device’s date. It is not shared with other people or devices.</p>
    </section>
  )
}
