import React, { createContext, useContext, useMemo } from 'react'

export type NowFn = () => number

const ClockContext = createContext<NowFn>(Date.now)

export interface ClockProviderProps {
  now?: NowFn
  children: React.ReactNode
}

export function ClockProvider({ now = Date.now, children }: ClockProviderProps) {
  const value = useMemo(() => now, [now])
  return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>
}

/**
 * Returns the active clock timestamp generator (defaults to Date.now).
 * Allows tests to inject fixed or advancing time without mutating global Date or fake timers.
 */
export function useClock(): NowFn {
  return useContext(ClockContext)
}
