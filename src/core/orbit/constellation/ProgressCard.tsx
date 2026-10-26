import { Icon } from '../../../components/Icon'
import type { ConstellationStateCounts } from './state'

export interface ProgressCardProps {
  counts: ConstellationStateCounts
}

export function ProgressCard({ counts }: ProgressCardProps) {
  const { completed, inProgress, available, locked, total } = counts
  const percent = total > 0 ? (completed === total ? 100 : Math.floor((completed / total) * 100)) : 0

  return (
    <div className="card constellation-progress-card" style={{ padding: '16px' }}>
      <h3 style={{ fontSize: 'var(--fs-small, 14px)', fontWeight: 700, margin: '0 0 12px' }}>
        Your Progress
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div
          role="img"
          aria-label={`${completed} of ${total} topics completed`}
          style={{
            position: 'relative',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--border, #3a3556)"
              strokeWidth="3.5"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--success, #48c78e)"
              strokeWidth="3.5"
              strokeDasharray={`${percent}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <span style={{ position: 'absolute', fontWeight: 700, fontSize: '13px' }}>
            {percent}%
          </span>
        </div>

        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>
            {completed} of {total} Complete
          </div>
          <div className="small muted">
            {total - completed} remaining
          </div>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Track progress percentage"
        style={{
          width: '100%',
          height: '6px',
          background: 'var(--surface, #1e1b2e)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: 'var(--accent, #9a8bff)',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--success, #48c78e)' }} aria-hidden="true">
            <Icon name="check" size={14} />
          </span>
          <span>{completed} Completed</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--accent, #9a8bff)' }} aria-hidden="true">
            <Icon name="play" size={14} />
          </span>
          <span>{inProgress} In Progress</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text, #f0eff7)' }} aria-hidden="true">
            <Icon name="star" size={14} />
          </span>
          <span>{available} Available</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted, #9c97b8)' }} aria-hidden="true">
            <Icon name="lock" size={14} />
          </span>
          <span>{locked} Locked</span>
        </div>
      </div>
    </div>
  )
}
