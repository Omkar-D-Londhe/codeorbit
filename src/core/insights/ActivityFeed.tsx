import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { getTopic } from '../../data/curriculum'
import { challenges } from '../../data/challenges'
import { formatDateTime } from '../../lib/status'
import { lessonPath, quizPath, practicePath } from '../../lib/routes'
import type { ActivityEvent } from '../../state/types'

export interface ActivityFeedProps {
  activity: ActivityEvent[]
}

function eventSentence(ev: ActivityEvent): { text: string; link?: string } {
  const topic = ev.topicId ? getTopic(ev.topicId) : undefined
  const topicTitle = topic?.title || ev.topicId || 'Topic'

  switch (ev.type) {
    case 'lesson-complete': {
      return {
        text: `Completed lesson: ${topicTitle}`,
        link: ev.topicId ? lessonPath(ev.topicId) : undefined,
      }
    }
    case 'quiz-finish': {
      const score =
        ev.meta && typeof ev.meta.score === 'number' && typeof ev.meta.total === 'number'
          ? ` (${ev.meta.score}/${ev.meta.total})`
          : ''
      return {
        text: `Completed quiz: ${topicTitle}${score}`,
        link: ev.topicId ? quizPath(ev.topicId) : undefined,
      }
    }
    case 'challenge-check': {
      const ch = ev.refId ? challenges.find((c) => c.id === ev.refId) : undefined
      const title = ch?.title || topicTitle
      return {
        text: `Passed practice check: ${title}`,
        link: ev.refId ? practicePath(ev.refId) : ev.topicId ? practicePath(ev.topicId) : undefined,
      }
    }
    default:
      return { text: `Activity recorded on ${topicTitle}` }
  }
}

/**
 * 3.5 Recent Activity Feed: Lists up to 10 recorded activity events
 * with real timestamps and links. Completely hidden when empty.
 */
export function ActivityFeed({ activity }: ActivityFeedProps) {
  if (!activity || activity.length === 0) {
    return null
  }

  // Last 10 events, most recent first
  const recent = activity.slice(-10).reverse()

  return (
    <Card className="activity-feed-card" eyebrow="Recent activity" title="Activity feed">
      <ol className="activity-feed-list" role="list">
        {recent.map((ev) => {
          const { text, link } = eventSentence(ev)
          return (
            <li key={ev.id} className="activity-feed-item">
              <div className="activity-feed-content">
                {link ? (
                  <Link to={link} className="activity-feed-link">
                    {text}
                  </Link>
                ) : (
                  <span className="activity-feed-text">{text}</span>
                )}
                <time className="activity-feed-time muted small" dateTime={new Date(ev.at).toISOString()}>
                  {formatDateTime(ev.at)}
                </time>
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
