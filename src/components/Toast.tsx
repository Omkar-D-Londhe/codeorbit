import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

type Kind = 'info' | 'success' | 'warning'
interface ToastItem { id: number; message: string; kind: Kind }
interface Ctx { show: (message: string, kind?: Kind) => void }

const ToastCtx = createContext<Ctx>({ show: () => {} })
export const useToast = (): Ctx => useContext(ToastCtx)

/** Toasts stay for 8 seconds, are announced politely, and can be dismissed. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), [])
  const show = useCallback((message: string, kind: Kind = 'success') => {
    const id = nextId.current++
    setItems((xs) => [...xs.slice(-2), { id, message, kind }])
    setTimeout(() => dismiss(id), 8000)
  }, [dismiss])
  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>
            <Icon name={t.kind === 'warning' ? 'alert' : t.kind === 'success' ? 'check' : 'info'} size={18} />
            <span>{t.message}</span>
            <button type="button" className="icon-btn" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
