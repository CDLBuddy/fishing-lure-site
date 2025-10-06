//src/pages/Product.tsx

import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import productsRaw from '../data/products.json'
import { ProductList, type Product, type Variant } from '../types/product'
import { useCart } from '../state/cart'
import { injectJsonLd, setTitle } from '../utils/seo'

const parsed = ProductList.safeParse(productsRaw)
const PRODUCTS: Product[] = parsed.success ? parsed.data : []

const clamp = (n: number, min = 1, max = 99) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min))

export default function ProductPage() {
  const { id } = useParams()
  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id])

  const [variantId, setVariantId] = useState<string>('')
  const [qty, setQty] = useState<number>(1)
  const add = useCart((state) => state.add)

  useEffect(() => {
    setTitle(product ? product.name : 'Product')
  }, [product])

  useEffect(() => {
    if (!product) return
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images,
      brand: 'Handmade',
      offers: {
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
    return <main style={{ padding: 20, color: 'var(--text)' }}>Not found.</main>
  }

  const v =
    product.variants.find((variant: Variant) => variant.id === variantId) ?? product.variants[0]

  return (
    <main
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
        style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }}
      />
      <div>
        <h1 style={{ marginTop: 0 }}>{product.name}</h1>
        <p style={{ color: 'var(--text-dim)' }}>{product.description}</p>

        <label>
          Variant
          <br />
          <select
            value={v?.id ?? ''}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setVariantId(event.target.value)}
            style={{ padding: '8px 10px', marginTop: 6 }}
          >
            {product.variants.map((variant: Variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.label}
              </option>
            ))}
          </select>
        </label>

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
          onClick={() =>
            v &&
            add({
              productId: product.id,
              variantId: v.id,
              name: product.name,
              label: v.label,
              stripePriceId: v.stripePriceId,
              qty,
            })
          }
          className="btn"
          style={{ marginTop: 16, width: 'fit-content' }}
        >
          Add to Cart
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
