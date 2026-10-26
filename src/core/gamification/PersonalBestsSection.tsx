import { derivePersonalBests } from './personalBests'
import { getTopic } from '../../data/curriculum'
import { challenges } from '../../data/challenges'
import { useApp } from '../../state/AppState'

export function PersonalBestsSection() {
  const { state } = useApp()
  if (state.settings.gamificationEnabled === false) return null

  const bests = derivePersonalBests(state)
  const hasAnyBests =
    bests.longestStreak > 0 || bests.quizBests.length > 0 || bests.fastestPasses.length > 0

  return (
    <section className="card card--quiet personal-bests-section" aria-labelledby="pb-heading">
      <div className="personal-bests__header">
        <h2 id="pb-heading" className="card__title">
          Personal bests
        </h2>
        <p className="muted small">Your best on this device</p>
      </div>

      {!hasAnyBests ? (
        <p className="muted small">
          No records yet. Complete streaks, quizzes, and practice challenges to set personal records!
        </p>
      ) : (
        <div className="personal-bests__grid">
          {bests.longestStreak > 0 && (
            <div className="personal-best-item">
              <span className="muted small">Longest streak</span>
              <p className="personal-best__val">
                {bests.longestStreak} {bests.longestStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}

          {bests.quizBests.length > 0 && (
            <div className="personal-best-item">
              <span className="muted small">Best quiz score</span>
              <p className="personal-best__val">
                {bests.quizBests[0].percentage}% ({bests.quizBests[0].correct}/{bests.quizBests[0].total})
              </p>
              <span className="muted small">
                {getTopic(bests.quizBests[0].topicId)?.title ?? bests.quizBests[0].topicId}
              </span>
            </div>
          )}

          {bests.fastestPasses.length > 0 && (
            <div className="personal-best-item">
              <span className="muted small">Fastest solve</span>
              <p className="personal-best__val">
                {(bests.fastestPasses[0].durationMs / 1000).toFixed(1)}s
              </p>
              <span className="muted small">
                {challenges.find((c) => c.id === bests.fastestPasses[0].challengeId)?.title ??
                  bests.fastestPasses[0].challengeId}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
