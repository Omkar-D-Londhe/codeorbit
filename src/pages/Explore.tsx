import { Link } from 'react-router-dom'
import { groups, technologies, topics } from '../data/curriculum'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { useDocumentTitle } from '../lib/hooks'
import { trackProgress } from '../lib/progress'
import { trackPath } from '../lib/routes'
import { useApp } from '../state/AppState'

export default function Explore() {
  useDocumentTitle('Explore')
  const { state } = useApp()
  const html = technologies.find((t) => t.id === 'html')!
  const tp = trackProgress(state, 'html')
  const planned = technologies.filter((t) => t.status === 'planned')
  return (
    <div className="page">
      <PageHeader title="Explore technologies" lede="HTML is the complete track today. The others are planned and are not available yet." />
      <section className="card card--feature tech-feature" aria-labelledby="html-h">
        <div className="tech-glyph tech-glyph--lg" aria-hidden="true">{html.glyph}</div>
        <div className="tech-feature__body">
          <p className="eyebrow"><span className="badge badge--available">Available</span></p>
          <h2 id="html-h" className="card__title card__title--lg">{html.name}</h2>
          <p className="muted">{html.description}</p>
          <ul className="meta-row">
            <li>{topics.length} topics</li>
            <li>{groups.length} groups</li>
            <li>{tp.completedTopics} of {tp.totalTopics} complete</li>
          </ul>
          <Link className="btn btn--primary btn--lg" to={trackPath()}>Open track<Icon name="arrow-right" size={18} /></Link>
        </div>
      </section>
      <h2 className="section-title">Coming later</h2>
      <ul className="preview-grid">
        {planned.map((t) => (
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
