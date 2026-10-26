import React, { useState, useRef } from 'react'
import { useApp } from '../state/AppState'
import { useDocumentTitle } from '../lib/hooks'
import { Card, Button, Toggle, Select, ProgressBar } from '../core/ui'
import { ConfirmDialog } from '../components/Dialog'
import { useToast } from '../components/Toast'
import { buildExport, parseImport, type ImportResult } from '../core/storage/exportImport'
import { getQuotaInfo } from '../core/storage/quota'
import { dayKey } from '../core/gamification/streak'
import { DEFAULT_ATMOSPHERE_SETTINGS, DEFAULT_EDITOR_SETTINGS, type AtmosphereSettings, type EditorSettings, type EditorEngine } from '../state/types'
import type { ThemeId, AccentId, ContrastMode, MotionPreference } from '../core/settings/appearance'

export default function Settings() {
  useDocumentTitle('Settings')
  const { state, dispatch, resetAll } = useApp()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const settings = state.settings

  // Profile form state
  const [userName, setUserName] = useState(settings.userName || '')
  const [nameError, setNameError] = useState<string | null>(null)

  // Dialogs
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetInput, setResetInput] = useState('')
  const [importPreview, setImportPreview] = useState<ImportResult | null>(null)

  const quota = getQuotaInfo(state)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.length > 40) {
      setNameError('Name cannot exceed 40 characters')
      return
    }
    setNameError(null)
    setUserName(val)
    dispatch({ type: 'SET_SETTINGS', patch: { userName: val.trim() } })
  }

  const handlePaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pace = e.target.value as 'casual' | 'regular' | 'intensive'
    dispatch({ type: 'SET_SETTINGS', patch: { pace } })
    toast.show(`Learning pace updated to ${pace}.`, 'info')
  }

  const handleThemeChange = (newTheme: ThemeId) => {
    dispatch({ type: 'SET_SETTINGS', patch: { theme: newTheme } })
  }

  const handleAccentChange = (newAccent: AccentId) => {
    dispatch({ type: 'SET_SETTINGS', patch: { accent: newAccent } })
  }

  const handleContrastToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const contrast: ContrastMode = e.target.checked ? 'high' : 'normal'
    dispatch({ type: 'SET_SETTINGS', patch: { contrast } })
  }

  const handleMotionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const motion = e.target.value as MotionPreference
    dispatch({ type: 'SET_SETTINGS', patch: { motion } })
    toast.show(`Motion preference set to ${motion}.`, 'info')
  }

  const atmosphere = settings.atmosphere ?? DEFAULT_ATMOSPHERE_SETTINGS
  const editor = settings.editor ?? DEFAULT_EDITOR_SETTINGS

  const handleAtmosphereToggle = (key: keyof AtmosphereSettings, checked: boolean) => {
    const updated = {
      ...atmosphere,
      [key]: checked,
    }
    dispatch({ type: 'SET_SETTINGS', patch: { atmosphere: updated } })
  }

  const handleEditorSettingChange = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    const current = settings.editor ?? DEFAULT_EDITOR_SETTINGS
    dispatch({
      type: 'SET_SETTINGS',
      patch: {
        editor: {
          ...current,
          [key]: value,
        },
      },
    })
  }

  const handleExport = () => {
    try {
      const json = buildExport(state)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const today = dayKey(Date.now())
      a.href = url
      a.download = `codeorbit-backup-${today}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.show('Data exported successfully.', 'info')
    } catch {
      toast.show('Failed to export data.', 'warning')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const res = parseImport(text)
      if (!res.ok) {
        toast.show(res.error, 'warning')
      } else {
        setImportPreview(res)
      }
    }
    reader.readAsText(file)
    // Clear input so same file can be re-selected if needed
    e.target.value = ''
  }

  const applyImport = () => {
    if (!importPreview || !importPreview.ok) return
    dispatch({ type: 'IMPORT_STATE', state: importPreview.state })
    setImportPreview(null)
    toast.show('Backup restored successfully.')
  }

  const handleReset = () => {
    if (resetInput.trim() !== 'RESET') return
    resetAll()
    setShowResetConfirm(false)
    setResetInput('')
    toast.show('All data has been reset to defaults.', 'info')
  }

  return (
    <div className="page page--narrow settings-page" style={{ padding: 'var(--s-6) 0' }}>
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-lede">
          Customize your profile, learning pace, interface theme, and manage your progress data.
        </p>
      </header>

      <div style={{ display: 'grid', gap: 'var(--s-6)' }}>
        {/* Profile Section (14.1) */}
        <Card title="Learner Profile" eyebrow="Profile">
          <div style={{ display: 'grid', gap: 'var(--s-3)', marginTop: 'var(--s-3)' }}>
            <label htmlFor="user-name-input" className="field-label">
              Display Name
            </label>
            <input
              id="user-name-input"
              type="text"
              className="textarea"
              style={{ minHeight: '40px', height: '40px', resize: 'none' }}
              value={userName}
              onChange={handleNameChange}
              maxLength={40}
              placeholder="e.g. Astro Learner"
            />
            {nameError && <p className="muted small" style={{ color: 'var(--c-danger)' }}>{nameError}</p>}
            <p className="muted small">
              Your name is stored locally in this browser and never sent over the network. Max 40 characters.
            </p>
          </div>
        </Card>

        {/* Learning Pace (14.2) */}
        <Card title="Learning Pace" eyebrow="Goals">
          <div style={{ marginTop: 'var(--s-3)' }}>
            <Select
              id="pace-select"
              label="Preferred Pace"
              value={settings.pace || 'regular'}
              options={[
                { value: 'casual', label: 'Casual — 1 lesson / practice per day' },
                { value: 'regular', label: 'Regular — 3 lessons / practices per day (Recommended)' },
                { value: 'intensive', label: 'Intensive — 5 lessons / practices per day' }
              ]}
              onChange={handlePaceChange}
            />
          </div>
        </Card>

        {/* Appearance (1.8, 1.9) */}
        <Card title="Appearance" eyebrow="Theme & Accents">
          <div style={{ display: 'grid', gap: 'var(--s-5)', marginTop: 'var(--s-3)' }}>
            <div>
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend className="field-label">Theme</legend>
                <div style={{ display: 'flex', gap: 'var(--s-4)', flexWrap: 'wrap', marginTop: 'var(--s-1)' }}>
                  {[
                    { id: 'obsidian', label: 'Obsidian (Dark)' },
                    { id: 'starlight', label: 'Starlight (Light)' },
                    { id: 'aurora', label: 'Aurora (Teal Dark)' }
                  ].map((t) => (
                    <label key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="theme-choice"
                        value={t.id}
                        checked={settings.theme === t.id}
                        onChange={() => handleThemeChange(t.id as ThemeId)}
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div>
              <Select
                id="accent-select"
                label="Accent Color"
                value={settings.accent || 'violet'}
                options={[
                  { value: 'violet', label: 'Violet (Default)' },
                  { value: 'teal', label: 'Teal' },
                  { value: 'amber', label: 'Amber' },
                  { value: 'rose', label: 'Rose' },
                  { value: 'azure', label: 'Azure' }
                ]}
                onChange={(e) => handleAccentChange(e.target.value as AccentId)}
              />
            </div>

            <div>
              <Select
                id="motion-select"
                label="Motion & Animation"
                value={settings.motion || 'system'}
                options={[
                  { value: 'system', label: 'Match System (Follows OS setting)' },
                  { value: 'reduced', label: 'Reduced Motion (Disable decorative animations)' },
                  { value: 'full', label: 'Full Motion (Enable all cinematic effects)' },
                ]}
                onChange={handleMotionChange}
              />
            </div>

            <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
              <Toggle
                label="High Contrast Mode"
                description="Increases text and border contrast (≥ 12:1) and removes glass transparency."
                checked={settings.contrast === 'high'}
                onChange={handleContrastToggle}
              />
            </div>
          </div>
        </Card>

        {/* Motivation & Gamification (Stage 11: P-04) */}
        <Card title="Motivation & Gamification" eyebrow="Learning Experience">
          <div style={{ display: 'grid', gap: 'var(--s-4)', marginTop: 'var(--s-3)' }}>
            <Toggle
              label="Show XP and achievements"
              description="Displays XP level progression, achievement badges, and personal best records. When disabled, gamification UI is hidden while your progress data remains safely preserved. Daily challenges remain accessible."
              checked={settings.gamificationEnabled !== false}
              onChange={(e) => {
                dispatch({ type: 'SET_SETTINGS', patch: { gamificationEnabled: e.target.checked } })
                toast.show(
                  e.target.checked
                    ? 'XP and achievements enabled.'
                    : 'Gamification interface hidden. Your progress data is preserved.',
                  'info'
                )
              }}
            />
          </div>
        </Card>

        {/* Atmosphere & Celestial Layers (Stage 04: 1.1, 1.2, 1.3, 1.6) */}
        <Card title="Celestial Atmosphere" eyebrow="Atmosphere & Effects">
          <div style={{ display: 'grid', gap: 'var(--s-4)', marginTop: 'var(--s-3)' }}>
            <Toggle
              label="Dynamic Nebula Background"
              description="Deep space gradients with restrained drift on dashboard and track map."
              checked={atmosphere.nebula}
              onChange={(e) => handleAtmosphereToggle('nebula', e.target.checked)}
            />
            <Toggle
              label="Constellation Grid Overlay"
              description="Faint astronomical coordinate grid with subtle cursor proximity glow."
              checked={atmosphere.grid}
              onChange={(e) => handleAtmosphereToggle('grid', e.target.checked)}
            />
            <Toggle
              label="Cursor Glow & Parallax Aura"
              description="Subtle accent glow trailing pointer movements (mouse/trackpad only)."
              checked={atmosphere.cursorGlow}
              onChange={(e) => handleAtmosphereToggle('cursorGlow', e.target.checked)}
            />
            <Toggle
              label="Ambient Particle Field"
              description="Floating micro-starlight dust on dashboard (opt-in)."
              checked={atmosphere.particles}
              onChange={(e) => handleAtmosphereToggle('particles', e.target.checked)}
            />
          </div>
        </Card>

        {/* Editor Preferences (Stage 05: 6.1, 14.5) */}
        <Card title="Editor" eyebrow="Practice & Workspace">
          <div id="editor" style={{ display: 'grid', gap: 'var(--s-4)', marginTop: 'var(--s-3)' }}>
            <Select
              id="editor-engine-select"
              label="Editor Engine"
              value={editor.engine}
              options={[
                { value: 'codemirror', label: 'CodeMirror 6 (Syntax highlighting, auto-close)' },
                { value: 'plain', label: 'Plain Text (Lightweight textarea)' },
              ]}
              onChange={(e) => handleEditorSettingChange('engine', e.target.value as EditorEngine)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-4)' }}>
              <Select
                id="editor-font-size-select"
                label="Font Size"
                value={String(editor.fontSize)}
                options={[
                  { value: '12', label: '12px — Compact' },
                  { value: '14.4', label: '14.4px — Standard' },
                  { value: '16', label: '16px — Large' },
                  { value: '18', label: '18px — Extra Large' },
                ]}
                onChange={(e) => handleEditorSettingChange('fontSize', parseFloat(e.target.value))}
              />

              <Select
                id="editor-tab-size-select"
                label="Tab Indentation"
                value={String(editor.tabSize)}
                options={[
                  { value: '2', label: '2 spaces (HTML standard)' },
                  { value: '4', label: '4 spaces' },
                  { value: '8', label: '8 spaces' },
                ]}
                onChange={(e) => handleEditorSettingChange('tabSize', parseInt(e.target.value, 10))}
              />
            </div>

            <Toggle
              label="Line Numbers"
              description="Show line-number gutter on the left side of the code editor."
              checked={editor.lineNumbers}
              onChange={(e) => handleEditorSettingChange('lineNumbers', e.target.checked)}
            />

            <Toggle
              label="Soft Line Wrapping"
              description="Wrap long lines to fit within the editor viewport without horizontal scrolling."
              checked={editor.wrap}
              onChange={(e) => handleEditorSettingChange('wrap', e.target.checked)}
            />

            <Toggle
              label="Tab Inserts Indentation"
              description="When enabled, pressing Tab indents code instead of focusing the next element. (Press Esc then Tab to exit the editor)."
              checked={editor.tabCapturesFocus}
              onChange={(e) => handleEditorSettingChange('tabCapturesFocus', e.target.checked)}
            />

            <Toggle
              label="Auto-Close Tags and Quotes"
              description="Automatically close HTML tags and quote pairs as you type."
              checked={editor.autoClose}
              onChange={(e) => handleEditorSettingChange('autoClose', e.target.checked)}
            />
          </div>
        </Card>

        {/* Data Management (14.4, 16.4) */}
        <Card title="Data Management" eyebrow="Backup & Storage">
          <div style={{ display: 'grid', gap: 'var(--s-5)', marginTop: 'var(--s-3)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="field-label">Storage Usage</span>
                <span className="muted small">{quota.formatted}</span>
              </div>
              <ProgressBar value={quota.bytes} max={quota.budget} />
              {quota.level === 'warn' && (
                <p className="muted small" style={{ color: 'var(--c-warning)', marginTop: '6px' }}>
                  Storage is above 80% capacity. We recommend downloading a backup of your data.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={handleExport}>
                Export Backup (.json)
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Import Backup
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 'var(--s-4)' }}>
              <div className="field-label" style={{ color: 'var(--c-danger)' }}>Danger Zone</div>
              <p className="muted small" style={{ marginBottom: 'var(--s-3)' }}>
                Resetting clears all topics, quiz history, drafts, notes, bookmarks, and activity records.
              </p>
              <Button variant="danger-ghost" onClick={() => setShowResetConfirm(true)}>
                Reset All Learning Data
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Import Preview Dialog */}
      <ConfirmDialog
        open={Boolean(importPreview && importPreview.ok)}
        title="Restore Backup"
        confirmLabel="Restore Data"
        onConfirm={applyImport}
        onCancel={() => setImportPreview(null)}
      >
        {importPreview && importPreview.ok && (
          <div style={{ display: 'grid', gap: '8px' }}>
            <p>Restoring will replace your current progress with the backup content:</p>
            <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
              <li>Topics progress: {importPreview.summary.topicsTouched}</li>
              <li>Saved notes: {importPreview.summary.notesCount}</li>
              <li>Bookmarks: {importPreview.summary.bookmarksCount}</li>
              <li>Error notebook items: {importPreview.summary.errorsCount}</li>
              <li>Active days recorded: {importPreview.summary.activityDaysCount}</li>
            </ul>
            <p className="muted small">Are you sure you want to proceed?</p>
          </div>
        )}
      </ConfirmDialog>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowResetConfirm(false) }}>
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title">
            <h3 id="reset-dialog-title" className="dialog__title" style={{ color: 'var(--c-danger)' }}>
              Confirm Reset
            </h3>
            <p className="dialog__body">
              This action cannot be undone. To confirm resetting all progress, please type <strong>RESET</strong> in the box below:
            </p>
            <div style={{ marginTop: 'var(--s-3)' }}>
              <input
                type="text"
                className="textarea"
                style={{ height: '38px', minHeight: '38px' }}
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="Type RESET"
                aria-label="Type RESET to confirm"
              />
            </div>
            <div className="dialog__actions">
              <Button variant="ghost" onClick={() => { setShowResetConfirm(false); setResetInput('') }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={resetInput.trim() !== 'RESET'}
                onClick={handleReset}
              >
                Reset Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
