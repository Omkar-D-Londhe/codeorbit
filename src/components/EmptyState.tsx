import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { ContextualEmptyIllustration, type EmptyIllustrationVariant } from './illustrations/EmptyIllustrations'

export type { EmptyIllustrationVariant }

export interface EmptyStateProps {
  icon?: IconName
  variant?: EmptyIllustrationVariant
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon = 'info', variant, title, children, action }: EmptyStateProps) {
  return (
    <div className={`empty ${variant ? `empty--${variant}` : ''}`}>
      {variant ? (
        <ContextualEmptyIllustration variant={variant} size={96} className="empty__ill" />
      ) : (
        <Icon name={icon} size={28} />
      )}
      <h3 className="empty__title">{title}</h3>
      {children && <p className="empty__text">{children}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  )
}
