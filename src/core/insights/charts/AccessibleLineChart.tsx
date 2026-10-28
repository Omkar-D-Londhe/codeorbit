import { useState } from 'react'

export interface LineChartPoint {
  label: string
  value: number
  date?: string
}

export interface AccessibleLineChartProps {
  title: string
  description?: string
  points: LineChartPoint[]
  emptyMessage?: string
  yUnit?: string
}

export function AccessibleLineChart({
  title,
  description,
  points,
  emptyMessage = 'Complete a lesson to see your pace',
  yUnit = 'events',
}: AccessibleLineChartProps) {
  const [activePoint, setActivePoint] = useState<LineChartPoint | null>(null)

  const hasData = points && points.length > 0 && points.some((p) => p.value > 0)
  if (!hasData) {
    return (
      <figure className="card card--quiet accessible-chart-figure">
        <figcaption className="card__title">{title}</figcaption>
        <p className="muted chart-empty-note">{emptyMessage}</p>
      </figure>
    )
  }

  const maxValue = Math.max(...points.map((p) => p.value), 1)
  const chartHeight = 180
  const paddingX = 40
  const paddingY = 24
  const usableHeight = chartHeight - paddingY * 2
  const pointGap = 24
  const svgWidth = Math.max(340, paddingX * 2 + (points.length - 1) * pointGap)

  // Compute SVG coordinates for polyline
  const coords = points.map((p, idx) => {
    const x = paddingX + idx * pointGap
    const y = chartHeight - paddingY - (p.value / maxValue) * usableHeight
    return { x, y, point: p }
  })

  const pathD = coords.reduce((acc, c, idx) => {
    return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`
  }, '')

  return (
    <figure className="card accessible-chart-figure" aria-labelledby={`chart-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="chart-header">
        <figcaption id={`chart-${title.replace(/\s+/g, '-').toLowerCase()}`} className="card__title">
          {title}
        </figcaption>
        {description && <p className="muted small chart-desc">{description}</p>}
      </div>

      <div className="chart-tooltip-wrap">
        <div
          className={`chart-tooltip ${activePoint ? '' : 'chart-tooltip--placeholder'}`}
          role="status"
          aria-live="polite"
        >
          {activePoint ? (
            <>
              <strong>{activePoint.label}:</strong> {activePoint.value} {yUnit}
            </>
          ) : (
            <span aria-hidden="true">&nbsp;</span>
          )}
        </div>
      </div>

      <div className="chart-svg-wrap" tabIndex={0} aria-label={`${title} graphical line chart`}>
        <svg
          viewBox={`0 0 ${svgWidth} ${chartHeight}`}
          className="accessible-svg-chart"
          role="img"
          aria-label={`${title}: interactive trend line chart with ${points.length} points`}
        >
          {/* Subtle gridlines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = chartHeight - paddingY - ratio * usableHeight
            return (
              <g key={ratio}>
                <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="var(--c-border, #333)" strokeDasharray="3 3" />
                <text x={paddingX - 8} y={y + 4} fill="var(--c-muted, #888)" fontSize="10" textAnchor="end">
                  {Math.round(ratio * maxValue)}
                </text>
              </g>
            )
          })}

          {/* Area fill / gradient */}
          <path
            d={`${pathD} L ${coords[coords.length - 1].x} ${chartHeight - paddingY} L ${coords[0].x} ${chartHeight - paddingY} Z`}
            fill="var(--c-accent-soft, rgba(168, 85, 247, 0.15))"
          />

          {/* Trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--c-accent, #a855f7)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {coords.map(({ x, y, point }) => {
            const isActive = activePoint?.label === point.label
            return (
              <g key={point.label}>
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  className={`chart-dot ${isActive ? 'is-active' : ''}`}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${point.label}: ${point.value} ${yUnit}`}
                  onFocus={() => setActivePoint(point)}
                  onBlur={() => setActivePoint(null)}
                  onMouseEnter={() => setActivePoint(point)}
                  onMouseLeave={() => setActivePoint(null)}
                />
                <text
                  x={x}
                  y={chartHeight - paddingY + 14}
                  fill="var(--c-muted, #888)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {point.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Semantic Table Alternative (Spec §7.10, §12.1) */}
      <details className="chart-data-table-toggle">
        <summary className="small muted">View as data table</summary>
        <table className="data-table" aria-label={`${title} tabular data`}>
          <caption>{title} data table</caption>
          <thead>
            <tr>
              <th scope="col">Time Interval</th>
              <th scope="col">Activity Count ({yUnit})</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
