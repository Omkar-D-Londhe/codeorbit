import { computeXp } from './xp'
import { useApp } from '../../state/AppState'

export function XpBar() {
  const { state } = useApp()
  if (state.settings.gamificationEnabled === false) return null

  const xp = computeXp(state)
  const currentFloor = xp.currentLevelXp
  const nextCeil = xp.nextLevelXp
  const levelSpan = nextCeil - currentFloor
  const fraction = levelSpan > 0 ? Math.min(1, Math.max(0, xp.progressXp / levelSpan)) : 1

  return (
    <section className="card card--quiet xp-bar-card" aria-labelledby="xp-heading">
      <div className="xp-bar__top">
        <div className="xp-bar__badge-col">
          <span className="xp-bar__badge" aria-hidden="true">
            Lvl {xp.level}
          </span>
          <div>
            <h2 id="xp-heading" className="card__title xp-bar__title">
              Level {xp.level}
            </h2>
            <p className="muted small xp-bar__stats">
              Level {xp.level} · {xp.total} XP · {xp.neededXp} to next
            </p>
          </div>
        </div>
      </div>
      <div
        className="xp-bar__track"
        role="progressbar"
        aria-valuenow={xp.progressXp}
        aria-valuemin={0}
        aria-valuemax={levelSpan}
        aria-label={`Level ${xp.level} progress: ${xp.progressXp} of ${levelSpan} XP`}
      >
        <div
          className="xp-bar__fill"
          style={{ width: `${Math.round(fraction * 100)}%` }}
        />
      </div>
    </section>
  )
}
