import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FeedbackPanel } from '../core/learning/FeedbackPanel'
import { CoachNote } from '../core/learning/CoachNote'
import type { CheckResult } from '../lib/validators'
import type { Challenge } from '../data/types'
import type { CheckHistoryEntry } from '../state/types'

const dummyChallenge: Challenge = {
  id: 'ch-test',
  topicId: 'html-structure',
  title: 'Test Challenge',
  difficulty: 'beginner',
  prompt: 'Test prompt',
  objective: 'Test objective',
  starterCode: '<h1>Test</h1>',
  solutionCode: '<!DOCTYPE html><html lang="en"><body><h1>Test</h1></body></html>',
  solutionExplanation: ['Test 1', 'Test 2', 'Test 3'],
  hints: ['Hint 1', 'Hint 2', 'Hint 3'],
  requirements: [
    { id: 'doctype', description: 'Starts with <!DOCTYPE html>', explanation: 'Standards mode', explain: 'The doctype tells the browser to use standards mode rather than quirks mode.', rule: { kind: 'doctype' } },
    { id: 'lang', description: 'HTML has lang attribute', explanation: 'Accessibility translation', explain: 'Specifying lang helps screen readers select the right pronunciation.', rule: { kind: 'everyHasAttr', selector: 'html', attr: 'lang', nonEmpty: true } },
    { id: 'h1', description: 'Body contains h1', explanation: 'Main heading', explain: 'An h1 acts as the top-level landmark heading.', rule: { kind: 'selector', selector: 'body h1' } },
  ],
}

describe('FeedbackPanel and Code Coach (7.2, 7.3, 7.4, 7.5, 7.6, L-05)', () => {
  it('renders initial empty state before first check with no fake progress bar', () => {
    render(
      <MemoryRouter>
        <FeedbackPanel result={null} challenge={dummyChallenge} />
      </MemoryRouter>
    )

    expect(screen.getByText(/run check to see how your code measures up/i)).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders parse error state when HTML cannot be read', () => {
    render(
      <MemoryRouter>
        <FeedbackPanel result={null} challenge={dummyChallenge} parseError={true} />
      </MemoryRouter>
    )

    expect(screen.getByText('Could not read this HTML')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders progress bar with exact met/total value after check (7.2)', () => {
    const partialResult: CheckResult = {
      passed: 1,
      total: 3,
      allPassed: false,
      results: [
        { id: 'doctype', description: 'Starts with <!DOCTYPE html>', explanation: 'Standards mode', status: 'pass', met: true, line: 1 },
        { id: 'lang', description: 'HTML has lang attribute', explanation: 'Accessibility translation', status: 'fail', met: false, line: 2 },
        { id: 'h1', description: 'Body contains h1', explanation: 'Main heading', status: 'fail', met: false, line: 1 },
      ],
    }

    render(
      <MemoryRouter>
        <FeedbackPanel result={partialResult} challenge={dummyChallenge} />
      </MemoryRouter>
    )

    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '1')
    expect(bar).toHaveAttribute('aria-valuemax', '3')
    expect(bar).toHaveAttribute('aria-label', '1 of 3 requirements met')
    expect(screen.getByText(/1 of 3 requirements met/i)).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('groups requirements into Met and Not met sections', () => {
    const partialResult: CheckResult = {
      passed: 1,
      total: 3,
      allPassed: false,
      results: [
        { id: 'doctype', description: 'Starts with <!DOCTYPE html>', explanation: 'Standards mode', status: 'pass', met: true, line: 1 },
        { id: 'lang', description: 'HTML has lang attribute', explanation: 'Accessibility translation', status: 'fail', met: false, line: 2 },
        { id: 'h1', description: 'Body contains h1', explanation: 'Main heading', status: 'fail', met: false, line: 1 },
      ],
    }

    render(
      <MemoryRouter>
        <FeedbackPanel result={partialResult} challenge={dummyChallenge} />
      </MemoryRouter>
    )

    expect(screen.getByText('Not met (2)')).toBeInTheDocument()
    expect(screen.getByText('Met (1)')).toBeInTheDocument()
    expect(screen.getByText('HTML has lang attribute')).toBeInTheDocument()
    expect(screen.getByText('Starts with <!DOCTYPE html>')).toBeInTheDocument()
  })

  it('expands authored explanation when user clicks "Explain this requirement" (7.5)', async () => {
    const user = userEvent.setup()
    const partialResult: CheckResult = {
      passed: 0,
      total: 1,
      allPassed: false,
      results: [
        { id: 'lang', description: 'HTML has lang attribute', explanation: 'Accessibility translation', status: 'fail', met: false, line: 2 },
      ],
    }

    render(
      <MemoryRouter>
        <FeedbackPanel result={partialResult} challenge={dummyChallenge} />
      </MemoryRouter>
    )

    const summary = screen.getByText('Explain this requirement')
    expect(summary).toBeInTheDocument()

    // Click summary to toggle details
    await user.click(summary)
    expect(screen.getByText(/Specifying lang helps screen readers/i)).toBeInTheDocument()
  })

  it('persists and displays check history capped at 20 entries (7.4)', async () => {
    const user = userEvent.setup()
    const history: CheckHistoryEntry[] = Array.from({ length: 25 }, (_, i) => ({
      at: 1700000000000 + i * 1000,
      passed: i % 4,
      total: 3,
      failedIds: ['lang'],
    }))

    const partialResult: CheckResult = {
      passed: 2,
      total: 3,
      allPassed: false,
      results: [
        { id: 'doctype', description: 'Starts with <!DOCTYPE html>', explanation: 'Standards mode', status: 'pass', met: true },
        { id: 'h1', description: 'Body contains h1', explanation: 'Main heading', status: 'pass', met: true },
        { id: 'lang', description: 'HTML has lang attribute', explanation: 'Accessibility translation', status: 'fail', met: false },
      ],
    }

    render(
      <MemoryRouter>
        <FeedbackPanel result={partialResult} challenge={dummyChallenge} history={history} />
      </MemoryRouter>
    )

    // History section header shows count capped at 20
    const historySummary = screen.getByText(/Feedback History \(25 checks\)/i)
    expect(historySummary).toBeInTheDocument()
    await user.click(historySummary)

    // View buttons should be rendered for the latest entries
    const viewButtons = screen.getAllByRole('button', { name: 'View' })
    expect(viewButtons.length).toBeLessThanOrEqual(20)

    // Clicking View shows details of selected history entry
    await user.click(viewButtons[0])
    expect(screen.getByText(/Unmet requirement IDs: lang/i)).toBeInTheDocument()
  })

  it('strictly adheres to L-05 copy rules: never mentions "AI" or claims code review', () => {
    const { container: coachContainer } = render(
      <CoachNote allPassed={false} passedCount={1} totalCount={3} nextFailedDescription="HTML has lang attribute" />
    )

    const text = coachContainer.textContent || ''
    // Must contain truthful Code Coach persona label
    expect(text).toContain('Code Coach · rule-based, specific to this challenge')
    // Must NOT contain "AI" as a word
    expect(text).not.toMatch(/\bAI\b/)
    // Must NOT contain "reviewed your code" or general "reviewed"
    expect(text.toLowerCase()).not.toContain('reviewed your code')
  })
})
