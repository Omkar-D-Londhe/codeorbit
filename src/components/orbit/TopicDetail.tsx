import { Link } from 'react-router-dom'
import type { Topic } from '../../data/types'
import { challengesForTopic } from '../../data/challenges'
import { dependentsOf, getGroup, getTopic, topicsFor } from '../../data/curriculum'
import type { TopicProgress } from '../../lib/progress'
import { STATUS_ICON, STATUS_LABEL } from '../../lib/status'
import { Icon } from '../Icon'

interface Props {
  topic: Topic
  progress: TopicProgress
  bookmarked: boolean
  hasNote: boolean
  onSelect: (id: string) => void
}

export function TopicDetail({ topic, progress, bookmarked, hasNote, onSelect }: Props) {
  const trackTopics = topicsFor(topic.technologyId)
  const idx = trackTopics.findIndex((t) => t.id === topic.id)
  const prereqs = topic.prerequisiteIds.map((id) => getTopic(id)).filter((t): t is Topic => !!t)
  const leadsTo = dependentsOf(topic.id)
  const challenge = challengesForTopic(topic.id)[0]
  const parts = [
    { label: 'Lesson', done: progress.lessonDone },
    { label: 'Quiz passed', done: progress.quizPassed },
    ...(challenge ? [{ label: 'Practice', done: progress.practiceDone }] : []),
  ]
  return (
    <section className="detail" aria-labelledby="detail-title" aria-live="polite">
      <div className="detail__main">
        <p className="eyebrow">
          {getGroup(topic.groupId)?.title} · Topic {idx + 1} of {trackTopics.length}
        </p>
        <h2 id="detail-title" className="detail__title">{topic.title}</h2>
        <p className="detail__desc">{topic.description}</p>
        <div className="detail__chips">
          <span className={`status-chip status-chip--${progress.status}`}>
            <Icon name={STATUS_ICON[progress.status]} size={14} />
            {STATUS_LABEL[progress.status]}
          </span>
          {bookmarked && <span className="status-chip"><Icon name="bookmark" size={14} />Bookmarked</span>}
          {hasNote && <span className="status-chip"><Icon name="pencil" size={14} />Has a note</span>}
        </div>
        <dl className="detail__rel">
          <div>
            <dt>Builds on</dt>
            <dd>
              {prereqs.length === 0 ? <span className="muted">Nothing — a starting point.</span> : (
                <ul className="inline-list">
                  {prereqs.map((p) => <li key={p.id}><button type="button" className="link-btn" onClick={() => onSelect(p.id)}>{p.title}</button></li>)}
                </ul>
              )}
            </dd>
          </div>
          <div>
            <dt>Leads to</dt>
            <dd>
              {leadsTo.length === 0 ? <span className="muted">No later topic depends on this one.</span> : (
                <ul className="inline-list">
                  {leadsTo.map((p) => <li key={p.id}><button type="button" className="link-btn" onClick={() => onSelect(p.id)}>{p.title}</button></li>)}
                </ul>
              )}
            </dd>
          </div>
        </dl>
      </div>
      <div className="detail__side">
        <h3 className="detail__sub">Your steps</h3>
        <ul className="steps" aria-label="Steps for this topic">
          {parts.map((p) => (
            <li key={p.label} className={p.done ? 'is-done' : ''}>
              <Icon name={p.done ? 'check' : 'circle'} size={16} />
              <span>{p.label}</span>
              <span className="muted">{p.done ? 'Done' : 'Not done'}</span>
            </li>
          ))}
        </ul>
        <div className="detail__actions">
          <Link className="btn btn--primary" to={`/lesson/${topic.id}`}><Icon name="book" size={18} />Learn</Link>
          <Link className="btn btn--secondary" to={`/quiz/${topic.id}`}><Icon name="quiz" size={18} />Quick quiz</Link>
          {challenge && <Link className="btn btn--secondary" to={`/practice/${challenge.id}`}><Icon name="code" size={18} />Practice</Link>}
        </div>
      </div>
    </section>
  )
}
