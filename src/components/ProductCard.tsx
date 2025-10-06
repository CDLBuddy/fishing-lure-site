//src/components/ProductCard.tsx

import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

export default function ProductCard({ p }: { p: Product }) {
  const img = p.images[0]
  const priceLabel = p.variants.length === 1 ? p.variants[0].label : `${p.variants.length} options`
  return (
    <Link to={`/product/${p.id}`} style={{display:'block',border:'1px solid #1f2a44',borderRadius:10,overflow:'hidden',textDecoration:'none',color:'#e6edf3',background:'#0f172a'}}>
      <img src={img} alt={p.name} style={{width:'100%',height:200,objectFit:'cover'}} />
      <div style={{padding:12}}>
        <div style={{fontWeight:600,marginBottom:6}}>{p.name}</div>
        <div style={{fontSize:12,color:'#9fb3c8'}}>{priceLabel}</div>
      </div>
    </Link>
  )
}