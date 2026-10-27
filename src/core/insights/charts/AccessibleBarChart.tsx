import { useState } from 'react'

export interface BarChartItem {
  label: string
  value: number
  secondaryValue?: number
  hint?: string
}

export interface AccessibleBarChartProps {
  title: string
  description?: string
  data: BarChartItem[]
  emptyMessage?: string
  yUnit?: string
}

export function AccessibleBarChart({
  title,
  description,
  data,
  emptyMessage = 'No data available',
  yUnit = '',
}: AccessibleBarChartProps) {
  const [activeItem, setActiveItem] = useState<BarChartItem | null>(null)

  if (!data || data.length === 0) {
    return (
      <figure className="card card--quiet accessible-chart-figure">
        <figcaption className="card__title">{title}</figcaption>
        <p className="muted chart-empty-note">{emptyMessage}</p>
      </figure>
    )
  }

  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue ?? 0)), 1)
  const chartHeight = 180
  const barWidth = 24
  const gap = 16
  const paddingX = 40
  const paddingY = 24
  const svgWidth = Math.max(320, paddingX * 2 + data.length * (barWidth + gap))
  const usableHeight = chartHeight - paddingY * 2

  return (
    <figure className="card accessible-chart-figure" aria-labelledby={`chart-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="chart-header">
        <figcaption id={`chart-${title.replace(/\s+/g, '-').toLowerCase()}`} className="card__title">
          {title}
        </figcaption>
        {description && <p className="muted small chart-desc">{description}</p>}
      </div>

      {activeItem && (
        <div className="chart-tooltip" role="status" aria-live="polite">
          <strong>{activeItem.label}:</strong> {activeItem.value} {yUnit}
          {activeItem.secondaryValue !== undefined && ` (Secondary: ${activeItem.secondaryValue})`}
        </div>
      )}

      <div className="chart-svg-wrap" tabIndex={0} aria-label={`${title} graphical representation`}>
        <svg
          viewBox={`0 0 ${svgWidth} ${chartHeight}`}
          className="accessible-svg-chart"
          role="img"
          aria-label={`${title}: interactive bar chart with ${data.length} data points`}
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

          {/* Bars */}
          {data.map((item, idx) => {
            const x = paddingX + idx * (barWidth + gap)
            const h = Math.max(4, (item.value / maxValue) * usableHeight)
            const y = chartHeight - paddingY - h

            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx={3}
                  className="chart-bar"
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${item.label}: ${item.value} ${yUnit}`}
                  onFocus={() => setActiveItem(item)}
                  onBlur={() => setActiveItem(null)}
                  onMouseEnter={() => setActiveItem(item)}
                  onMouseLeave={() => setActiveItem(null)}
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - paddingY + 14}
                  fill="var(--c-muted, #888)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Semantic Table Alternative (Spec §7.10, Accessibility) */}
      <details className="chart-data-table-toggle">
        <summary className="small muted">View as data table</summary>
        <table className="data-table" aria-label={`${title} tabular data`}>
          <caption>{title} data table</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Value {yUnit ? `(${yUnit})` : ''}</th>
              {data.some((d) => d.secondaryValue !== undefined) && <th scope="col">Secondary</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
                {row.secondaryValue !== undefined && <td>{row.secondaryValue}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
