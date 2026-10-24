import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode } from 'react'
import { clearState, loadState, saveState, type RecoveryReason } from '../lib/storage'
import { reducer, type Action } from './reducer'
import type { CodeOrbitState } from './types'

export type SaveStatus =
  | { kind: 'idle' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; reason: 'unavailable' | 'failed' }

interface Ctx {
  state: CodeOrbitState
  dispatch: Dispatch<Action>
  saveStatus: SaveStatus
  recovery: RecoveryReason
  dismissRecovery: () => void
  /** Write immediately (used before navigation-sensitive actions and in tests). */
  flush: () => void
  resetAll: () => void
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
  const dirty = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstRender = useRef(true)

  const flush = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    if (!dirty.current) return
    const res = saveState(stateRef.current)
    if (res.ok) { dirty.current = false; setSaveStatus({ kind: 'saved', at: Date.now() }) }
    else setSaveStatus({ kind: 'error', reason: res.reason })
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

  const resetAll = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    dirty.current = false
    baseDispatch({ type: 'RESET_ALL' })
    const res = clearState()
    setSaveStatus(res.ok ? { kind: 'idle' } : { kind: 'error', reason: res.reason })
    setRecovery('none')
    firstRender.current = true // the reset state need not be re-written
  }, [])

  const value = useMemo<Ctx>(
    () => ({ state, dispatch: baseDispatch, saveStatus, recovery, dismissRecovery: () => setRecovery('none'), flush, resetAll }),
    [state, saveStatus, recovery, flush, resetAll],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp must be used inside <AppStateProvider>')
  return c
}
