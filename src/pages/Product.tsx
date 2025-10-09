// src/pages/Product.tsx
import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import productsRaw from '../data/products.json'
import { ProductList, type Product, type Variant } from '../types/product'
import { useCart } from '../state/cart'
import { injectJsonLd, setTitle } from '../utils/seo'
import { fmtUSD } from '../utils/currency'
import { useToast } from '../components/ToastProvider'

const parsed = ProductList.safeParse(productsRaw)
const PRODUCTS: Product[] = parsed.success ? parsed.data : []

const clamp = (n: number, min = 1, max = 99) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min))

function priceRange(p: Product): { low: number; high: number } | null {
  const prices = p.variants
    .map(v => (typeof v.price === 'number' ? v.price : null))
    .filter((n): n is number => n !== null)
  if (!prices.length) return null
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  return { low, high }
}

export default function ProductPage() {
  const { id } = useParams()
  const product = useMemo(() => PRODUCTS.find(p => p.id === id), [id])

  const [variantId, setVariantId] = useState<string>('')
  const [qty, setQty] = useState<number>(1)
  const add = useCart(s => s.add)
  const { show } = useToast()

  useEffect(() => {
    setTitle(product ? product.name : 'Product')
  }, [product])

  // JSON-LD (uses actual min/max if variant prices exist)
  useEffect(() => {
    if (!product) return
    const pr = priceRange(product)
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images,
      brand: 'Handmade',
      offers: pr
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: pr.low,
            highPrice: pr.high,
            availability: 'https://schema.org/InStock',
          }
        : {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: 1,
            highPrice: 1,
            availability: 'https://schema.org/InStock',
          },
    })
  }, [product])

  // Initialize default variant when product changes
  useEffect(() => {
    if (product && !variantId) {
      setVariantId(product.variants[0]?.id ?? '')
    }
  }, [product, variantId])

  if (!product) {
    return (
      <main id="main" style={{ padding: 20, color: 'var(--text)' }}>
        Not found.
      </main>
    )
  }

  const v: Variant = product.variants.find(x => x.id === variantId) ?? product.variants[0]
  const unavailable = product.status === 'hidden'
  const variantPrice =
    typeof v?.price === 'number' ? `Price: ${fmtUSD(v.price)}` : 'Price shown at checkout'

  return (
    <main
      id="main"
      style={{
        padding: '24px 20px',
        maxWidth: 1000,
        margin: '0 auto',
        color: 'var(--text)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 24,
      }}
    >
      <img
        src={product.images[0]}
        alt={product.name}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }}
      />

      <div>
        <h1 style={{ marginTop: 0 }}>{product.name}</h1>
        <p style={{ color: 'var(--text-dim)' }}>{product.description}</p>

        {unavailable && (
          <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', marginTop: 0 }}>
            This product is currently unavailable.
          </p>
        )}

        <label>
          Variant
          <br />
          <select
            value={v?.id ?? ''}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setVariantId(event.target.value)}
            style={{ padding: '8px 10px', marginTop: 6 }}
          >
            {product.variants.map(variant => (
              <option key={variant.id} value={variant.id}>
                {variant.label}
              </option>
            ))}
          </select>
        </label>

        <div style={{ marginTop: 8, color: 'var(--text-dim)', fontWeight: 600 }}>{variantPrice}</div>

        <div style={{ marginTop: 12 }}>
          <label>
            Quantity
            <br />
            <input
              type="number"
              value={qty}
              min={1}
              max={99}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setQty(clamp(parseInt(event.target.value || '1', 10)))
              }
              style={{ padding: '8px 10px', width: 100, marginTop: 6 }}
            />
          </label>
        </div>

        <button
          onClick={() => {
            if (!v) return
            // cart requires a string stripePriceId; provide a safe placeholder when missing
            const stripeId = (v.stripePriceId ?? 'price_placeholder') as string
            add({
              productId: product.id,
              variantId: v.id,
              name: product.name,
              label: v.label,
              stripePriceId: stripeId,
              qty,
            })
            show('Added to cart')
          }}
          className="btn"
          style={{ marginTop: 16, width: 'fit-content' }}
          disabled={unavailable}
        >
          {unavailable ? 'Unavailable' : 'Add to Cart'}
        </button>

        {!parsed.success && (
          <p style={{ color: '#ffb4a6', marginTop: 12 }}>
            Product data failed to parse. Check <code>products.json</code>.
          </p>
        )}
      </div>
    </main>
  )
}