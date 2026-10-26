import { Card } from '../ui/Card'
import { ProgressRing } from '../ui/ProgressRing'

export interface HeroRingProps {
  completedTopics: number
  totalTopics: number
  parts: number
  partsTotal: number
  trackName: string
}

/**
 * 3.1 Hero Progress Ring: Displays a large 160 px progress ring showing
 * completed topics and steps from real state.
 * Never fabricates numbers for zero or new-learner state.
 */
export function HeroRing({
  completedTopics,
  totalTopics,
  parts,
  partsTotal,
  trackName,
}: HeroRingProps) {
  const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  return (
    <Card className="hero-ring-card" eyebrow="Track progress" title={`${trackName} overview`}>
      <div className="hero-ring-content">
        <div className="hero-ring-visual">
          <ProgressRing
            value={completedTopics}
            max={totalTopics > 0 ? totalTopics : 1}
            size={160}
            strokeWidth={12}
            className="ring--hero"
            label={`${trackName} progress: ${completedTopics} of ${totalTopics} topics complete`}
          >
            <div className="hero-ring-center">
              <span className="hero-ring-percent">{percent}%</span>
              <span className="hero-ring-center-label muted small">complete</span>
            </div>
          </ProgressRing>
        </div>
        <div className="hero-ring-meta">
          <p className="hero-ring-stat">
            <strong>{completedTopics}</strong> of <strong>{totalTopics}</strong> topics complete
          </p>
          <p className="muted small">
            {parts} of {partsTotal} learning steps done
          </p>
        </div>
      </div>
    </Card>
  )
}
