// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Load tokens before anything else so CSS variables are ready
import './styles/tokens.css'
import './styles/base.css'

// Hydrate theme safely (no-op if index.html already set it)
function hydrateTheme() {
  try {
    const html = document.documentElement
    const existing = html.getAttribute('data-theme')
    if (existing === 'light' || existing === 'dark') return

    const stored = (localStorage.getItem('theme') as 'light' | 'dark' | null) || null
    const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    const prefersDark = mql ? mql.matches : true
    const theme = stored ?? (prefersDark ? 'dark' : 'light')
    html.setAttribute('data-theme', theme)

    // If the user hasn't chosen a theme, track OS changes
    if (!stored && mql) {
      const apply = (e: MediaQueryListEvent | MediaQueryList) => {
        const next = ('matches' in e ? e.matches : mql.matches) ? 'dark' : 'light'
        html.setAttribute('data-theme', next)
      }
      // Modern / legacy listeners
      if ('addEventListener' in mql) mql.addEventListener('change', apply as any)
      else if ('addListener' in mql) (mql as any).addListener(apply)
    }
  } catch {
    /* non-blocking */
  }
}
hydrateTheme()

// Progressive enhancement hook
document.documentElement.classList.add('js')

const root = document.getElementById('root')!
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)