import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BookmarksPage from '../../core/notes/BookmarksPage'
import { AppStateProvider } from '../../state/AppState'
import { STORAGE_KEY } from '../../lib/storage'

describe('BookmarksPage Component', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders honest empty state when no bookmarks exist', () => {
    render(
      <MemoryRouter>
        <AppStateProvider>
          <BookmarksPage />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/no bookmarks yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /explore first lesson/i })).toBeInTheDocument()
  })

  it('displays folders, creates a folder, moves item, and deletes folder', () => {
    const stateFixture = {
      schemaVersion: 6,
      bookmarks: ['html-structure'],
      sectionBookmarks: ['html-structure#head-elements'],
      bookmarkFolders: [
        {
          id: 'unsorted',
          name: 'Unsorted',
          itemIds: ['html-structure', 'html-structure#head-elements'],
        },
      ],
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateFixture))

    render(
      <MemoryRouter>
        <AppStateProvider>
          <BookmarksPage />
        </AppStateProvider>
      </MemoryRouter>
    )

    // Unsorted folder and items should be visible
    expect(screen.getByRole('heading', { level: 2, name: /Unsorted/i })).toBeInTheDocument()
    expect(screen.getByText('Document structure')).toBeInTheDocument()
    expect(screen.getByText(/Section bookmark/i)).toBeInTheDocument()

    // 1. Create a new folder
    const newFolderBtn = screen.getByRole('button', { name: /new folder/i })
    fireEvent.click(newFolderBtn)

    const folderInput = screen.getByPlaceholderText(/folder name/i)
    fireEvent.change(folderInput, { target: { value: 'Favorites' } })
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }))

    expect(screen.getByRole('heading', { level: 2, name: /Favorites/i })).toBeInTheDocument()

    // 2. Move item to Favorites folder
    const moveSelect = screen.getAllByLabelText(/move to folder/i)[0] as HTMLSelectElement
    const favoritesOption = moveSelect.querySelector('option[value^="folder-"]') as HTMLOptionElement
    expect(favoritesOption).toBeTruthy()
    fireEvent.change(moveSelect, { target: { value: favoritesOption.value } })

    // 3. Rename Favorites folder
    const renameBtn = screen.getByRole('button', { name: /rename folder favorites/i })
    fireEvent.click(renameBtn)
    const renameInput = screen.getByPlaceholderText(/new folder name/i)
    fireEvent.change(renameInput, { target: { value: 'Important' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(screen.getByRole('heading', { level: 2, name: /Important/i })).toBeInTheDocument()

    // 4. Delete custom folder
    const deleteBtn = screen.getByRole('button', { name: /delete folder important/i })
    fireEvent.click(deleteBtn)
    // Confirm in dialog
    const confirmDeleteBtn = screen.getByRole('button', { name: /^delete folder$/i })
    fireEvent.click(confirmDeleteBtn)

    // Important folder should now be gone
    expect(screen.queryByRole('heading', { level: 2, name: /Important/i })).not.toBeInTheDocument()
    // Bookmarks were moved back to Unsorted
    expect(screen.getByText('Document structure')).toBeInTheDocument()
  })
})
