import type { Quiz, QuizQuestion, QuizAnswer } from '../../data/types'
import type { QuizSession } from '../../lib/quiz'
import { scoreQuestion } from '../../lib/quiz'
import { Icon } from '../../components/Icon'
import { useToast } from '../../components/Toast'
import { useApp } from '../../state/AppState'

export interface QuizBreakdownProps {
  quiz: Quiz
  session: QuizSession
  topicId: string
}

export function formatAnswer(q: QuizQuestion, a: QuizAnswer): string {
  if (a === null || a === undefined) return '(Unanswered)'
  switch (q.kind) {
    case 'output':
      return `Option ${a}`
    case 'sort':
      if (Array.isArray(a)) {
        const itemMap = new Map(q.items.map((it) => [it.id, it.text]))
        return a.map((id, idx) => `${idx + 1}. ${itemMap.get(id) ?? id}`).join(' → ')
      }
      return String(a)
    case 'bug':
      if (typeof a === 'number') {
        return `Line ${a + 1}: ${q.lines[a] ?? ''}`
      }
      return String(a)
    case 'blank':
      return String(a)
    case 'choice':
    default:
      return typeof a === 'number' ? q.options[a] ?? String(a) : String(a)
  }
}

export function formatCorrectAnswer(q: QuizQuestion): string {
  switch (q.kind) {
    case 'output':
      return `Option ${q.answer}`
    case 'sort': {
      const itemMap = new Map(q.items.map((it) => [it.id, it.text]))
      return q.order.map((id, idx) => `${idx + 1}. ${itemMap.get(id) ?? id}`).join(' → ')
    }
    case 'bug':
      return `Line ${q.answer + 1}: ${q.lines[q.answer] ?? ''}`
    case 'blank':
      return q.answers.join(' or ')
    case 'choice':
    default:
      return q.options[q.correctIndex] ?? ''
  }
}

export function getKindLabel(kind?: string): string {
  switch (kind) {
    case 'output':
      return 'Visual Output'
    case 'sort':
      return 'Code Sorter'
    case 'bug':
      return 'Spot the Bug'
    case 'blank':
      return 'Fill in the Blank'
    case 'choice':
    default:
      return 'Multiple Choice'
  }
}

/**
 * Quiz Result Breakdown Component (5.6).
 * Renders an accessible per-question breakdown table with question kind, answers, correctness, and explanations.
 */
export function QuizBreakdown({ quiz, session, topicId }: QuizBreakdownProps) {
  const { dispatch } = useApp()
  const toast = useToast()

  return (
    <div className="quiz-breakdown" aria-label="Question by question breakdown">
      <h3 className="quiz-breakdown__title" style={{ margin: 'var(--s-4, 16px) 0 var(--s-3, 12px)' }}>
        Detailed Breakdown
      </h3>

      <div className="table-wrapper" style={{ overflowX: 'auto', marginBottom: 'var(--s-6, 24px)' }}>
        <table className="table quiz-breakdown__table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={{ width: '40px', textAlign: 'center' }}>Status</th>
              <th scope="col" style={{ width: '130px' }}>Type</th>
              <th scope="col">Question & Explanation</th>
              <th scope="col" style={{ width: '220px' }}>Answers</th>
              <th scope="col" style={{ width: '140px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {quiz.questions.map((q, i) => {
              const a = session.answers[i]
              const correct = scoreQuestion(q, a) === 1
              const unans = a === null || a === undefined
              const correctText = formatCorrectAnswer(q)
              const yourAnswerText = formatAnswer(q, a)

              return (
                <tr
                  key={q.id}
                  className={unans ? 'row--skipped' : correct ? 'row--correct' : 'row--wrong'}
                  style={{
                    borderBottom: '1px solid var(--border, #3a3556)',
                    background: correct
                      ? 'transparent'
                      : 'var(--surface-raised, rgba(255, 255, 255, 0.02))',
                  }}
                >
                  <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                    <span
                      className={`status-pill ${correct ? 'status-pill--pass' : 'status-pill--fail'}`}
                    >
                      <Icon name={correct ? 'check' : 'x'} size={16} />
                      <span className="status-text" style={{ marginLeft: '4px', fontSize: '12px', fontWeight: 600 }}>
                        {unans ? 'Unanswered' : correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </span>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                    <span className="tag" style={{ fontSize: '11px' }}>
                      {getKindLabel(q.kind)}
                    </span>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '6px' }}>{q.prompt}</p>
                    <p className="small muted" style={{ margin: 0 }}>{q.explanation}</p>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '12px', fontSize: 'var(--fs-small, 13px)' }}>
                    {!correct && (
                      <p style={{ margin: '0 0 4px', color: 'var(--warning, #f2b85b)' }}>
                        <strong>Your answer:</strong> {yourAnswerText}
                      </p>
                    )}
                    <p style={{ margin: 0, color: 'var(--text, #f0eff7)' }}>
                      <strong>Correct:</strong> {correctText}
                    </p>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                    {!correct && (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          dispatch({
                            type: 'ADD_ERROR',
                            entry: {
                              id: `err-${Date.now()}-${q.id}`,
                              source: 'quiz',
                              topicId,
                              refId: q.id,
                              title: q.prompt,
                              detail: `Correct answer: ${correctText}. ${q.explanation}`,
                              status: 'open',
                              createdAt: Date.now(),
                            },
                          })
                          toast.show('Added to your Error Notebook.')
                        }}
                      >
                        Save to Error Notebook
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
