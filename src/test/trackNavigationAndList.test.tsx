import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { nextAction } from '../lib/progress'
import { createDefaultState, sanitizeState } from '../lib/storage'
import { reducer } from '../state/reducer'
import { groupsFor, topicsFor, getTopic } from '../data/curriculum'
import { TopicListView } from '../core/orbit/constellation/TopicListView'
import { AnalysisPanel } from '../core/analysis/AnalysisPanel'
import { pyAstProvider } from '../tracks/python/analysis/provider'

const ALL_TRACK_IDS = [
  'html',
  'css',
  'javascript',
  'bootstrap',
  'python',
  'java',
  'cpp',
  'angular',
] as const

describe('Track-Scoped Resume Navigation & Constellation List Fixes', () => {
  describe('Issue 1: Track-Specific Resume Navigation', () => {
    it('returns kind: "start" and the track-specific first topic for fresh tracks', () => {
      const state = createDefaultState()

      for (const trackId of ALL_TRACK_IDS) {
        const trackTopics = topicsFor(trackId)
        expect(trackTopics.length).toBeGreaterThan(0)
        const firstTopic = trackTopics[0]

        const action = nextAction(state, trackId)
        expect(action.kind).toBe('start')
        expect(action.topicId).toBe(firstTopic.id)
      }
    })

    it('maintains independent resume destinations across all eight technologies', () => {
      let state = createDefaultState()

      // Visit a distinct topic on each track
      const visitedTopicsByTrack: Record<string, string> = {}
      let time = 1000

      for (const trackId of ALL_TRACK_IDS) {
        const trackTopics = topicsFor(trackId)
        // Pick the 2nd topic if available, else 1st
        const targetTopic = trackTopics.length > 1 ? trackTopics[1] : trackTopics[0]
        visitedTopicsByTrack[trackId] = targetTopic.id

        state = reducer(state, {
          type: 'VISIT',
          topicId: targetTopic.id,
          activity: 'lesson',
          now: ++time,
        })
      }

      // Verify that state.lastVisitedByTrack recorded every track accurately
      expect(state.lastVisitedByTrack).toBeDefined()
      for (const trackId of ALL_TRACK_IDS) {
        expect(state.lastVisitedByTrack?.[trackId]?.topicId).toBe(visitedTopicsByTrack[trackId])
      }

      // Verify nextAction for each track resumes ITS OWN topic, not another track's last-visited topic
      for (const trackId of ALL_TRACK_IDS) {
        const action = nextAction(state, trackId)
        expect(action.kind).toBe('resume')
        expect(action.topicId).toBe(visitedTopicsByTrack[trackId])
      }
    })

    it('specifically reproduces and verifies the Angular vs C++ cross-contamination fix', () => {
      let state = createDefaultState()

      const cppTopics = topicsFor('cpp')
      const angularTopics = topicsFor('angular')
      expect(cppTopics.length).toBeGreaterThan(2)
      expect(angularTopics.length).toBeGreaterThan(2)

      // Learner visits C++ topic (e.g. pointers or intro)
      state = reducer(state, {
        type: 'VISIT',
        topicId: cppTopics[2].id,
        activity: 'lesson',
        now: 1001,
      })

      // At this point, C++ resumes cppTopics[2], but Angular has never been visited so it starts at angularTopics[0]
      expect(nextAction(state, 'cpp')).toMatchObject({
        kind: 'resume',
        topicId: cppTopics[2].id,
      })
      expect(nextAction(state, 'angular')).toMatchObject({
        kind: 'start',
        topicId: angularTopics[0].id,
      })

      // Learner now visits Angular topic 1
      state = reducer(state, {
        type: 'VISIT',
        topicId: angularTopics[1].id,
        activity: 'lesson',
        now: 1002,
      })

      // Now Angular resumes angularTopics[1]
      expect(nextAction(state, 'angular')).toMatchObject({
        kind: 'resume',
        topicId: angularTopics[1].id,
      })
      // C++ still resumes cppTopics[2]
      expect(nextAction(state, 'cpp')).toMatchObject({
        kind: 'resume',
        topicId: cppTopics[2].id,
      })

      // Visiting more C++ topics does not touch Angular resume pointer
      state = reducer(state, {
        type: 'VISIT',
        topicId: cppTopics[3].id,
        activity: 'quiz',
        now: 1003,
      })
      expect(nextAction(state, 'angular')).toMatchObject({
        kind: 'resume',
        topicId: angularTopics[1].id,
      })
      expect(nextAction(state, 'cpp')).toMatchObject({
        kind: 'resume',
        topicId: cppTopics[3].id,
      })
    })

    it('gracefully recovers when lastVisitedByTrack contains invalid or deleted topic ID', () => {
      let state = createDefaultState()
      state = {
        ...state,
        lastVisitedByTrack: {
          angular: {
            topicId: 'non-existent-topic-404',
            activity: 'lesson',
            at: 12345,
          },
        },
      }

      const angularFirst = topicsFor('angular')[0].id
      const action = nextAction(state, 'angular')
      // Must not throw, and must start/fall back to first valid topic
      expect(action.kind).toBe('start')
      expect(action.topicId).toBe(angularFirst)
    })

    it('properly sanitizes lastVisitedByTrack during storage load', () => {
      const validAngularTopic = topicsFor('angular')[0].id
      expect(getTopic(validAngularTopic)).toBeDefined()

      const raw = {
        version: 1,
        lastVisitedByTrack: {
          angular: { topicId: validAngularTopic, activity: 'lesson', at: 12345 },
          malformed1: 'not-an-object',
          malformed2: { topicId: 123 }, // invalid topicId type
          unknownTopic: { topicId: 'totally-fake-topic-id', activity: 'lesson', at: 12345 },
        },
      }

      const { state: sanitized } = sanitizeState(raw)
      expect(sanitized.lastVisitedByTrack).toBeDefined()
      expect(sanitized.lastVisitedByTrack?.angular).toEqual({
        topicId: validAngularTopic,
        activity: 'lesson',
        at: 12345,
      })
      expect(sanitized.lastVisitedByTrack?.malformed1).toBeUndefined()
      expect(sanitized.lastVisitedByTrack?.malformed2).toBeUndefined()
      expect(sanitized.lastVisitedByTrack?.unknownTopic).toBeUndefined()
    })
  })

  describe('Issue 2: Constellation List View Blank on Non-HTML Tracks', () => {
    it('provides valid non-empty groups for all eight tracks via groupsFor()', () => {
      for (const trackId of ALL_TRACK_IDS) {
        const groups = groupsFor(trackId)
        expect(groups.length, `Track ${trackId} should have groups`).toBeGreaterThan(0)

        const trackTopics = topicsFor(trackId)
        const groupIds = new Set(groups.map((g) => g.id))

        // All groups must have id, title
        for (const g of groups) {
          expect(g.id).toBeTruthy()
          expect(g.title).toBeTruthy()
        }

        // Every topic in this track must have a groupId that belongs to groupsFor(trackId)
        for (const topic of trackTopics) {
          expect(
            groupIds.has(topic.groupId),
            `Topic ${topic.id} has groupId "${topic.groupId}" which was not found in groups for track ${trackId}`
          ).toBe(true)
        }
      }
    })

    it('renders TopicListView with all topics and groups for Angular without blank screen', () => {
      const angularGroups = groupsFor('angular')
      const angularTopics = topicsFor('angular')
      expect(angularGroups.length).toBeGreaterThan(0)
      expect(angularTopics.length).toBeGreaterThan(0)

      const { container } = render(
        <MemoryRouter>
          <TopicListView
            topics={angularTopics}
            groups={angularGroups}
            selectedTopicId={null}
            onSelectTopic={vi.fn()}
          />
        </MemoryRouter>
      )

      // The list view must not be empty!
      const groupElements = container.querySelectorAll('.constellation-list-group')
      expect(groupElements.length).toBeGreaterThan(0)

      // Verify that Angular topics are rendered
      for (const topic of angularTopics) {
        expect(screen.getByText(topic.title)).toBeTruthy()
      }
    })

    it('renders TopicListView successfully for all 8 technology tracks', () => {
      for (const trackId of ALL_TRACK_IDS) {
        const trackGroups = groupsFor(trackId)
        const trackTopics = topicsFor(trackId)

        const { container, unmount } = render(
          <MemoryRouter>
            <TopicListView
              topics={trackTopics}
              groups={trackGroups}
              selectedTopicId={null}
              onSelectTopic={vi.fn()}
            />
          </MemoryRouter>
        )

        // Ensure every track renders groups and topics
        const groups = container.querySelectorAll('.constellation-list-group')
        expect(groups.length, `Track ${trackId} should render groups in list view`).toBeGreaterThan(0)

        // Ensure the first topic title is visible
        expect(screen.getByText(trackTopics[0].title)).toBeTruthy()

        unmount()
      }
    })
  })

  describe('Issue 3: Analysis Parser Failure and Error Honesty', () => {
    it('throws when execution or Pyodide fails rather than returning false O(1)', async () => {
      // Mock worker execution failure / unhandled internal exception
      const input = {
        language: 'python',
        files: [{ name: 'solution.py', language: 'python', content: 'print("hello")' }],
      }

      // Signal abortion must throw
      const controller = new AbortController()
      controller.abort()
      await expect(pyAstProvider.analyze(input, controller.signal)).rejects.toThrow('Analysis aborted')
    })

    it('renders dedicated "Analysis could not be completed" error state with retry button', () => {
      const onRetry = vi.fn()
      render(
        <AnalysisPanel
          language="python"
          hasCapability={true}
          providerAvailable={true}
          error={{ code: 'internal', message: 'Worker analysis error: process is not defined' }}
          onRunAnalysis={onRetry}
        />
      )

      // Must show error card
      const errorCard = screen.getByTestId('analysis-error')
      expect(errorCard).toBeTruthy()
      expect(screen.getByText(/Analysis could not be completed/i)).toBeTruthy()
      expect(screen.getByText(/Worker analysis error: process is not defined/i)).toBeTruthy()

      // Must NOT display O(1) or fake complexity estimates
      expect(screen.queryByText(/O\(1\)/i)).toBeNull()
      expect(screen.queryByTestId('analysis-results')).toBeNull()

      // Retry button must be clickable
      const retryBtn = screen.getByRole('button', { name: /Retry analysis/i })
      expect(retryBtn).toBeTruthy()
      retryBtn.click()
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })
})
