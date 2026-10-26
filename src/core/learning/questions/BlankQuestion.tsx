import { useId } from 'react'
import type { BlankQuizQuestion } from '../../../data/types'
import { Icon } from '../../../components/Icon'
import { scoreQuestion } from '../../../lib/quiz'

export interface BlankQuestionProps {
  question: BlankQuizQuestion
  chosen: string | null
  checked: boolean
  onSelect: (value: string) => void
}

/**
 * Fill-in-the-Blank Question Component (5.4).
 */
export function BlankQuestion({
  question,
  chosen,
  checked,
  onSelect,
}: BlankQuestionProps) {
  const inputId = useId()
  const isCorrect = checked && chosen !== null ? scoreQuestion(question, chosen) === 1 : false

  // Parse prompt around ___ marker for visual rendering
  const promptParts = question.prompt.split('___')

  return (
    <fieldset className="quiz-fieldset" disabled={checked}>
      <legend className="quiz-q">Fill in the blank</legend>
      <div
        className="quiz-blank-prompt"
        style={{
          fontSize: '1.15rem',
          lineHeight: '1.6',
          marginBottom: 'var(--s-4, 16px)',
        }}
      >
        {promptParts.length > 1 ? (
          <p>
            {promptParts[0]}
            <strong
              className="quiz-blank-placeholder"
              style={{
                textDecoration: 'underline wavy var(--accent, #9a8bff)',
                padding: '0 6px',
              }}
            >
              {chosen && chosen.trim() ? chosen : '______'}
            </strong>
            {promptParts[1]}
          </p>
        ) : (
          <p>{question.prompt}</p>
        )}
      </div>

      <div className="field" style={{ maxWidth: '360px' }}>
        <label htmlFor={inputId} className="field-label">
          Your answer:
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            id={inputId}
            type="text"
            className="input"
            value={chosen ?? ''}
            onChange={(e) => onSelect(e.target.value)}
            disabled={checked}
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            placeholder="Type your answer"
            aria-label="Answer for fill in the blank"
          />
          {checked && (
            <span
              className={`quiz-blank-badge ${isCorrect ? 'text-success' : 'text-danger'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              <Icon name={isCorrect ? 'check' : 'x'} size={18} />
              {isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          )}
        </div>
        {checked && !isCorrect && (
          <p className="small muted" style={{ marginTop: '6px' }}>
            Accepted answer: <strong>{question.answers[0]}</strong>
            {question.answers.length > 1 ? ` (or ${question.answers.slice(1).join(', ')})` : ''}
          </p>
        )}
      </div>
    </fieldset>
  )
}
