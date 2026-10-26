import { Link } from 'react-router-dom'
import { topicsFor } from '../../../data/curriculum'

export interface MiniConstellationProps {
  technologyId: string
  topicId: string
  className?: string
}

/**
 * Catalog 2.7: Mini Orbit Preview in Header
 * 48x48 px mini constellation in the breadcrumb bar of lesson/practice views >= 768 px.
 * Highlights the current topic, links to the Track page, and has the text alternative "Topic n of N".
 */
export function MiniConstellation({ technologyId, topicId, className = '' }: MiniConstellationProps) {
  const topics = topicsFor(technologyId)
  if (!topics || topics.length === 0) return null

  const activeIndex = topics.findIndex((t) => t.id === topicId)
  const n = activeIndex >= 0 ? activeIndex + 1 : 1
  const total = topics.length
  const textAlt = `Topic ${n} of ${total}`

  const size = 48
  const cx = 24
  const cy = 24
  const orbitR = 17

  // Generate mini star positions
  const miniStars = topics.map((t, i) => {
    // 12 o'clock counter-clockwise
    const angle = -Math.PI / 2 - (i / total) * 2 * Math.PI
    const x = cx + orbitR * Math.cos(angle)
    const y = cy + orbitR * Math.sin(angle)
    const isCurrent = t.id === topicId
    return { id: t.id, x, y, isCurrent }
  })

  return (
    <Link
      to={`/learn/${technologyId}`}
      className={`mini-constellation-link ${className}`}
      aria-label={`${textAlt} on learning orbit map`}
      title={`${textAlt} — Open track orbit`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        textDecoration: 'none',
        position: 'relative',
        borderRadius: 'var(--r-md, 8px)',
        border: '1px solid var(--border, #3a3556)',
        background: 'var(--surface-raised, rgba(36, 34, 53, 0.7))',
        flexShrink: 0,
      }}
    >
      <span className="sr-only">{textAlt}</span>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        {/* Orbit guide ring */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitR}
          fill="none"
          stroke="var(--border, #3a3556)"
          strokeWidth="1"
          strokeDasharray="2, 2"
        />

        {/* Center hub */}
        <circle cx={cx} cy={cy} r={2.5} fill="var(--accent, #9a8bff)" opacity={0.8} />

        {/* Mini stars */}
        {miniStars.map((s) => (
          <g key={s.id}>
            {s.isCurrent && (
              <circle
                cx={s.x}
                cy={s.y}
                r={5.5}
                fill="none"
                stroke="var(--accent, #9a8bff)"
                strokeWidth="1.5"
              />
            )}
            <circle
              cx={s.x}
              cy={s.y}
              r={s.isCurrent ? 3.5 : 1.8}
              className={s.isCurrent ? 'mini-star mini-star--active' : 'mini-star'}
              fill={s.isCurrent ? 'var(--accent, #9a8bff)' : 'var(--text-muted, #9c97b8)'}
            />
          </g>
        ))}
      </svg>
    </Link>
  )
}
