import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode } from 'react'
import { clearState, loadState, saveState, migrate, sanitizeState, STORAGE_KEY, type RecoveryReason } from '../lib/storage'
import { reducer, type Action } from './reducer'
import type { CodeOrbitState } from './types'
import { estimateBytes, quotaStatus } from '../core/storage/quota'
import { applyAppearance, writeEarlyAppearance } from '../core/settings/appearance'
import { loadDyslexiaFont } from '../core/a11y/dyslexiaFont'

export type SaveStatus =
  | { kind: 'idle'; quotaWarn?: boolean }
  | { kind: 'saved'; at: number; quotaWarn?: boolean }
  | { kind: 'error'; reason: 'unavailable' | 'failed'; quotaWarn?: boolean }

interface Ctx {
  state: CodeOrbitState
  dispatch: Dispatch<Action>
  saveStatus: SaveStatus
  recovery: RecoveryReason
  dismissRecovery: () => void
  /** Write immediately (used before navigation-sensitive actions and in tests). */
  flush: () => boolean | void
  resetAll: () => void
  rollback: () => void
}

const AppCtx = createContext<Ctx | null>(null)

const SAVE_DELAY_MS = 300

export function AppStateProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadState())
  const [state, baseDispatch] = useReducer(reducer, initial.current.state)
  const [recovery, setRecovery] = useState<RecoveryReason>(initial.current.recovery)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    initial.current.recovery === 'unavailable' ? { kind: 'error', reason: 'unavailable' } : { kind: 'idle' },
  )
  const stateRef = useRef(state)
  const lastSavedState = useRef<CodeOrbitState>(initial.current.state)
  const hadDestructiveAction = useRef(false)
  const dirty = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstRender = useRef(true)

  // Track destructive actions for optimistic rollback protection
  const dispatch: Dispatch<Action> = useCallback((action: Action) => {
    if (
      action.type === 'DELETE_ERROR' ||
      (action.type === 'SET_NOTE' && !action.text.trim() && (!action.tags || action.tags.length === 0))
    ) {
      hadDestructiveAction.current = true
    }
    baseDispatch(action)
  }, [])

  // Sync settings with DOM and early-appearance storage
  useEffect(() => {
    if (state.settings) {
      applyAppearance(state.settings)
      writeEarlyAppearance(state.settings)
      if (state.settings.dyslexiaFont) {
        loadDyslexiaFont()
      }
    }
  }, [state.settings])

  const rollback = useCallback(() => {
    if (lastSavedState.current) {
      baseDispatch({ type: 'IMPORT_STATE', state: lastSavedState.current })
      dirty.current = false
      hadDestructiveAction.current = false
      setSaveStatus({ kind: 'idle' })
    }
  }, [])

  const flush = useCallback((): boolean => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    if (!dirty.current) return true
    const res = saveState(stateRef.current)
    const bytes = estimateBytes(stateRef.current)
    const isWarn = quotaStatus(bytes) !== 'ok'
    if (res.ok) {
      dirty.current = false
      hadDestructiveAction.current = false
      lastSavedState.current = stateRef.current
      setSaveStatus({ kind: 'saved', at: Date.now(), quotaWarn: isWarn })
      return true
    } else {
      setSaveStatus({ kind: 'error', reason: res.reason, quotaWarn: isWarn })
      if (hadDestructiveAction.current) {
        baseDispatch({ type: 'IMPORT_STATE', state: lastSavedState.current })
        dirty.current = false
        hadDestructiveAction.current = false
      }
      return false
    }
  }, [])

  useEffect(() => {
    stateRef.current = state
    if (firstRender.current) { firstRender.current = false; return }
    dirty.current = true
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(flush, SAVE_DELAY_MS)
  }, [state, flush])

  // Flush pending writes when the tab is hidden or closed so nothing is lost on refresh.
  useEffect(() => {
    const onHide = () => flush()
    const onVis = () => { if (document.visibilityState === 'hidden') flush() }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVis)
      flush()
    }
  }, [flush])

  // Listen to cross-tab storage changes (multi-tab sync)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          const migrated = migrate(parsed)
          if (migrated) {
            const { state: newState } = sanitizeState(migrated)
            baseDispatch({ type: 'IMPORT_STATE', state: newState })
          }
        } catch {
          // Safe ignore corrupt external updates
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const resetAll = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    dirty.current = false
    hadDestructiveAction.current = false
    baseDispatch({ type: 'RESET_ALL' })
    const res = clearState()
    setSaveStatus(res.ok ? { kind: 'idle' } : { kind: 'error', reason: res.reason })
    setRecovery('none')
    firstRender.current = true // the reset state need not be re-written
  }, [])

  const value = useMemo<Ctx>(
    () => ({ state, dispatch, saveStatus, recovery, dismissRecovery: () => setRecovery('none'), flush, resetAll, rollback }),
    [state, dispatch, saveStatus, recovery, flush, resetAll, rollback],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useAppOptional(): Ctx | null {
  return useContext(AppCtx)
}

export function useApp(): Ctx {
  const c = useAppOptional()
  if (!c) throw new Error('useApp must be used inside <AppStateProvider>')
  return c
}
