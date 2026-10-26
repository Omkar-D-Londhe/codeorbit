import { useEffect } from 'react'
import type { SorterQuizQuestion } from '../../../data/types'
import { Sorter } from '../Sorter'

export interface SorterQuestionProps {
  question: SorterQuizQuestion
  chosen: string[] | null
  checked: boolean
  onSelect: (order: string[]) => void
}

/**
 * Drag-and-Drop / Keyboard Code Sorter Question (5.2).
 */
export function SorterQuestion({
  question,
  chosen,
  checked,
  onSelect,
}: SorterQuestionProps) {
  // If not chosen yet, initialize with the default item sequence so answer is populated
  const currentOrder = chosen ?? question.items.map((it) => it.id)

  useEffect(() => {
    if (!chosen) {
      onSelect(currentOrder)
    }
  }, [chosen, currentOrder, onSelect])

  return (
    <fieldset className="quiz-fieldset" disabled={checked}>
      <legend className="quiz-q">{question.prompt}</legend>
      <p className="muted small" style={{ marginBottom: 'var(--s-3, 12px)' }}>
        Reorder the items into the correct sequence. Drag with mouse, use the Up/Down buttons, or press Space to grab and Arrow keys to move.
      </p>

      <Sorter
        items={question.items}
        order={currentOrder}
        disabled={checked}
        checked={checked}
        correctOrder={question.order}
        onChange={onSelect}
      />
    </fieldset>
  )
}
