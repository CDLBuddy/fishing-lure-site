import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

type Variant = 'info' | 'success' | 'error'
type Toast = { id: number; text: string; variant: Variant; duration: number }

type ToastCtx = {
  show: (text: string, opts?: { variant?: Variant; duration?: number }) => number
  dismiss: (id: number) => void
  clear: () => void
}

// no-op defaults so consumers never crash even if provider isn't mounted
const Ctx = createContext<ToastCtx>({
  show: () => -1,
  dismiss: () => {},
  clear: () => {}
})

export function useToast() {
  return useContext(Ctx)
}

const MAX_ONSCREEN = 3
const DEFAULT_DURATION = 2200

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(1)
  const timers = useRef<Map<number, number>>(new Map()) // id -> timeout id

  const dismiss = (id: number) => {
    // clear timer and remove toast
    const t = timers.current.get(id)
    if (t) {
      window.clearTimeout(t)
      timers.current.delete(id)
    }
    setToasts(curr => curr.filter(x => x.id !== id))
  }

  const clear = () => {
    timers.current.forEach(t => window.clearTimeout(t))
    timers.current.clear()
    setToasts([])
  }

  const show = (text: string, opts?: { variant?: Variant; duration?: number }) => {
    const id = idRef.current++
    const variant: Variant = opts?.variant ?? 'info'
    const duration = Math.max(1000, opts?.duration ?? DEFAULT_DURATION)

    setToasts(curr => {
      const next = [...curr, { id, text, variant, duration }]
      // enforce max onscreen by dropping the oldest
      return next.length > MAX_ONSCREEN ? next.slice(next.length - MAX_ONSCREEN) : next
    })

    const timeout = window.setTimeout(() => dismiss(id), duration)
    timers.current.set(id, timeout)
    return id
  }

  // Escape to dismiss most recent toast
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length) dismiss(toasts[toasts.length - 1]!.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toasts])

  // Cleanup on unmount
  useEffect(() => () => clear(), [])

  const api = useMemo(() => ({ show, dismiss, clear }), [])

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          display: 'grid',
          gap: 8,
          zIndex: 1000,
          pointerEvents: 'none'
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(t => {
          const role = t.variant === 'error' ? 'alert' : 'status'
          const bg =
            t.variant === 'error'
              ? 'rgba(239, 68, 68, 0.15)'
              : t.variant === 'success'
              ? 'rgba(34, 197, 94, 0.15)'
              : 'var(--bg-2)'
          const border =
            t.variant === 'error'
              ? 'rgba(239, 68, 68, 0.35)'
              : t.variant === 'success'
              ? 'rgba(34, 197, 94, 0.35)'
              : 'var(--border)'

          return (
            <div
              key={t.id}
              role={role}
              className="card"
              style={{
                padding: '10px 12px',
                background: bg,
                border: `1px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                pointerEvents: 'auto'
              }}
              onClick={() => dismiss(t.id)}
              title="Click to dismiss"
            >
              <span>{t.text}</span>
              <button
                aria-label="Dismiss"
                onClick={e => { e.stopPropagation(); dismiss(t.id) }}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 0,
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}