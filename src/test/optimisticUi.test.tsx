import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider, useApp } from '../state/AppState'
import { ToastProvider } from '../components/Toast'
import { reducer } from '../state/reducer'
import { createDefaultState, saveState } from '../lib/storage'
import Review from '../pages/Review'
import NotesPage from '../core/notes/NotesPage'
import type { ErrorEntry, NoteRecord } from '../state/types'

describe('Optimistic UI & Destructive Rollback (16.2)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reducer handles RESTORE_ERROR idempotently', () => {
    const s0 = createDefaultState()
    const error: ErrorEntry = {
      id: 'err-1',
      source: 'quiz',
      topicId: 'html-structure',
      refId: 'q-1',
      title: 'CSS Box Model',
      detail: 'Remember border-box',
      status: 'open',
      createdAt: 1000,
    }

    const s1 = reducer(s0, { type: 'ADD_ERROR', entry: error })
    expect(s1.errorNotebook).toHaveLength(1)

    const s2 = reducer(s1, { type: 'DELETE_ERROR', id: 'err-1' })
    expect(s2.errorNotebook).toHaveLength(0)

    const s3 = reducer(s2, { type: 'RESTORE_ERROR', entry: error })
    expect(s3.errorNotebook).toHaveLength(1)
    expect(s3.errorNotebook[0].id).toBe('err-1')

    // Idempotent: restoring again does not duplicate
    const s4 = reducer(s3, { type: 'RESTORE_ERROR', entry: error })
    expect(s4.errorNotebook).toHaveLength(1)
  })

  it('reducer handles RESTORE_NOTE successfully', () => {
    const s0 = createDefaultState()
    const note: NoteRecord = {
      text: 'My important note on forms',
      format: 'markdown',
      tags: ['forms', 'html'],
      updatedAt: 2000,
    }

    const s1 = reducer(s0, { type: 'SET_NOTE', topicId: 'forms', text: note.text, now: note.updatedAt, tags: note.tags })
    expect(s1.notes.forms?.text).toBe('My important note on forms')

    const s2 = reducer(s1, { type: 'SET_NOTE', topicId: 'forms', text: '', now: 3000 })
    expect(s2.notes.forms).toBeUndefined()

    const s3 = reducer(s2, { type: 'RESTORE_NOTE', topicId: 'forms', note })
    expect(s3.notes.forms?.text).toBe('My important note on forms')
    expect(s3.notes.forms?.tags).toEqual(['forms', 'html'])
  })

  it('deleting an error entry from Review shows an Undo toast, and clicking Undo restores it', () => {
    const initial = createDefaultState()
    const error: ErrorEntry = {
      id: 'err-test',
      source: 'quiz',
      topicId: 'html-structure',
      refId: 'q-test',
      title: 'Test Syntax Error',
      detail: 'Test detail',
      status: 'open',
      createdAt: Date.now(),
    }
    initial.errorNotebook = [error]
    saveState(initial)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <Review />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Entry title appears
    expect(screen.getByText('Test Syntax Error')).toBeInTheDocument()

    // Click delete button on card
    const deleteBtn = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(deleteBtn)

    // Confirm dialog appears
    const confirmBtn = screen.getByRole('button', { name: 'Delete entry' })
    fireEvent.click(confirmBtn)

    // Optimistically removed
    expect(screen.queryByText('Test Syntax Error')).not.toBeInTheDocument()

    // Undo toast is visible
    const undoBtn = screen.getByRole('button', { name: 'Undo' })
    expect(undoBtn).toBeInTheDocument()

    // Click Undo
    fireEvent.click(undoBtn)

    // Restored in place!
    expect(screen.getByText('Test Syntax Error')).toBeInTheDocument()
  })

  it('deleting a note from NotesPage shows an Undo toast, and clicking Undo restores it', () => {
    const initial = createDefaultState()
    initial.notes = {
      'html-structure': {
        text: 'Structure is the foundation of HTML documents',
        format: 'markdown',
        tags: ['foundations'],
        updatedAt: Date.now(),
      },
    }
    saveState(initial)

    render(
      <MemoryRouter>
        <AppStateProvider>
          <ToastProvider>
            <NotesPage />
          </ToastProvider>
        </AppStateProvider>
      </MemoryRouter>
    )

    // Note appears
    expect(screen.getByText(/Structure is the foundation/i)).toBeInTheDocument()

    // Click delete button
    const deleteBtn = screen.getByRole('button', { name: /Delete note for Document structure/i })
    fireEvent.click(deleteBtn)

    // Confirm dialog appears; confirm deletion
    const confirmDialogBtn = screen.getAllByRole('button', { name: 'Delete note' })[0]
    fireEvent.click(confirmDialogBtn)

    // Optimistically removed
    expect(screen.queryByText(/Structure is the foundation/i)).not.toBeInTheDocument()

    // Undo toast is visible
    const undoBtn = screen.getByRole('button', { name: 'Undo' })
    expect(undoBtn).toBeInTheDocument()

    // Click Undo
    fireEvent.click(undoBtn)

    // Restored!
    expect(screen.getByText(/Structure is the foundation/i)).toBeInTheDocument()
  })

  it('rolls back state automatically if persistence fails during a destructive operation', () => {
    const initial = createDefaultState()
    const error: ErrorEntry = {
      id: 'err-rollback',
      source: 'quiz',
      topicId: 'html-structure',
      refId: 'q-rollback',
      title: 'Rollback Test',
      detail: 'Will be restored on failure',
      status: 'open',
      createdAt: 100,
    }
    initial.errorNotebook = [error]
    saveState(initial)

    function Consumer() {
      const { state, dispatch, flush, saveStatus } = useApp()
      return (
        <div>
          <span data-testid="error-count">{state.errorNotebook.length}</span>
          <span data-testid="save-kind">{saveStatus.kind}</span>
          <button onClick={() => dispatch({ type: 'DELETE_ERROR', id: 'err-rollback' })}>Delete</button>
          <button onClick={() => flush()}>Flush</button>
        </div>
      )
    }

    render(
      <AppStateProvider>
        <Consumer />
      </AppStateProvider>
    )

    expect(screen.getByTestId('error-count').textContent).toBe('1')

    // Optimistic delete happens immediately
    act(() => {
      screen.getByText('Delete').click()
    })
    expect(screen.getByTestId('error-count').textContent).toBe('0')

    // Simulate storage failure during flush
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    act(() => {
      screen.getByText('Flush').click()
    })

    // Rollback restored the error entry and save status is error
    expect(screen.getByTestId('save-kind').textContent).toBe('error')
    expect(screen.getByTestId('error-count').textContent).toBe('1')

    setItemSpy.mockRestore()
  })
})
