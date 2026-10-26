import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Icon } from '../../components/Icon'
import { nextAction } from '../../lib/progress'
import { getTopic } from '../../data/curriculum'
import { lessonPath, trackPath } from '../../lib/routes'
import type { CodeOrbitState } from '../../state/types'

export interface NextStepCardProps {
  state: CodeOrbitState
  trackId: string
  trackName: string
}

/**
 * 15.3 'What to do next' Smart Card: Transparently wraps nextAction()
 * and provides clear learning-science justification based on prerequisite
 * relationships (e.g. "Because X is a prerequisite for Y").
 */
export function NextStepCard({ state, trackId, trackName }: NextStepCardProps) {
  const action = nextAction(state, trackId)
  const topic = action.topicId ? getTopic(action.topicId) : undefined

  if (action.kind === 'all-complete') {
    return (
      <Card className="next-step-card card--quiet" eyebrow="Track complete" title={`Every ${trackName} topic is complete`}>
        <div className="next-step-body">
          <p className="muted">
            You have completed all curriculum topics in this track. Revisit any topic on the Learning Orbit or review your progress.
          </p>
          <div className="btn-row">
            <Link className="btn btn--primary" to="/progress">
              <span>View progress</span>
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link className="btn btn--secondary" to={trackPath(trackId)}>
              Open Learning Orbit
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  if (!topic) {
    return null
  }

  // Derive explicit reason from prerequisites
  let explanation = action.reason
  if (topic.prerequisiteIds && topic.prerequisiteIds.length > 0) {
    const prereqTitles = topic.prerequisiteIds
      .map((p) => getTopic(p)?.title)
      .filter(Boolean) as string[]

    if (prereqTitles.length > 0) {
      explanation = `Because ${prereqTitles.join(', ')} ${prereqTitles.length > 1 ? 'are' : 'is'} complete, you are ready for ${topic.title}.`
    }
  } else if (action.kind === 'start') {
    explanation = `The foundation topic for ${trackName}. Start here to build core understanding.`
  }

  return (
    <Card className="next-step-card card--quiet" eyebrow="Recommended next" title={topic.title}>
      <div className="next-step-body">
        <p className="muted next-step-explanation">{explanation}</p>
        <div className="btn-row">
          <Link className="btn btn--secondary" to={lessonPath(topic.id)}>
            <span>Open lesson</span>
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
