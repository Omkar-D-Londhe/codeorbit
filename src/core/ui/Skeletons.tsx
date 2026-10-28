import type { CSSProperties } from 'react'

export interface RouteSkeletonProps {
  label?: string
  style?: CSSProperties
}

/**
 * RouteSkeleton
 * Accessible, lightweight route-level loading placeholder for lazy-loaded route Suspense boundaries.
 * Adheres to FC-16, FC-32, WCAG AAA and reduced-motion standards.
 */
export function RouteSkeleton({ label = 'Loading page content...', style }: RouteSkeletonProps) {
  return (
    <div
      className="page route-skeleton"
      role="status"
      aria-busy="true"
      aria-label={label}
      style={style}
    >
      <span className="sr-only">{label}</span>
      <div className="skeleton-header">
        <div className="skeleton-bar skeleton-bar--title" />
        <div className="skeleton-bar skeleton-bar--subtitle" />
      </div>

      <div className="skeleton-grid">
        <div className="skeleton-card">
          <div className="skeleton-bar skeleton-bar--heading" />
          <div className="skeleton-bar skeleton-bar--line" />
          <div className="skeleton-bar skeleton-bar--line" />
          <div className="skeleton-bar skeleton-bar--line-short" />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-bar skeleton-bar--heading" />
          <div className="skeleton-bar skeleton-bar--line" />
          <div className="skeleton-bar skeleton-bar--line" />
        </div>
      </div>
    </div>
  )
}
