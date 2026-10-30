import React, { useState, useRef } from 'react'
import { useApp } from '../state/AppState'
import { useDocumentTitle } from '../lib/hooks'
import { Card, Button, Toggle, Select, ProgressBar } from '../core/ui'
import { ConfirmDialog } from '../components/Dialog'
import { useToast } from '../components/Toast'
import { buildExport, parseImport, type ImportResult } from '../core/storage/exportImport'
import { getQuotaInfo } from '../core/storage/quota'
import { dayKey } from '../core/gamification/streak'
import {
  DEFAULT_ATMOSPHERE_SETTINGS,
  DEFAULT_EDITOR_SETTINGS,
  DEFAULT_REMINDER_SETTINGS,
  type AtmosphereSettings,
  type EditorSettings,
  type EditorEngine,
  type FontScale,
} from '../state/types'
import type { ThemeId, AccentId, ContrastMode, MotionPreference } from '../core/settings/appearance'
import { loadDyslexiaFont } from '../core/a11y/dyslexiaFont'
import { Icon } from '../components/Icon'
import { useTour } from '../core/onboarding/Tour'
import { getExternalServices } from '../core/services/registry'

const FONT_SCALE_STEPS: FontScale[] = [0.875, 1, 1.125, 1.25, 1.5]
const FONT_SCALE_PERCENTAGES: Record<FontScale, string> = {
  0.875: '87.5%',
  1: '100%',
  1.125: '112.5%',
  1.25: '125%',
  1.5: '150%',
}

export default function Settings() {
  useDocumentTitle('Settings')
  const { state, dispatch, resetAll } = useApp()
  const toast = useToast()
  const { startTour } = useTour()
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

  const currentScale = settings.fontScale ?? 1
  const currentScaleIndex = FONT_SCALE_STEPS.indexOf(currentScale) >= 0 ? FONT_SCALE_STEPS.indexOf(currentScale) : 1

  const handleFontScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10)
    const newScale = FONT_SCALE_STEPS[idx] ?? 1
    dispatch({ type: 'SET_SETTINGS', patch: { fontScale: newScale } })
  }

  const handleDyslexiaToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    if (checked) {
      await loadDyslexiaFont()
    }
    dispatch({ type: 'SET_SETTINGS', patch: { dyslexiaFont: checked } })
    toast.show(
      checked
        ? 'Dyslexia-friendly font enabled (Atkinson Hyperlegible).'
        : 'Default interface typography restored.',
      'info'
    )
  }

  const handleAnnouncementsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SETTINGS', patch: { announcements: e.target.checked } })
    toast.show(
      e.target.checked
        ? 'Screen-reader progress announcements enabled.'
        : 'Screen-reader progress announcements disabled.',
      'info'
    )
  }

  const handleNotificationRequest = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.show('Browser notifications are not supported in this environment. In-app reminders will still appear.', 'warning')
      return
    }
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.show('Browser notification permission granted! Reminders appear when CodeOrbit is open.', 'info')
      } else {
        toast.show('Notification permission not granted. In-app reminders will continue to display.', 'warning')
      }
    } catch {
      toast.show('Unable to request notification permission. In-app reminders will continue to display.', 'warning')
    }
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
        <div data-concept-id="fc-07" className="settings-section">
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
        </div>

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
              {settings.contrast === 'high' && (
                <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--c-surface-1)', border: '2px solid var(--c-border-strong)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ padding: '6px 12px', background: 'var(--c-bg)', color: 'var(--c-text)', border: '1px solid var(--c-border)', fontWeight: 600, fontSize: '12px' }}>
                    Text: High Contrast (≥ 12:1)
                  </div>
                  <div style={{ padding: '6px 12px', background: 'var(--c-surface-2)', color: 'var(--c-accent)', border: '2px solid var(--c-focus)', fontWeight: 600, fontSize: '12px' }}>
                    Focus & Border (≥ 4.5:1)
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Accessibility & Inclusivity (Stage 16: 13.1, 13.2, 13.3, 13.4, 14.3) */}
        <Card title="Accessibility & Inclusivity" eyebrow="Sensory & Interaction Control">
          <div style={{ display: 'grid', gap: 'var(--s-5)', marginTop: 'var(--s-3)' }}>
            {/* 13.1 Font Size Scaler */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-1)' }}>
                <label htmlFor="font-scale-slider" className="field-label" style={{ margin: 0 }}>
                  Font Size Scale
                </label>
                <span className="small muted" style={{ fontWeight: 600 }}>
                  {FONT_SCALE_PERCENTAGES[currentScale]} {currentScale === 1 ? '(Default)' : ''}
                </span>
              </div>
              <p className="muted small" id="font-scale-desc" style={{ margin: '0 0 var(--s-2)' }}>
                Scales interface and curriculum reading size from 87.5% to 150% in five steps.
              </p>
              <input
                type="range"
                id="font-scale-slider"
                aria-label="Font Size Scale"
                aria-describedby="font-scale-desc"
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={currentScaleIndex}
                aria-valuetext={FONT_SCALE_PERCENTAGES[currentScale]}
                min={0}
                max={4}
                step={1}
                value={currentScaleIndex}
                onChange={handleFontScaleChange}
                list="font-scale-ticks"
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <datalist id="font-scale-ticks">
                <option value={0} label="87.5%" />
                <option value={1} label="100%" />
                <option value={2} label="112.5%" />
                <option value={3} label="125%" />
                <option value={4} label="150%" />
              </datalist>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--c-text-muted)', marginTop: '4px' }}>
                <span>87.5%</span>
                <span>100%</span>
                <span>112.5%</span>
                <span>125%</span>
                <span>150%</span>
              </div>
              <div className="card card--quiet" style={{ marginTop: 'var(--s-3)', padding: 'var(--s-3)' }} aria-label="Font scale preview">
                <p className="small muted" style={{ margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}>
                  Live Reading Sample
                </p>
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  The quick brown fox jumps over the lazy dog. CodeOrbit makes web development accessible to everyone.
                </p>
              </div>
            </div>

            {/* 13.2 Dyslexia-Friendly Font */}
            <Toggle
              label="Dyslexia-Friendly Font (Atkinson Hyperlegible)"
              description="Swaps the primary interface font to Atkinson Hyperlegible, emphasizing distinct letterforms to reduce character confusion. Code blocks remain strictly monospaced."
              checked={!!settings.dyslexiaFont}
              onChange={handleDyslexiaToggle}
            />

            {/* 13.4 Screen-Reader Progress Announcements */}
            <Toggle
              label="Screen-Reader Progress Announcements"
              description="Automatically announces milestone updates (lessons completed, quizzes passed, badges earned, and level ups) to assistive technology via ARIA live regions."
              checked={settings.announcements !== false}
              onChange={handleAnnouncementsToggle}
            />

            {/* 14.3 Local Study Reminders */}
            <div>
              <Toggle
                label="Daily Study Reminders (Local)"
                description="Receive a reminder banner when opening CodeOrbit on scheduled study days. Operates entirely locally on this device."
                checked={!!settings.reminders?.enabled}
                onChange={(e) => {
                  const enabled = e.target.checked
                  dispatch({
                    type: 'SET_SETTINGS',
                    patch: {
                      reminders: {
                        ...(settings.reminders || DEFAULT_REMINDER_SETTINGS),
                        enabled,
                      },
                    },
                  })
                }}
              />

              {settings.reminders?.enabled && (
                <div style={{ display: 'grid', gap: 'var(--s-3)', marginTop: 'var(--s-3)', paddingLeft: 'var(--s-4)', borderLeft: '2px solid var(--c-border)' }}>
                  <div>
                    <label htmlFor="reminder-time-input" className="field-label">
                      Preferred Practice Time
                    </label>
                    <p className="muted small" id="reminder-time-desc" style={{ margin: '0 0 var(--s-1)' }}>
                      Time of day to prompt for your daily learning session.
                    </p>
                    <input
                      type="time"
                      id="reminder-time-input"
                      aria-label="Reminder time"
                      aria-describedby="reminder-time-desc"
                      value={settings.reminders?.time || '18:00'}
                      onChange={(e) => {
                        dispatch({
                          type: 'SET_SETTINGS',
                          patch: {
                            reminders: {
                              ...(settings.reminders || DEFAULT_REMINDER_SETTINGS),
                              time: e.target.value,
                            },
                          },
                        })
                      }}
                      className="form-input"
                      style={{ maxWidth: '160px' }}
                    />
                  </div>

                  <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                    <legend className="field-label">Scheduled Study Days</legend>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'var(--s-1)' }}>
                      {[
                        { day: 0, label: 'Sun' },
                        { day: 1, label: 'Mon' },
                        { day: 2, label: 'Tue' },
                        { day: 3, label: 'Wed' },
                        { day: 4, label: 'Thu' },
                        { day: 5, label: 'Fri' },
                        { day: 6, label: 'Sat' },
                      ].map(({ day, label }) => {
                        const isChecked = (settings.reminders?.days || []).includes(day)
                        return (
                          <label key={day} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              aria-label={`Remind on ${label}`}
                              checked={isChecked}
                              onChange={(e) => {
                                const currentDays = settings.reminders?.days || []
                                const newDays = e.target.checked
                                  ? [...currentDays, day].sort((a, b) => a - b)
                                  : currentDays.filter((d) => d !== day)
                                dispatch({
                                  type: 'SET_SETTINGS',
                                  patch: {
                                    reminders: {
                                      ...(settings.reminders || DEFAULT_REMINDER_SETTINGS),
                                      days: newDays,
                                    },
                                  },
                                })
                              }}
                            />
                            <span className="small">{label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div>
                    <Button
                      variant="secondary"
                      onClick={handleNotificationRequest}
                    >
                      <Icon name="bell" size={16} /> Request Browser Notifications (Optional)
                    </Button>
                    <p className="muted small" style={{ marginTop: 'var(--s-1)', fontStyle: 'italic' }}>
                      Reminders appear while CodeOrbit is open in this browser. No background push or network tracking is used.
                    </p>
                  </div>
                </div>
              )}
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

        {/* Onboarding Tour (Stage 17b, 15.1) */}
        <Card title="Guided Tour" eyebrow="Onboarding & Help">
          <div style={{ display: 'grid', gap: 'var(--s-3)', marginTop: 'var(--s-3)' }}>
            <p className="muted small">
              Take a guided spotlight tour of CodeOrbit to re-explore the Learning Orbit, practice lab, error notebook, and settings.
            </p>
            <div>
              <Button
                variant="secondary"
                onClick={() => {
                  dispatch({ type: 'SET_ONBOARDING', patch: { completed: false, skippedAt: undefined } })
                  startTour()
                  toast.show('Starting guided onboarding tour.', 'info')
                }}
              >
                <Icon name="compass" size={16} />
                Replay onboarding tour
              </Button>
            </div>
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

        {/* Connected Services (Stage 28: 17.2, 17.5, 17.8) */}
        <Card title="Connected Services" eyebrow="Integrations & Privacy">
          <div style={{ display: 'grid', gap: 'var(--s-4)', marginTop: 'var(--s-3)' }}>
            <p className="muted small" style={{ margin: 0 }}>
              CodeOrbit is an offline-first learning platform. All core learning, editor, and analysis features run locally in your browser. Services requiring remote infrastructure or external APIs remain strictly disconnected until explicitly configured and approved.
            </p>

            <div className="services-grid" style={{ display: 'grid', gap: 'var(--s-4)' }}>
              {getExternalServices().map((svc) => (
                <div
                  key={svc.id}
                  className="card card--quiet service-card"
                  style={{
                    padding: 'var(--s-4)',
                    background: 'var(--surface-raised, rgba(255, 255, 255, 0.03))',
                    border: '1px solid var(--c-border, #3a3556)',
                    borderRadius: 'var(--r-md, 8px)',
                  }}
                  data-testid={`service-card-${svc.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>{svc.name}</h4>
                      <p className="muted small" style={{ margin: 0 }}>{svc.description}</p>
                    </div>
                    <span
                      className={`badge ${svc.status === 'connected' ? 'badge--available' : 'badge--subtle'}`}
                      data-testid={`service-status-${svc.id}`}
                    >
                      {svc.status === 'connected' ? 'Connected' : svc.status === 'error' ? 'Error' : 'Not connected'}
                    </span>
                  </div>

                  <div
                    style={{
                      margin: '12px 0',
                      padding: '10px 12px',
                      background: 'var(--color-bg-subtle, rgba(0, 0, 0, 0.2))',
                      borderRadius: '6px',
                      borderLeft: '3px solid var(--color-warning, #f59e0b)',
                      fontSize: '0.85rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <strong>Privacy disclosure:</strong> {svc.disclosure}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span className="muted small" style={{ fontStyle: 'italic' }}>
                      Status: Hard Gate {svc.gateId} (Gated — not approved) · Zero network calls
                    </span>
                    <Button variant="secondary" size="sm" disabled aria-disabled="true" title="Integration not approved">
                      Not configured
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Data Management (14.4, 16.4) */}
        <div data-concept-id="fc-25" className="storage-card">
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
