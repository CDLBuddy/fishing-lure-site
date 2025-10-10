// src/pages/Cart.tsx
import { useMemo, useEffect } from 'react'
import { useCart } from '../state/cart'
import { setTitle } from '../utils/seo'
import { useToast } from '../components/ToastProvider'

const CHECKOUT_ENABLED = import.meta.env.VITE_CHECKOUT_ENABLED === 'true'
const clamp = (n: number, min = 1, max = 99) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min))

export default function Cart() {
  useEffect(() => setTitle('Cart'), [])
  const { items, remove, setQty, clear } = useCart()
  const { show } = useToast()
  const totalQty = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items])

  async function checkout() {
    if (!CHECKOUT_ENABLED) {
      show('Checkout is not enabled yet.')
      return
    }
    if (items.length === 0) return

    try {
      const r = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ stripePriceId: i.stripePriceId, qty: i.qty }))
        })
      })

      let payload: any = {}
      try { payload = await r.json() } catch {}

      if (!r.ok || !payload?.url) {
        show(payload?.error || 'Checkout is not configured yet.')
        return
      }
      window.location.href = payload.url
    } catch {
      show('Network error -- checkout unavailable.')
    }
  }

  return (
    <main id="main" style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto', color: 'var(--text)' }}>
      <h1>Cart</h1>

      {items.length === 0 ? (
        <p style={{ color: 'var(--text-dim)' }}>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map(i => (
              <li
                key={i.productId + i.variantId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 160px 100px 100px',
                  gap: 12,
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  padding: '10px 0'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{i.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{i.label}</div>
                </div>

                <input
                  type="number"
                  min={1}
                  max={99}
                  value={i.qty}
                  onChange={(e) =>
                    setQty(i.productId, i.variantId, clamp(parseInt(e.target.value || '1', 10)))
                  }
                  style={{
                    padding: '6px 8px',
                    background: 'var(--bg-2)',
                    color: 'var(--text)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 6
                  }}
                />

                <button
                  onClick={() => { remove(i.productId, i.variantId); show('Removed item') }}
                  className="btn"
                  style={{ padding: '10px 14px', background: 'var(--bg-2)', color: 'var(--text)' }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <div style={{ color: 'var(--text-dim)' }}>Items: {totalQty}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { clear(); show('Cart cleared') }}
                className="btn"
                style={{ background: 'var(--bg-2)', color: 'var(--text)' }}
              >
                Clear
              </button>
              <button
                disabled={!CHECKOUT_ENABLED || items.length === 0}
                onClick={checkout}
                className="btn"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}