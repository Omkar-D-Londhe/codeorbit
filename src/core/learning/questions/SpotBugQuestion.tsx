import type { SpotBugQuizQuestion } from '../../../data/types'
import { Icon } from '../../../components/Icon'

export interface SpotBugQuestionProps {
  question: SpotBugQuizQuestion
  chosen: number | null
  checked: boolean
  onSelect: (lineIndex: number) => void
}

/**
 * Spot-the-Bug Question Component (5.3).
 * Presents code lines with line numbers; learner selects the single line containing the bug.
 */
export function SpotBugQuestion({
  question,
  chosen,
  checked,
  onSelect,
}: SpotBugQuestionProps) {
  return (
    <fieldset className="quiz-fieldset" disabled={checked}>
      <legend className="quiz-q">{question.prompt}</legend>
      <p className="muted small" style={{ marginBottom: 'var(--s-3, 12px)' }}>
        Select the line that contains the bug or anti-pattern.
      </p>

      <div
        className="quiz-bug-lines"
        role="radiogroup"
        aria-label="Code lines to inspect"
        style={{
          display: 'grid',
          gap: '2px',
          background: 'var(--code-bg, #161426)',
          padding: '8px',
          borderRadius: 'var(--r-md, 8px)',
          border: '1px solid var(--border, #3a3556)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 'var(--fs-code, 13px)',
        }}
      >
        {question.lines.map((line, idx) => {
          const isChosen = chosen === idx
          const isCorrectBug = idx === question.answer

          let cls = ''
          if (checked) {
            cls = isCorrectBug ? 'is-correct' : isChosen ? 'is-wrong' : ''
          } else if (isChosen) {
            cls = 'is-selected'
          }

          return (
            <label
              key={idx}
              className={`quiz-bug-line ${cls}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 10px',
                borderRadius: 'var(--r-sm, 4px)',
                cursor: checked ? 'default' : 'pointer',
                background: isChosen
                  ? 'var(--accent-wash, rgba(154, 139, 255, 0.15))'
                  : 'transparent',
                borderLeft: isChosen ? '3px solid var(--accent, #9a8bff)' : '3px solid transparent',
              }}
            >
              <input
                type="radio"
                name={`bug-${question.id}`}
                checked={isChosen}
                onChange={() => onSelect(idx)}
                className="sr-only"
              />
              <span
                className="quiz-bug-line__num"
                style={{
                  color: 'var(--text-muted, #8a879e)',
                  minWidth: '24px',
                  userSelect: 'none',
                }}
              >
                {idx + 1}
              </span>
              <span className="quiz-bug-line__code" style={{ flex: 1, whiteSpace: 'pre' }}>
                {line || ' '}
              </span>
              {checked && isCorrectBug && (
                <span className="quiz-option__tag" style={{ marginLeft: 'auto' }}>
                  <Icon name="check" size={14} />
                  Buggy line
                </span>
              )}
              {checked && isChosen && !isCorrectBug && (
                <span className="quiz-option__tag" style={{ marginLeft: 'auto' }}>
                  <Icon name="x" size={14} />
                  Selected
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
