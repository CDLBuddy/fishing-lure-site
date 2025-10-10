import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Load tokens first so variables exist before any paint
import './styles/tokens.css'
import './styles/base.css'

// Early theme hydration: prevent light/dark flash
(() => {
  try {
    const stored = localStorage.getItem('theme')
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = stored || (prefersDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    // non-blocking
  }
})()

const root = document.getElementById('root')!
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)