//src/pages/Product.tsx

import { useParams } from 'react-router-dom'
import productsRaw from '../data/products.json'
import { ProductList, type Product } from '../types/product'
import { useMemo, useState } from 'react'
import { useCart } from '../state/cart'
import { setTitle } from '../utils/seo'

const PRODUCTS: Product[] = ProductList.parse(productsRaw)

export default function ProductPage() {
  const { id } = useParams()
  const product = useMemo(()=>PRODUCTS.find(p=>p.id===id), [id])
  const [variantId, setVariantId] = useState(product?.variants[0]?.id ?? '')
  const [qty, setQty] = useState(1)
  const add = useCart(s => s.add)

  if (!product) return <main style={{padding:20,color:'#e6edf3'}}>Not found.</main>
  setTitle(product.name)

  const v = product.variants.find(x=>x.id===variantId) ?? product.variants[0]
  return (
    <main style={{padding:'24px 20px',maxWidth:1000,margin:'0 auto',color:'#e6edf3',display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:24}}>
      <img src={product.images[0]} alt={product.name} style={{width:'100%',borderRadius:12,objectFit:'cover'}} />
      <div>
        <h1 style={{marginTop:0}}>{product.name}</h1>
        <p style={{color:'#9fb3c8'}}>{product.description}</p>

        <label>Variant<br/>
          <select value={v.id} onChange={(e)=>setVariantId(e.target.value)} style={{padding:'8px 10px',marginTop:6}}>
            {product.variants.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </label>

        <div style={{marginTop:12}}>
          <label>Quantity<br/>
            <input type="number" value={qty} min={1} max={99} onChange={(e)=>setQty(parseInt(e.target.value||'1',10))} style={{padding:'8px 10px',width:100,marginTop:6}}/>
          </label>
        </div>

        <button
          onClick={()=>add({ productId: product.id, variantId: v.id, name: product.name, label: v.label, stripePriceId: v.stripePriceId, qty })}
          style={{marginTop:16, background:'#53b1f0', color:'#0b1220', padding:'10px 14px', borderRadius:8, fontWeight:700}}
        >
          Add to Cart
        </button>
      </div>
    </main>
  )
}