//src/pages/Cart.tsx

import { useCart } from '../state/cart'
import { useMemo } from 'react'
import { setTitle } from '../utils/seo'

export default function Cart() {
  setTitle('Cart')
  const { items, remove, setQty, clear } = useCart()

  const lineItems = items.map(i => ({ price: i.stripePriceId, quantity: i.qty }))
  const totalQty = useMemo(()=> items.reduce((n,i)=>n+i.qty,0), [items])

  async function checkout() {
    if (items.length === 0) return
    const r = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({ items: items.map(i => ({ stripePriceId: i.stripePriceId, qty: i.qty })) })
    })
    const { url, error } = await r.json()
    if (error) { alert('Checkout error'); return }
    window.location.href = url
  }

  return (
    <main style={{padding:'24px 20px',maxWidth:900,margin:'0 auto',color:'#e6edf3'}}>
      <h1>Cart</h1>
      {items.length === 0 ? <p style={{color:'#9fb3c8'}}>Your cart is empty.</p> : (
        <>
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {items.map(i => (
              <li key={i.productId + i.variantId} style={{display:'grid',gridTemplateColumns:'1fr 160px 100px 100px',gap:12,alignItems:'center',borderBottom:'1px solid #1f2a44',padding:'10px 0'}}>
                <div>
                  <div style={{fontWeight:600}}>{i.name}</div>
                  <div style={{fontSize:12,color:'#9fb3c8'}}>{i.label}</div>
                </div>
                <input type="number" min={1} max={99} value={i.qty} onChange={(e)=>setQty(i.productId, i.variantId, parseInt(e.target.value||'1',10))} style={{padding:'6px 8px'}}/>
                <button onClick={()=>remove(i.productId, i.variantId)} style={{padding:'8px 10px'}}>Remove</button>
              </li>
            ))}
          </ul>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
            <div style={{color:'#9fb3c8'}}>Items: {totalQty}</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={clear} style={{padding:'10px 14px'}}>Clear</button>
              <button onClick={checkout} style={{background:'#53b1f0',color:'#0b1220',padding:'10px 14px',borderRadius:8,fontWeight:700}}>Checkout</button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}