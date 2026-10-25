import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { useDocumentTitle } from '../lib/hooks'
import { trackProgress } from '../lib/progress'
import { trackPath } from '../lib/routes'
import { useApp } from '../state/AppState'
import { getAvailableTracks, getTracks } from '../core/content/registry'

export default function Explore() {
  useDocumentTitle('Explore')
  const { state } = useApp()
  const availableTracks = getAvailableTracks()
  const plannedTracks = getTracks().filter((t) => t.availability === 'planned')

  if (availableTracks.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Explore technologies" lede="Choose a learning track to begin." />
        <EmptyState icon="compass" title="No learning tracks are available yet">
          Learning tracks will appear here once registered.
        </EmptyState>
      </div>
    )
  }

  const primaryTrack = availableTracks[0]
  const tp = trackProgress(state, primaryTrack.id)

  return (
    <div className="page">
      <PageHeader title="Explore technologies" lede={`${primaryTrack.name} is the complete track today. The others are planned and are not available yet.`} />
      <section className="card card--feature tech-feature" aria-labelledby={`${primaryTrack.id}-h`}>
        <div className="tech-glyph tech-glyph--lg" aria-hidden="true">{primaryTrack.glyph}</div>
        <div className="tech-feature__body">
          <p className="eyebrow"><span className="badge badge--available">Available</span></p>
          <h2 id={`${primaryTrack.id}-h`} className="card__title card__title--lg">{primaryTrack.name}</h2>
          <p className="muted">{primaryTrack.description}</p>
          <ul className="meta-row">
            <li>{primaryTrack.topics.length} topics</li>
            <li>{primaryTrack.groups.length} groups</li>
            <li>{tp.completedTopics} of {tp.totalTopics} complete</li>
          </ul>
          <Link className="btn btn--primary btn--lg" to={trackPath(primaryTrack.id)}>Open track<Icon name="arrow-right" size={18} /></Link>
        </div>
      </section>
      <h2 className="section-title">Coming later</h2>
      <ul className="preview-grid">
        {plannedTracks.map((t) => (
          <li key={t.id} className="card card--quiet preview-card" aria-label={`${t.name}: preview, not available yet`}>
            <div className="tech-glyph" aria-hidden="true">{t.glyph}</div>
            <div>
              <h3 className="card__title">{t.name} <span className="badge badge--preview">Preview</span></h3>
              <p className="muted">{t.description}</p>
              <p className="muted small">Not available yet — no lessons or checks exist for this track.</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
