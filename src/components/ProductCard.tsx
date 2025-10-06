//src/components/ProductCard.tsx

import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

export default function ProductCard({ p }: { p: Product }) {
  const img = p.images[0]
  const firstVariant = p.variants[0]
  const priceLabel =
    p.variants.length === 1 && firstVariant ? firstVariant.label : `${p.variants.length} options`

  return (
    <Link to={`/product/${p.id}`}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ aspectRatio: '3 / 2', background: '#1f2937' }}>
          <img
            src={img}
            alt={p.name}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{priceLabel}</div>
        </div>
      </div>
    </Link>
  )
}
