// src/components/ToastProvider.tsx
// src/components/ToastProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

type Toast = { id: number; text: string }
type Ctx = { show: (text: string) => void }

// default -> no-op so useToast() won't crash if provider isn't mounted
const ToastCtx = createContext<Ctx>({ show: () => {} })

export function useToast() {
  return useContext(ToastCtx)
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(1)
  const api = useMemo(
    () => ({
      show: (text: string) => {
        const id = idRef.current++
        setToasts(t => [...t, { id, text }])
        window.setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2200)
      },
    }),
    []
  )

  // aria-live for screen readers
  useEffect(() => {
    let region = document.getElementById('aria-toasts')
    if (!region) {
      region = document.createElement('div')
      region.id = 'aria-toasts'
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('aria-atomic', 'true')
      region.style.position = 'absolute'
      region.style.left = '-9999px'
      region.style.top = '-9999px'
      document.body.appendChild(region)
    }
    if (toasts.length) region.textContent = toasts[toasts.length - 1].text
  }, [toasts])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 1000 }}>
        {toasts.map(t => (
          <div key={t.id} className="card" style={{ padding: '10px 12px', background: 'var(--bg-2)' }}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}