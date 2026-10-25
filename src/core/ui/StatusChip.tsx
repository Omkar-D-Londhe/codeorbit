import { Icon } from './icons'
import type { IconId } from './icons'

export type StatusChipKind = 'completed' | 'in-progress' | 'available' | 'locked' | 'mastered'

export interface StatusChipProps {
  status: StatusChipKind
  label?: string
  className?: string
}

const DEFAULT_ICONS: Record<StatusChipKind, IconId> = {
  completed: 'check',
  'in-progress': 'play',
  available: 'sparkles',
  locked: 'lock',
  mastered: 'check'
}

const DEFAULT_LABELS: Record<StatusChipKind, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  available: 'Available',
  locked: 'Locked',
  mastered: 'Mastered'
}

export function StatusChip({ status, label, className = '' }: StatusChipProps) {
  const iconId = DEFAULT_ICONS[status]
  const text = label || DEFAULT_LABELS[status]

  return (
    <span className={`status-chip status-chip--${status} ${className}`.trim()}>
      <Icon id={iconId} size={14} />
      <span>{text}</span>
    </span>
  )
}
