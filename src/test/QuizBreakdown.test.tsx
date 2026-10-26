import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { QuizBreakdown, formatAnswer, formatCorrectAnswer, getKindLabel } from '../core/learning/QuizBreakdown'
import { AppStateProvider } from '../state/AppState'
import { ToastProvider } from '../components/Toast'
import type { Quiz, ChoiceQuizQuestion, OutputPredictorQuizQuestion, BlankQuizQuestion } from '../data/types'
import type { QuizSession } from '../lib/quiz'

describe('QuizBreakdown (5.6)', () => {
  const choiceQ: ChoiceQuizQuestion = {
    id: 'q1',
    prompt: 'What does HTML stand for?',
    options: ['HyperText Markup Language', 'High Tech Modern Language', 'Hyperlink Text Mode', 'Home Tool Markup'],
    correctIndex: 0,
    explanation: 'HTML stands for HyperText Markup Language.',
  }

  const outputQ: OutputPredictorQuizQuestion = {
    kind: 'output',
    id: 'q2',
    prompt: 'What will this HTML render?',
    code: '<h1>Title</h1>',
    options: [
      { id: 'opt-a', svg: '<svg></svg>' },
      { id: 'opt-b', svg: '<svg></svg>' },
    ],
    answer: 'opt-a',
    explanation: 'The h1 element renders a large bold heading.',
  }

  const blankQ: BlankQuizQuestion = {
    kind: 'blank',
    id: 'q3',
    prompt: 'The ___ tag defines a paragraph.',
    answers: ['p', '<p>'],
    explanation: 'Paragraphs in HTML use the p tag.',
  }

  const mockQuiz: Quiz = {
    topicId: 'html-structure',
    questions: [choiceQ, outputQ, blankQ],
  }

  const mockSession: QuizSession = {
    index: 2,
    answers: [0, 'opt-b', null], // Q1 correct (0), Q2 wrong ('opt-b'), Q3 unanswered (null)
    checked: [true, true, true],
    skipped: [false, false, true],
    finished: true,
  }

  const renderComponent = () =>
    render(
      <AppStateProvider>
        <ToastProvider>
          <QuizBreakdown quiz={mockQuiz} session={mockSession} topicId="html-structure" />
        </ToastProvider>
      </AppStateProvider>
    )

  it('renders breakdown table with all questions and kind tags', () => {
    renderComponent()

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument()
    expect(screen.getByText('Visual Output')).toBeInTheDocument()
    expect(screen.getByText('Fill in the Blank')).toBeInTheDocument()
  })

  it('shows ✓/✗ and status text for each question', () => {
    renderComponent()

    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('Incorrect')).toBeInTheDocument()
    expect(screen.getByText('Unanswered')).toBeInTheDocument()
  })

  it('displays your answer and correct answer with explanations', () => {
    renderComponent()

    expect(screen.getByText(choiceQ.explanation)).toBeInTheDocument()
    expect(screen.getByText(outputQ.explanation)).toBeInTheDocument()
    expect(screen.getByText(blankQ.explanation)).toBeInTheDocument()

    expect(screen.getByText('Option opt-a')).toBeInTheDocument()
    expect(screen.getByText('p or <p>')).toBeInTheDocument()
  })

  it('allows saving incorrect or unanswered questions to Error Notebook', async () => {
    const user = userEvent.setup()
    renderComponent()

    const saveButtons = screen.getAllByRole('button', { name: /save to error notebook/i })
    expect(saveButtons).toHaveLength(2) // Q2 and Q3

    await user.click(saveButtons[0])
    expect(screen.getByText(/added to your error notebook/i)).toBeInTheDocument()
  })

  it('correctly formats helper labels and answers', () => {
    expect(getKindLabel('sort')).toBe('Code Sorter')
    expect(getKindLabel('bug')).toBe('Spot the Bug')
    expect(formatAnswer(outputQ, 'opt-a')).toBe('Option opt-a')
    expect(formatCorrectAnswer(blankQ)).toBe('p or <p>')
  })
})
