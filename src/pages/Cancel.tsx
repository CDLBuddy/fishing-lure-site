// src/pages/Cancel.tsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setTitle, setDescription, setOpenGraph, setCanonical } from '../utils/seo'

export default function Cancel() {
  useEffect(() => {
    setTitle('Checkout canceled')
    setDescription('Your checkout was canceled. You can review your cart or continue browsing.')
    setOpenGraph({ title: 'Checkout canceled', type: 'website' })
    setCanonical()
  }, [])

  return (
    <main id="main" className="container" style={{ color: 'var(--text)' }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Checkout canceled</h1>
        <p style={{ color: 'var(--text-dim)' }}>
          No worries--your cart is saved. You can make changes and try again later.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <Link to="/cart" className="btn" style={{ background: 'var(--bg-2)', color: 'var(--text)' }}>
            Review cart
          </Link>
          <Link to="/catalog" className="btn">Back to catalog</Link>
        </div>
      </div>
    </main>
  )
}