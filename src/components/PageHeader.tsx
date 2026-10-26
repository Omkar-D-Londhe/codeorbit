import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { MiniConstellation } from '../core/orbit/constellation/MiniConstellation'

export interface Crumb { label: string; to?: string }

export function Breadcrumbs({
  items,
  miniConstellation,
}: {
  items: Crumb[]
  miniConstellation?: { technologyId: string; topicId: string }
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
      <nav aria-label="Breadcrumb" className="crumbs" style={{ flex: 1 }}>
        <ol>
          {items.map((c, i) => (
            <li key={i}>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              {i < items.length - 1 && <Icon name="chevron-right" size={14} />}
            </li>
          ))}
        </ol>
      </nav>
      {miniConstellation && (
        <div className="breadcrumb-mini-orbit">
          <MiniConstellation
            technologyId={miniConstellation.technologyId}
            topicId={miniConstellation.topicId}
          />
        </div>
      )}
    </div>
  )
}

export function PageHeader({
  title,
  lede,
  crumbs,
  actions,
  miniConstellation,
}: {
  title: string
  lede?: ReactNode
  crumbs?: Crumb[]
  actions?: ReactNode
  miniConstellation?: { technologyId: string; topicId: string }
}) {
  return (
    <header className="page-header">
      {crumbs && <Breadcrumbs items={crumbs} miniConstellation={miniConstellation} />}
      <div className="page-header__row">
        <div>
          <h1 className="page-title">{title}</h1>
          {lede && <p className="page-lede">{lede}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </header>
  )
}
