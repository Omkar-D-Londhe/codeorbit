import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export interface Crumb { label: string; to?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        {items.map((c, i) => (
          <li key={i}>
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            {i < items.length - 1 && <Icon name="chevron-right" size={14} />}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageHeader({ title, lede, crumbs, actions }: { title: string; lede?: ReactNode; crumbs?: Crumb[]; actions?: ReactNode }) {
  return (
    <header className="page-header">
      {crumbs && <Breadcrumbs items={crumbs} />}
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
