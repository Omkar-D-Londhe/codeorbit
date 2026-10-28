import { Icon } from '../../components/Icon'
import { REMINDER_BANNER_MESSAGE, REMINDER_LIMITATION_NOTE } from './reminders'

export interface ReminderBannerProps {
  onDismiss: () => void
}

/**
 * Honest, non-intrusive reminder banner (Catalog 14.3, Decision C-10).
 * Informs learner when practice is due while stating honest delivery limits.
 */
export function ReminderBanner({ onDismiss }: ReminderBannerProps) {
  return (
    <div
      role="status"
      className="reminder-banner card card--raised"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        borderLeft: '4px solid var(--c-accent, #9a8bff)',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon name="clock" size={20} />
        <div>
          <strong style={{ display: 'inline-block', marginRight: '0.5rem' }}>
            {REMINDER_BANNER_MESSAGE}
          </strong>
          <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>
            ({REMINDER_LIMITATION_NOTE})
          </span>
        </div>
      </div>
      <button
        type="button"
        className="icon-btn"
        aria-label="Dismiss reminder"
        onClick={onDismiss}
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Icon name="x" size={18} />
      </button>
    </div>
  )
}
