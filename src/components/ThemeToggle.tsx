import { useEffect, useState } from 'react'

type Mode = 'light' | 'dark'

function getInitial(): Mode {
  try {
    const stored = localStorage.getItem('theme') as Mode | null
    if (stored === 'light' || stored === 'dark') return stored
    const prefersLight =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    return prefersLight ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Mode>(() => getInitial())

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  // sync changes across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const v = (e.newValue as Mode | null) ?? undefined
        if (v === 'light' || v === 'dark') setTheme(v)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      className="btn"
      onClick={() => setTheme(next)}
      aria-pressed={theme === 'light'}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  )
}