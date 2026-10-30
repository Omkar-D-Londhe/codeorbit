import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider } from '../state/AppState'
import { reducer } from '../state/reducer'
import { createDefaultState, saveState } from '../lib/storage'
import { ChallengeCreator, isValidSelector } from '../core/authoring/ChallengeCreator'
import { toChallenge } from '../core/content/challengeAdapter'
import { validateChallenge } from '../lib/validators'
import type { ChallengeV2 } from '../core/content/types'

describe('Stage 18b - Challenge Creator & Reducer Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('CSS Selector Validation (isValidSelector)', () => {
    it('accepts valid CSS selectors', () => {
      expect(isValidSelector('h1')).toBe(true)
      expect(isValidSelector('.container')).toBe(true)
      expect(isValidSelector('#root')).toBe(true)
      expect(isValidSelector('main > section p')).toBe(true)
      expect(isValidSelector('input[type="text"]')).toBe(true)
      expect(isValidSelector('a[href^="#"]')).toBe(true)
    })

    it('rejects invalid or blank CSS selectors', () => {
      expect(isValidSelector('')).toBe(false)
      expect(isValidSelector('   ')).toBe(false)
      expect(isValidSelector('div..class')).toBe(false)
      expect(isValidSelector('[unclosed')).toBe(false)
      expect(isValidSelector(':::invalid')).toBe(false)
      expect(isValidSelector('ul > > li')).toBe(false)
    })
  })

  describe('Reducer: Custom Challenge Persistence & Topic Mastery Immunity', () => {
    it('saves a custom challenge into state.custom.challenges and updates existing without mutating topic mastery', () => {
      const s0 = createDefaultState()
      s0.topics['html-structure'] = {
        lessonComplete: true,
        quizAttempts: 2,
        quizBest: { correct: 3, total: 3 },
      }

      const challenge1: ChallengeV2 = {
        id: 'custom:ch-test-1',
        trackId: 'html',
        topicId: 'custom',
        title: 'Build a Card Component',
        difficulty: 'beginner',
        prompt: 'Create a semantic card container.',
        objective: 'Practice using semantic HTML elements.',
        files: [{ name: 'index.html', language: 'html', content: '<article></article>' }],
        requirements: [
          {
            id: 'req-1',
            description: 'Uses article tag',
            explanation: 'Use <article> for self-contained content.',
            rule: { kind: 'selector', selector: 'article', min: 1 },
          },
        ],
        hints: ['Hint 1', 'Hint 2', 'Hint 3'],
        solution: {
          files: [{ name: 'index.html', language: 'html', content: '<article><h1>Title</h1></article>' }],
          explanation: 'Solution card.',
        },
      }

      const s1 = reducer(s0, { type: 'SAVE_CUSTOM_CHALLENGE', challenge: challenge1 })
      expect(s1.custom?.challenges).toBeDefined()
      expect(s1.custom.challenges.length).toBe(1)
      expect(s1.custom.challenges[0].id).toBe('custom:ch-test-1')
      expect(s1.custom.challenges[0].title).toBe('Build a Card Component')

      // Topic mastery immunity check
      expect(s1.topics['html-structure'].lessonComplete).toBe(true)
      expect(s1.topics['html-structure'].quizBest?.correct).toBe(3)
      expect(Object.keys(s1.topics)).toEqual(['html-structure'])

      // Updating the same challenge (idempotent upsert)
      const updatedChallenge: ChallengeV2 = {
        ...challenge1,
        title: 'Updated Card Component',
      }
      const s2 = reducer(s1, { type: 'SAVE_CUSTOM_CHALLENGE', challenge: updatedChallenge })
      expect(s2.custom.challenges.length).toBe(1)
      expect(s2.custom.challenges[0].title).toBe('Updated Card Component')

      // Deleting the challenge
      const s3 = reducer(s2, { type: 'DELETE_CUSTOM_CHALLENGE', id: 'custom:ch-test-1' })
      expect(s3.custom.challenges.length).toBe(0)
      // Topics still unchanged
      expect(s3.topics['html-structure'].quizBest?.correct).toBe(3)
    })
  })

  describe('Challenge Evaluator Integration (toChallenge & validateChallenge)', () => {
    it('allows a custom challenge to be validated by the standard challenge runner pipeline', () => {
      const customCh: ChallengeV2 = {
        id: 'custom:ch-test-eval',
        trackId: 'html',
        topicId: 'custom',
        title: 'Custom Navigation Challenge',
        difficulty: 'intermediate',
        prompt: 'Build a nav with an unordered list.',
        objective: 'Practice semantic navigation.',
        files: [{ name: 'index.html', language: 'html', content: '<!DOCTYPE html><html><body></body></html>' }],
        requirements: [
          {
            id: 'r1',
            description: 'Contains a nav element',
            explanation: 'Wrap navigation links inside <nav>',
            rule: { kind: 'selector', selector: 'nav', min: 1 },
          },
          {
            id: 'r2',
            description: 'Contains an unordered list inside the nav',
            explanation: 'Use <ul> inside <nav>',
            rule: { kind: 'selector', selector: 'nav ul', min: 1 },
          },
        ],
        hints: ['Hint 1', 'Hint 2', 'Hint 3'],
        solution: {
          files: [
            {
              name: 'index.html',
              language: 'html',
              content: '<!DOCTYPE html><html><body><nav><ul><li><a href="/">Home</a></li></ul></nav></body></html>',
            },
          ],
          explanation: 'Standard navigation structure.',
        },
      }

      const adapted = toChallenge(customCh)
      expect(adapted.id).toBe('custom:ch-test-eval')
      expect(adapted.title).toBe('Custom Navigation Challenge')
      expect(adapted.requirements.length).toBe(2)

      // Test failing code
      const failingCheck = validateChallenge(adapted, '<!DOCTYPE html><html><body><p>No nav</p></body></html>')
      expect(failingCheck.allPassed).toBe(false)
      expect(failingCheck.results.filter((r) => r.met).length).toBe(0)

      // Test passing code
      const passingCode = '<!DOCTYPE html><html><body><nav><ul><li>Link</li></ul></nav></body></html>'
      const passingCheck = validateChallenge(adapted, passingCode)
      expect(passingCheck.allPassed).toBe(true)
      expect(passingCheck.results.every((r) => r.met)).toBe(true)
    })
  })

  describe('ChallengeCreator Component UI & Multi-Step Wizard', () => {
    it('renders stepper navigation and validates Details before proceeding', () => {
      const s0 = createDefaultState()
      saveState(s0)

      render(
        <MemoryRouter>
          <AppStateProvider>
            <ChallengeCreator />
          </AppStateProvider>
        </MemoryRouter>
      )

      expect(screen.getByRole('heading', { name: 'Challenge Creator' })).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
      expect(screen.getByText('Challenge Details')).toBeInTheDocument()

      const nextBtn = screen.getByRole('button', { name: /Next: Files/i })
      // Next is disabled initially because title, prompt, and objective are empty
      expect(nextBtn).toBeDisabled()

      // Fill in details
      fireEvent.change(screen.getByLabelText(/Challenge Title/i), { target: { value: 'My Accessible Header' } })
      fireEvent.change(screen.getByLabelText(/Objective/i), { target: { value: 'Practice header structure.' } })
      fireEvent.change(screen.getByLabelText(/Prompt/i), { target: { value: 'Write an accessible header tag.' } })

      // Next button is now enabled
      expect(nextBtn).not.toBeDisabled()
      fireEvent.click(nextBtn)

      // Successfully progressed to Files step
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
      expect(screen.getByText('Starter Files')).toBeInTheDocument()
    })

    it('allows navigating back and forth across steps and manages requirements', () => {
      const s0 = createDefaultState()
      saveState(s0)

      render(
        <MemoryRouter>
          <AppStateProvider>
            <ChallengeCreator />
          </AppStateProvider>
        </MemoryRouter>
      )

      // Fill step 1
      fireEvent.change(screen.getByLabelText(/Challenge Title/i), { target: { value: 'Quick Form' } })
      fireEvent.change(screen.getByLabelText(/Objective/i), { target: { value: 'Form basics.' } })
      fireEvent.change(screen.getByLabelText(/Prompt/i), { target: { value: 'Create a form.' } })
      fireEvent.click(screen.getByRole('button', { name: /Next: Files/i }))

      // Step 2: Files has defaults, proceed to Requirements
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Next: Requirements/i }))

      // Step 3: Requirements
      expect(screen.getByText('Step 3 of 5')).toBeInTheDocument()
      expect(screen.getByText('Document has a valid HTML5 doctype')).toBeInTheDocument()

      // Add a requirement
      const descInput = screen.getByLabelText(/Requirement Description/i)
      fireEvent.change(descInput, { target: { value: 'Contains a form element' } })

      const selectorInput = screen.getByLabelText(/CSS Selector/i)
      fireEvent.change(selectorInput, { target: { value: 'form' } })

      const addBtn = screen.getByRole('button', { name: /Add Requirement/i })
      fireEvent.click(addBtn)

      // Both requirements now displayed
      expect(screen.getByText('Contains a form element')).toBeInTheDocument()

      // Back button works
      const backBtn = screen.getByRole('button', { name: /Back/i })
      fireEvent.click(backBtn)
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    })

    it('displays self-check verification and enables saving on Preview step', () => {
      const s0 = createDefaultState()
      saveState(s0)

      render(
        <MemoryRouter>
          <AppStateProvider>
            <ChallengeCreator />
          </AppStateProvider>
        </MemoryRouter>
      )

      // Step 1: Details
      fireEvent.change(screen.getByLabelText(/Challenge Title/i), { target: { value: 'Self-Check Challenge' } })
      fireEvent.change(screen.getByLabelText(/Objective/i), { target: { value: 'Semantic main tag.' } })
      fireEvent.change(screen.getByLabelText(/Prompt/i), { target: { value: 'Build a main section.' } })
      fireEvent.click(screen.getByRole('button', { name: /Next: Files/i }))

      // Step 2: Files
      fireEvent.click(screen.getByRole('button', { name: /Next: Requirements/i }))

      // Step 3: Requirements (has doctype by default, which passes against default solution)
      fireEvent.click(screen.getByRole('button', { name: /Next: Hints & Solution/i }))

      // Step 4: Hints & Solution
      expect(screen.getByText('Step 4 of 5')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Next: Preview & Test/i }))

      // Step 5: Preview & Test
      expect(screen.getByText('Step 5 of 5')).toBeInTheDocument()
      expect(screen.getByText(/Live Preview & Self-Check/i)).toBeInTheDocument()
      expect(screen.getByText(/All requirements pass against your reference solution/i)).toBeInTheDocument()

      // Save button is visible and active
      const saveBtn = screen.getByRole('button', { name: /Save Challenge/i })
      expect(saveBtn).toBeInTheDocument()
      expect(saveBtn).not.toBeDisabled()
    })
  })
})
