import { useEffect, useMemo, useState, useCallback } from 'react'
import catchesRaw from '../data/catches.json'
import productsRaw from '../data/products.json'
import { setTitle, injectJsonLd } from '../utils/seo'

type CatchImage = { src: string; alt?: string; width?: number; height?: number }
type CatchItem = {
  id: string
  title: string
  date?: string
  angler?: string
  lureId?: string
  location?: string
  species?: string
  lengthIn?: number
  weightLb?: number
  tags?: string[]
  images: CatchImage[]
  status?: 'draft' | 'published'
  featured?: boolean
  sort?: number
  publishedAt?: string
}

type Product = { id: string; name: string; category?: string }
const CATCHES: CatchItem[] = Array.isArray(catchesRaw) ? catchesRaw : []
const PRODUCTS: Product[] = Array.isArray(productsRaw) ? productsRaw : []

const productById = new Map(PRODUCTS.map((p) => [p.id, p]))
const allCategories = Array.from(
  new Set(PRODUCTS.map((p) => p.category).filter(Boolean))
) as string[]
const allLures = PRODUCTS.map((p) => ({ id: p.id, name: p.name }))

const fmt = (n?: number) => (typeof n === 'number' && isFinite(n) ? n : undefined)

export default function Gallery() {
  useEffect(() => setTitle('Gallery'), [])

  // Basic SEO / JSON-LD (first 12 images only)
  useEffect(() => {
    const imgs = CATCHES.slice(0, 12).flatMap((c) =>
      c.images.map((im) => ({
        '@type': 'ImageObject',
        contentUrl: im.src,
        caption: c.title || undefined,
      }))
    )
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Catch Gallery',
      hasPart: imgs,
    })
  }, [])

  const [cat, setCat] = useState<string>('') // product category
  const [lure, setLure] = useState<string>('') // product id
  const [q, setQ] = useState<string>('') // search
  const [show, setShow] = useState<number>(24) // pagination
  const [lightbox, setLightbox] = useState<{ i: number; j: number } | null>(null)

  const records = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return CATCHES.filter((c) => (c.status ? c.status !== 'draft' : true))
      .map((c) => ({
        ...c,
        prod: c.lureId ? productById.get(c.lureId) : undefined,
        cat: c.lureId ? productById.get(c.lureId)?.category || '' : '',
      }))
      .filter((r) => (cat ? r.cat === cat : true))
      .filter((r) => (lure ? r.lureId === lure : true))
      .filter((r) => {
        if (!qq) return true
        const hay = [
          r.title,
          r.angler,
          r.location,
          r.species,
          ...(r.tags || []),
          r.prod?.name,
          r.cat,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(qq)
      })
      .sort((a, b) => {
        const as = isFinite(a.sort as number) ? (a.sort as number) : Number.MAX_SAFE_INTEGER
        const bs = isFinite(b.sort as number) ? (b.sort as number) : Number.MAX_SAFE_INTEGER
        if (as !== bs) return as - bs
        const ad = a.publishedAt || a.date || ''
        const bd = b.publishedAt || b.date || ''
        return String(bd).localeCompare(String(ad))
      })
  }, [cat, lure, q])

  const visible = records.slice(0, show)

  const openLb = useCallback((i: number, j: number) => setLightbox({ i, j }), [])
  const closeLb = useCallback(() => setLightbox(null), [])
  const nextLb = useCallback(
    () =>
      setLightbox((s) => {
        if (!s) return s
        const { i, j } = s
        const imgs = records[i]?.images || []
        if (j + 1 < imgs.length) return { i, j: j + 1 }
        if (i + 1 < records.length) return { i: i + 1, j: 0 }
        return s
      }),
    [records]
  )
  const prevLb = useCallback(
    () =>
      setLightbox((s) => {
        if (!s) return s
        const { i, j } = s
        if (j - 1 >= 0) return { i, j: j - 1 }
        if (i - 1 >= 0) {
          const prevImgs = records[i - 1]?.images || []
          return { i: i - 1, j: Math.max(0, prevImgs.length - 1) }
        }
        return s
      }),
    [records]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'Escape') closeLb()
      else if (e.key === 'ArrowRight') nextLb()
      else if (e.key === 'ArrowLeft') prevLb()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, closeLb, nextLb, prevLb])

  return (
    <main className="container" style={{ color: 'var(--text)' }}>
      <h1 className="h1" style={{ marginTop: 0 }}>
        Gallery
      </h1>
      <p className="lead">Real catches from real anglers using RIP Custom Lures.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0' }}>
        <select
          value={cat}
          onChange={(e) => {
            setCat(e.target.value)
            setShow(24)
          }}
        >
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={lure}
          onChange={(e) => {
            setLure(e.target.value)
            setShow(24)
          }}
        >
          <option value="">All lures</option>
          {allLures.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setShow(24)
          }}
          placeholder="Search (angler, tag, species, location)…"
          style={{ padding: '8px 10px', minWidth: 260 }}
        />
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {visible.map((c, i) => (
          <article key={c.id} className="card" style={{ overflow: 'hidden' }}>
            <div className="img-frame" onClick={() => openLb(i, 0)} style={{ cursor: 'zoom-in' }}>
              <img
                src={c.images?.[0]?.src}
                alt={c.images?.[0]?.alt || c.title || 'Catch photo'}
                loading="lazy"
                decoding="async"
                width={c.images?.[0]?.width || 800}
                height={c.images?.[0]?.height || 600}
              />
              {c.featured ? <span className="badge badge-on-image">Featured</span> : null}
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{c.title || c.species || 'Catch'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                {c.angler ? c.angler : ''}
                {c.location ? (c.angler ? ' • ' : '') + c.location : ''}
                {c.lureId && productById.get(c.lureId)?.name ? (
                  <>
                    {' '}
                    •{' '}
                    <a href={'/product/' + c.lureId} style={{ color: 'var(--brand)' }}>
                      {productById.get(c.lureId)?.name}
                    </a>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Load more */}
      {show < records.length && (
        <div style={{ display: 'grid', placeItems: 'center', margin: '24px 0' }}>
          <button className="btn btn-ghost" onClick={() => setShow((s) => s + 24)}>
            Load more
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && records[lightbox.i] && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLb}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.7)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 'min(92vw, 1100px)',
              width: '100%',
              padding: 12,
              background: 'var(--bg-2)',
            }}
          >
            <LightboxContent
              rec={records[lightbox.i]!}
              idx={lightbox.j}
              onPrev={prevLb}
              onNext={nextLb}
            />
          </div>
        </div>
      )}
    </main>
  )
}

function LightboxContent({
  rec,
  idx,
  onPrev,
  onNext,
}: {
  rec: CatchItem
  idx: number
  onPrev: () => void
  onNext: () => void
}) {
  const img = rec.images[idx]
  if (!img) return null
  const len = rec.images.length
  return (
    <div>
      <div className="img-frame" style={{ aspectRatio: '16 / 10' }}>
        <img
          src={img.src}
          alt={img.alt || rec.title || 'Catch photo'}
          loading="eager"
          decoding="async"
          width={img.width || 1600}
          height={img.height || 1000}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginTop: 8,
        }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          <strong style={{ color: 'var(--text)' }}>{rec.title || rec.species || 'Catch'}</strong>
          {rec.angler ? ' • ' + rec.angler : ''}
          {rec.location ? ' • ' + rec.location : ''}
          {fmt(rec.lengthIn) ? ' • ' + fmt(rec.lengthIn) + ' in' : ''}
          {fmt(rec.weightLb) ? ' • ' + fmt(rec.weightLb) + ' lb' : ''}
          {rec.lureId ? (
            <>
              {' '}
              •{' '}
              <a href={'/product/' + rec.lureId} style={{ color: 'var(--brand)' }}>
                View lure
              </a>
            </>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onPrev} disabled={idx <= 0}>
            Prev
          </button>
          <button className="btn" onClick={onNext} disabled={idx >= len - 1}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
