import { Icon } from '../../components/Icon'

export interface A11yBoxProps {
  notes?: string[]
  className?: string
}

/**
 * Accessibility Check Sidebox (4.9).
 * Summarizes essential accessibility considerations for the lesson.
 * Renders nothing if notes is absent or empty.
 */
export function A11yBox({ notes, className = '' }: A11yBoxProps) {
  if (!notes || notes.length === 0) return null

  return (
    <aside className={`a11y-box ${className}`} aria-labelledby="a11y-box-heading">
      <div className="a11y-box__header">
        <Icon name="eye" size={18} />
        <h2 id="a11y-box-heading" className="a11y-box__title">
          Accessibility Checks
        </h2>
      </div>
      <ul className="a11y-box__list" role="list">
        {notes.map((note, index) => (
          <li key={index} className="a11y-box__item">
            {note}
          </li>
        ))}
      </ul>
    </aside>
  )
}
