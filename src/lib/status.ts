import type { TopicStatus } from './progress'
import type { IconName } from '../components/Icon'

export const STATUS_LABEL: Record<TopicStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
  mastered: 'Mastered',
}

export const STATUS_ICON: Record<TopicStatus, IconName> = {
  'not-started': 'circle',
  'in-progress': 'dot',
  completed: 'check',
  mastered: 'star',
}

export function formatDateTime(ms: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms))
  } catch {
    return new Date(ms).toISOString()
  }
}
