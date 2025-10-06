//src/pages/Catalog.tsx

import { useEffect, useMemo, useState } from 'react'
import productsRaw from '../data/products.json'
import { ProductList, type Product } from '../types/product'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import { setTitle } from '../utils/seo'

const parsed = ProductList.safeParse(productsRaw)
const PRODUCTS: Product[] = parsed.success ? parsed.data : []

export default function Catalog() {
  useEffect(() => setTitle('Catalog'), [])

  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')

  const categories = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map(p => p.category)))
  }, [])

  const filtered = useMemo(() => {
    const c = cat.trim().toLowerCase()
    const s = q.trim().toLowerCase()
    return PRODUCTS.filter(p =>
      (c ? p.category === c : true) &&
      (s ? (p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)) : true)
    )
  }, [cat, q])

  return (
    <main style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto', color: '#e6edf3' }}>
      <h1>Catalog</h1>
      <Filters categories={categories} selected={cat} setSelected={setCat} query={q} setQuery={setQ} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {filtered.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
      {!parsed.success && (
        <p style={{ color: '#ffb4a6', marginTop: 16 }}>
          Failed to load product data. Check your <code>products.json</code> format.
        </p>
      )}
    </main>
  )
}