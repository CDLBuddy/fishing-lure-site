// src/pages/Success.tsx
import { useEffect, useRef, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../state/cart'
import { setTitle, setDescription, setOpenGraph, setCanonical } from '../utils/seo'

export default function Success() {
  const location = useLocation()
  const cleared = useRef(false)
  const clear = useCart(s => s.clear)

  // extract ?session_id=... (Stripe) for a friendly receipt stub
  const sessionId = useMemo(() => {
    const p = new URLSearchParams(location.search)
    const id = p.get('session_id') || ''
    return id ? `#${id.slice(-8)}` : null
  }, [location.search])

  useEffect(() => {
    setTitle('Order complete')
    setDescription('Thanks for your order. Your handmade lures are being prepared.')
    setOpenGraph({ title: 'Order complete', type: 'website' })
    setCanonical()
  }, [])

  // clear cart only once when landing here
  useEffect(() => {
    if (!cleared.current) {
      cleared.current = true
      clear()
    }
  }, [clear])

  return (
    <main id="main" className="container" style={{ color: 'var(--text)' }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Thank you!</h1>
        <p style={{ color: 'var(--text-dim)' }}>
          Your order has been received{sessionId ? ` (ref ${sessionId})` : ''}.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <Link to="/catalog" className="btn">Continue shopping</Link>
          <Link to="/" className="btn" style={{ background: 'var(--bg-2)', color: 'var(--text)' }}>
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}