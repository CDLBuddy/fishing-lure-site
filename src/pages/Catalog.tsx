// src/pages/Catalog.tsx
import { useEffect, useMemo, useState } from 'react'
import productsRaw from '../data/products.json'
import { ProductList, type Product } from '../types/product'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import { setTitle } from '../utils/seo'

const parsed = ProductList.safeParse(productsRaw)
const PRODUCTS: Product[] = parsed.success ? parsed.data : []

const SHOW_HIDDEN = import.meta.env.VITE_ADMIN_SHOW_HIDDEN === 'true'

function isVisible(p: Product) {
  return SHOW_HIDDEN || p.status !== 'hidden'
}

function sortProducts(a: Product, b: Product) {
  const as = Number.isFinite(a.sort as number) ? (a.sort as number) : Number.MAX_SAFE_INTEGER
  const bs = Number.isFinite(b.sort as number) ? (b.sort as number) : Number.MAX_SAFE_INTEGER
  if (as !== bs) return as - bs
  return a.name.localeCompare(b.name)
}

export default function Catalog() {
  useEffect(() => setTitle('Catalog'), [])

  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')

  const visible = useMemo(() => PRODUCTS.filter(isVisible).sort(sortProducts), [])

  const categories = useMemo(() => {
    return Array.from(new Set(visible.map(p => p.category)))
  }, [visible])

  const filtered = useMemo(() => {
    const c = cat.trim().toLowerCase()
    const s = q.trim().toLowerCase()

    return visible.filter(p => {
      const matchesCat = c ? p.category === c : true
      if (!matchesCat) return false

      if (!s) return true
      const hay = [
        p.name.toLowerCase(),
        p.description.toLowerCase(),
        ...(Array.isArray(p.tags) ? p.tags.map(t => t.toLowerCase()) : [])
      ]
      return hay.some(h => h.includes(s))
    })
  }, [cat, q, visible])

  return (
    <main id="main" style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto', color: 'var(--text)' }}>
      <h1>Catalog</h1>

      <Filters categories={categories} selected={cat} setSelected={setCat} query={q} setQuery={setQ} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {filtered.map(p => <ProductCard key={p.id} p={p} />)}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-dim)', marginTop: 16 }}>
          No products match your filters.
        </p>
      )}

      {!parsed.success && (
        <p style={{ color: '#ffb4a6', marginTop: 16 }}>
          Failed to load product data. Check your <code>products.json</code> format.
        </p>
      )}
    </main>
  )
}