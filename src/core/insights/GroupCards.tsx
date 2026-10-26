import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { topicProgress } from '../../lib/progress'
import { lessonPath } from '../../lib/routes'
import type { TrackModule } from '../content/types'
import type { CodeOrbitState } from '../../state/types'
import type { Topic } from '../../data/types'

export interface GroupCardsProps {
  track: TrackModule
  state: CodeOrbitState
}

const isTopicDone = (state: CodeOrbitState, t: Topic): boolean => {
  const s = topicProgress(state, t).status
  return s === 'completed' || s === 'mastered'
}

/**
 * 3.3 Topic Group Completion Cards: One card per TopicGroup showing
 * completed / total topics and a direct deep-link.
 */
export function GroupCards({ track, state }: GroupCardsProps) {
  const groups = track.groups || []

  if (groups.length === 0) {
    return null
  }

  return (
    <div className="group-cards-section">
      <div className="group-cards-header">
        <h3 className="group-cards-title">Topic groups</h3>
        <p className="muted small">Progress grouped by learning modules</p>
      </div>

      <div className="group-cards-grid">
        {groups.map((group) => {
          const groupTopics = track.topics.filter((t) => t.groupId === group.id)
          const total = groupTopics.length
          const completed = groupTopics.filter((t) => isTopicDone(state, t)).length
          const firstIncomplete = groupTopics.find((t) => !isTopicDone(state, t))
          const targetTopic = firstIncomplete || groupTopics[0]
          const targetPath = targetTopic ? lessonPath(targetTopic.id) : '#'
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0

          return (
            <Card
              key={group.id}
              className="group-card card--quiet"
              eyebrow={`${percent}% complete`}
              title={group.title}
            >
              <div className="group-card-body">
                <ProgressBar
                  value={completed}
                  max={total > 0 ? total : 1}
                  label={`${group.title}: ${completed} of ${total} topics complete`}
                  className="group-card-progress"
                />
                <p className="muted small group-card-count">
                  {completed} of {total} {total === 1 ? 'topic' : 'topics'} complete
                </p>
                <div className="group-card-action">
                  <Link
                    to={targetPath}
                    className="btn btn--secondary btn--sm"
                    aria-label={`Open ${group.title} topics (${completed} of ${total} complete)`}
                  >
                    {completed === total ? 'Review group' : completed > 0 ? 'Continue' : 'Start group'}
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
