import type { OutputPredictorQuizQuestion } from '../../../data/types'
import { CodeBlock } from '../../../components/CodeBlock'
import { Icon } from '../../../components/Icon'

export interface OutputPredictorQuestionProps {
  question: OutputPredictorQuizQuestion
  chosen: string | null
  checked: boolean
  onSelect: (optionId: string) => void
}

/**
 * Visual Output Predictor Question (5.1).
 * Displays a code snippet and prompts the learner to predict which visual output it produces.
 * Options are rendered as static SVG images via safe data URIs.
 */
export function OutputPredictorQuestion({
  question,
  chosen,
  checked,
  onSelect,
}: OutputPredictorQuestionProps) {
  return (
    <fieldset className="quiz-fieldset" disabled={checked}>
      <legend className="quiz-q">{question.prompt}</legend>
      <div className="quiz-output-code" style={{ marginBottom: 'var(--s-4, 16px)' }}>
        <CodeBlock code={question.code} label="Predict Output" copyable={false} />
      </div>

      <div className="quiz-output-options" role="radiogroup" aria-label="Visual output options">
        {question.options.map((opt) => {
          const isChosen = chosen === opt.id
          const isCorrect = opt.id === question.answer
          const cls = checked
            ? isCorrect
              ? 'is-correct'
              : isChosen
                ? 'is-wrong'
                : ''
            : isChosen
              ? 'is-selected'
              : ''

          const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(opt.svg)}`

          return (
            <label key={opt.id} className={`quiz-option quiz-option--output ${cls}`}>
              <input
                type="radio"
                name={`q-${question.id}`}
                value={opt.id}
                checked={isChosen}
                onChange={() => onSelect(opt.id)}
              />
              <div className="quiz-option__output-preview">
                <img
                  src={svgDataUri}
                  alt={`Rendered preview option ${opt.id}`}
                  className="quiz-output-preview-img"
                  style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
                />
              </div>
              {checked && isCorrect && (
                <span className="quiz-option__tag">
                  <Icon name="check" size={16} />
                  Correct output
                </span>
              )}
              {checked && isChosen && !isCorrect && (
                <span className="quiz-option__tag">
                  <Icon name="x" size={16} />
                  Your choice
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
