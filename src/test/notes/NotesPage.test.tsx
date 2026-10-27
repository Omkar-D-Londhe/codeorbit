import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotesPage from '../../core/notes/NotesPage'
import { AppStateProvider } from '../../state/AppState'
import { STORAGE_KEY } from '../../lib/storage'

describe('NotesPage Component', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders honest empty state when no notes exist', () => {
    render(
      <MemoryRouter>
        <AppStateProvider>
          <NotesPage />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Write your first note from any topic/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open first lesson/i })).toBeInTheDocument()
  })

  it('renders notes list with tags and allows filtering and search', () => {
    const stateFixture = {
      schemaVersion: 6,
      notes: {
        'html-structure': {
          text: '# Structure\nUse semantic tags like main and header.',
          format: 'markdown',
          tags: ['semantics', 'html'],
          updatedAt: 1000,
        },
        'lists': {
          text: 'Remember ul is unordered and ol is ordered.',
          format: 'markdown',
          tags: ['lists'],
          updatedAt: 2000,
        },
      },
      bookmarks: [],
      bookmarkFolders: [],
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateFixture))

    render(
      <MemoryRouter>
        <AppStateProvider>
          <NotesPage />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Document structure')).toBeInTheDocument()
    expect(screen.getByText('Lists')).toBeInTheDocument()
    expect(screen.getByText('Use semantic tags like main and header.')).toBeInTheDocument()

    // Filter by tag #lists
    const listsTagBtn = screen.getByRole('button', { name: /#lists \(1\)/i })
    fireEvent.click(listsTagBtn)

    expect(screen.getByText('Lists')).toBeInTheDocument()
    expect(screen.queryByText('Document structure')).not.toBeInTheDocument()

    // Clear tag filter by clicking All
    const allTagBtn = screen.getByRole('button', { name: /All \(2\)/i })
    fireEvent.click(allTagBtn)
    expect(screen.getByText('Document structure')).toBeInTheDocument()

    // Search query
    const searchInput = screen.getByPlaceholderText(/search notes, topics, tags/i)
    fireEvent.change(searchInput, { target: { value: 'ordered' } })

    expect(screen.getByText('Lists')).toBeInTheDocument()
    expect(screen.queryByText('Document structure')).not.toBeInTheDocument()
  })
})
