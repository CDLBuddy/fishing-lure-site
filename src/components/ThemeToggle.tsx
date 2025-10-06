import { useEffect, useState } from 'react'

const getInitial = () =>
  (localStorage.getItem('theme') as 'light' | 'dark' | null) ||
  (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark')

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitial)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button className="btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  )
}
