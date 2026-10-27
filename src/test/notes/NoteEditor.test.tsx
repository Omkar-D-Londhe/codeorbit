import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoteEditor, validateTag } from '../../core/notes/NoteEditor'
import { AppStateProvider } from '../../state/AppState'

describe('NoteEditor Component & Tag Validation', () => {
  describe('validateTag logic', () => {
    it('accepts valid lowercase alphanumeric and hyphen tags', () => {
      expect(validateTag('html5', [])).toEqual({ valid: true, tag: 'html5' })
      expect(validateTag('css-grid', [])).toEqual({ valid: true, tag: 'css-grid' })
      expect(validateTag('  flexbox  ', [])).toEqual({ valid: true, tag: 'flexbox' })
    })

    it('rejects invalid characters, uppercase conversion, and symbols', () => {
      expect(validateTag('tag with space', []).valid).toBe(false)
      expect(validateTag('tag_underscore', []).valid).toBe(false)
      expect(validateTag('tag!', []).valid).toBe(false)
    })

    it('rejects tags longer than 24 characters', () => {
      const longTag = 'a'.repeat(25)
      const res = validateTag(longTag, [])
      expect(res.valid).toBe(false)
      expect(res.error).toContain('24 characters')
    })

    it('rejects duplicate tags', () => {
      const res = validateTag('css', ['css', 'html'])
      expect(res.valid).toBe(false)
      expect(res.error).toContain('already added')
    })

    it('rejects adding more than 8 tags', () => {
      const existing = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']
      const res = validateTag('t9', existing)
      expect(res.valid).toBe(false)
      expect(res.error).toContain('Maximum of 8 tags')
    })
  })

  describe('NoteEditor UI', () => {
    it('renders textarea with character count and saving/saved status', () => {
      render(
        <AppStateProvider>
          <NoteEditor topicId="html-structure" title="Document structure" />
        </AppStateProvider>
      )

      expect(screen.getByLabelText(/your notes for/i)).toBeInTheDocument()
      expect(screen.getByText(/\/ 20,000/)).toBeInTheDocument()
      const textarea = screen.getByLabelText(/your notes for/i)
      fireEvent.change(textarea, { target: { value: 'First note' } })
      expect(screen.getByText(/Saving/)).toBeInTheDocument()
    })

    it('shows warning when text exceeds 20,000 character limit', () => {
      render(
        <AppStateProvider>
          <NoteEditor topicId="html-structure" title="Document structure" />
        </AppStateProvider>
      )

      const textarea = screen.getByLabelText(/your notes for/i)
      const longText = 'x'.repeat(20005)
      fireEvent.change(textarea, { target: { value: longText } })

      expect(screen.getByRole('alert')).toHaveTextContent(/cannot exceed 20,000 characters/i)
    })

    it('adds and removes tags with validation feedback', () => {
      render(
        <AppStateProvider>
          <NoteEditor topicId="html-structure" title="Document structure" />
        </AppStateProvider>
      )

      const tagInput = screen.getByPlaceholderText(/Add tag/i)
      const addBtn = screen.getByRole('button', { name: /add/i })

      // Add valid tag
      fireEvent.change(tagInput, { target: { value: 'semantics' } })
      fireEvent.click(addBtn)

      expect(screen.getByText('#semantics')).toBeInTheDocument()

      // Try adding invalid tag
      fireEvent.change(tagInput, { target: { value: 'invalid tag!' } })
      fireEvent.click(addBtn)
      expect(screen.getByRole('alert')).toHaveTextContent(/only contain lowercase/i)

      // Remove tag
      const removeBtn = screen.getByRole('button', { name: /remove tag semantics/i })
      fireEvent.click(removeBtn)
      expect(screen.queryByText('#semantics')).not.toBeInTheDocument()
    })
  })
})
