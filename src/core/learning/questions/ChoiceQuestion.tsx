import type { ChoiceQuizQuestion } from '../../../data/types'
import { Icon } from '../../../components/Icon'

export interface ChoiceQuestionProps {
  question: ChoiceQuizQuestion
  chosen: number | null
  checked: boolean
  onSelect: (index: number) => void
}

/**
 * Multiple choice question component.
 */
export function ChoiceQuestion({
  question,
  chosen,
  checked,
  onSelect,
}: ChoiceQuestionProps) {
  return (
    <fieldset className="quiz-fieldset" disabled={checked}>
      <legend className="quiz-q">{question.prompt}</legend>
      <div className="quiz-options">
        {question.options.map((opt, oi) => {
          const isChosen = chosen === oi
          const cls = checked
            ? oi === question.correctIndex
              ? 'is-correct'
              : isChosen
                ? 'is-wrong'
                : ''
            : isChosen
              ? 'is-selected'
              : ''
          return (
            <label key={oi} className={`quiz-option ${cls}`}>
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={isChosen}
                onChange={() => onSelect(oi)}
              />
              <span className="quiz-option__text">{opt}</span>
              {checked && oi === question.correctIndex && (
                <span className="quiz-option__tag">
                  <Icon name="check" size={16} />
                  Correct answer
                </span>
              )}
              {checked && isChosen && oi !== question.correctIndex && (
                <span className="quiz-option__tag">
                  <Icon name="x" size={16} />
                  Your answer
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
