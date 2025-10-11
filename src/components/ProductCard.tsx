// src/components/ProductCard.tsx
import { Link } from 'react-router-dom'
import type { Product } from '../types/product'
import { fmtUSD } from '../utils/currency'

function priceRangeLabel(p: Product): string | null {
  const prices = p.variants
    .map((v) => (typeof v.price === 'number' ? v.price : null))
    .filter((n): n is number => n !== null)

  if (prices.length === 0) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? fmtUSD(min) : `${fmtUSD(min)} – ${fmtUSD(max)}`
}

export default function ProductCard({ p }: { p: Product }) {
  const img = p.images[0] || '/images/placeholder.jpg'
  const variantCount = p.variants.length
  const firstVariant = p.variants[0]
  const optionsLabel =
    variantCount === 1 && firstVariant ? firstVariant.label : `${variantCount} options`
  const prLabel = priceRangeLabel(p)
  const isHidden = p.status === 'hidden'

  return (
    <Link to={`/product/${p.id}`} aria-label={`${p.name}${prLabel ? `, ${prLabel}` : ''}`}>
      <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
        {isHidden && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              zIndex: 1,
            }}
          >
            Unavailable
          </span>
        )}

        <div className="img-frame">
          <img src={img} alt={p.name} loading="lazy" decoding="async" />
        </div>

        <div style={{ padding: 12 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
              alignItems: 'baseline',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6, lineHeight: 1.2 }}>{p.name}</div>
            {prLabel && <div style={{ fontWeight: 700 }}>{prLabel}</div>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{optionsLabel}</div>
        </div>
      </div>
    </Link>
  )
}
