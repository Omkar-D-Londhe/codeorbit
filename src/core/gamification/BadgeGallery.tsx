import { evaluateAchievements } from './achievements'
import { useApp } from '../../state/AppState'
import { Icon } from '../../components/Icon'

export function BadgeGallery() {
  const { state } = useApp()
  if (state.settings.gamificationEnabled === false) return null

  const badges = evaluateAchievements(state)
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <section className="badge-gallery-section" aria-labelledby="badges-heading">
      <div className="badge-gallery__header">
        <div>
          <h2 id="badges-heading" className="section-title">
            Achievements
          </h2>
          <p className="muted small">
            {earnedCount} of {badges.length} badges unlocked
          </p>
        </div>
      </div>

      <div className="badge-grid" role="list">
        {badges.map((b) => {
          const dateStr = b.firstSeenAt
            ? new Date(b.firstSeenAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'Earned (date not recorded)'

          return (
            <div
              key={b.id}
              role="listitem"
              className={`card badge-card ${b.earned ? 'badge-card--earned' : 'badge-card--unearned'}`}
            >
              <div className="badge-card__top">
                <span className={`badge-card__icon ${b.earned ? 'badge-card__icon--earned' : ''}`}>
                  <Icon name="star" size={20} />
                </span>
                <span className={`badge-status-pill ${b.earned ? 'is-earned' : 'is-unearned'}`}>
                  {b.earned ? 'Earned' : 'Not yet'}
                </span>
              </div>

              <h3 className="badge-card__title">{b.title}</h3>
              <p className="badge-card__rule">{b.rule}</p>

              <div className="badge-card__footer">
                {b.earned ? (
                  <span className="badge-card__date muted small">{dateStr}</span>
                ) : b.progress ? (
                  <span className="badge-card__progress muted small">
                    Progress: {b.progress.current} of {b.progress.total}
                  </span>
                ) : (
                  <span className="badge-card__progress muted small">Incomplete</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
