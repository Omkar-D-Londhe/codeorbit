import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Icon } from '../../components/Icon'
import { resumePath, trackPath, ACTIVITY_LABEL } from '../../lib/routes'
import type { LastVisited } from '../../state/types'

export interface QuickActionsProps {
  lastVisited?: LastVisited
  trackId: string
  openErrors: number
  notesCount: number
}

/**
 * 3.6 Quick Actions Toolbar: Provides direct keyboard-accessible navigation
 * to only real and enabled application destinations:
 * Resume / Start, Daily Challenge, Review (Error Notebook), Notes, and Settings.
 */
export function QuickActions({
  lastVisited,
  trackId,
  openErrors,
  notesCount,
}: QuickActionsProps) {
  const resumeUrl = lastVisited ? resumePath(lastVisited) : trackPath(trackId)
  const resumeLabel = lastVisited
    ? `Continue: ${ACTIVITY_LABEL[lastVisited.activity]}`
    : 'Start track'

  return (
    <Card className="quick-actions-card" eyebrow="Shortcuts" title="Quick actions">
      <div className="quick-actions-toolbar" role="toolbar" aria-label="Quick actions">
        <Link to={resumeUrl} className="btn btn--primary quick-action-btn">
          <Icon name="play" size={16} />
          <span>{resumeLabel}</span>
        </Link>

        <a href="#daily-challenge" className="btn btn--secondary quick-action-btn">
          <Icon name="star" size={16} />
          <span>Today's challenge</span>
        </a>

        <Link to="/review" className="btn btn--secondary quick-action-btn">
          <Icon name="notebook" size={16} />
          <span>Error Notebook</span>
          {openErrors > 0 && (
            <span className="badge badge--pill badge--subtle" aria-label={`${openErrors} open items`}>
              {openErrors}
            </span>
          )}
        </Link>

        <Link to="/review" className="btn btn--secondary quick-action-btn">
          <Icon name="pencil" size={16} />
          <span>My notes</span>
          {notesCount > 0 && (
            <span className="badge badge--pill badge--subtle" aria-label={`${notesCount} notes`}>
              {notesCount}
            </span>
          )}
        </Link>

        <Link to="/settings" className="btn btn--secondary quick-action-btn">
          <Icon name="settings" size={16} />
          <span>Settings</span>
        </Link>
      </div>
    </Card>
  )
}
