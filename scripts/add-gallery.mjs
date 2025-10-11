// scripts/add-gallery.mjs
// Adds a Gallery page + data pipeline + Decap CMS integration, safely and idempotently.
// - Creates/updates: src/pages/Gallery.tsx, scripts/build-catches.mjs, src/data/catches.json (empty if needed)
// - Patches: public/admin/config.yml (adds "Catches" collection), src/App.tsx (route), Header.tsx (Gallery link), scripts/build-sitemap.mjs (includes /gallery), package.json (prebuild step)
// - Does NOT touch: /api/*, OAuth, vercel.json
//
// Usage:
//   node scripts/add-gallery.mjs
//
// Commit after running:
//   git add -A && git commit -m "Add Gallery page with CMS + build pipeline"

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}
async function read(p, fallback = null) {
  try {
    return await fs.readFile(p, 'utf8')
  } catch {
    return fallback
  }
}
async function write(p, text) {
  await fs.mkdir(path.dirname(p), { recursive: true })
  await fs.writeFile(p, text)
  console.log('✓ wrote', path.relative(root, p))
}
function insertOnce(hay, needle, block) {
  return hay.includes(needle) ? hay : hay + (hay.endsWith('\n') ? '' : '\n') + block + '\n'
}
function replaceOnce(hay, regex, replacement) {
  if (!regex.test(hay)) return hay
  return hay.replace(regex, replacement)
}
function ensureJsonArray(p) {
  return fs
    .mkdir(path.dirname(p), { recursive: true })
    .then(() => fs.writeFile(p, '[]', { flag: 'wx' }))
    .catch(() => {})
}

// 1) Gallery page
const galleryPagePath = path.join(root, 'src', 'pages', 'Gallery.tsx')
const galleryPageCode = `import { useEffect, useMemo, useState, useCallback } from 'react'
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

const productById = new Map(PRODUCTS.map(p => [p.id, p]))
const allCategories = Array.from(new Set(PRODUCTS.map(p => p.category).filter(Boolean))) as string[]
const allLures = PRODUCTS.map(p => ({ id: p.id, name: p.name }))

const fmt = (n?: number) => (typeof n === 'number' && isFinite(n) ? n : undefined)

export default function Gallery() {
  useEffect(() => setTitle('Gallery'), [])

  // Basic SEO / JSON-LD (first 12 images only)
  useEffect(() => {
    const imgs = CATCHES.slice(0, 12)
      .flatMap(c => c.images.map(im => ({
        '@type': 'ImageObject',
        contentUrl: im.src,
        caption: c.title || undefined
      })))
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Catch Gallery',
      hasPart: imgs
    })
  }, [])

  const [cat, setCat] = useState<string>('')       // product category
  const [lure, setLure] = useState<string>('')     // product id
  const [q, setQ] = useState<string>('')           // search
  const [show, setShow] = useState<number>(24)     // pagination
  const [lightbox, setLightbox] = useState<{i: number; j: number} | null>(null)

  const records = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return CATCHES
      .filter(c => (c.status ? c.status !== 'draft' : true))
      .map(c => ({
        ...c,
        prod: c.lureId ? productById.get(c.lureId) : undefined,
        cat: c.lureId ? (productById.get(c.lureId)?.category || '') : ''
      }))
      .filter(r => (cat ? r.cat === cat : true))
      .filter(r => (lure ? r.lureId === lure : true))
      .filter(r => {
        if (!qq) return true
        const hay = [
          r.title, r.angler, r.location, r.species,
          ...(r.tags || []), r.prod?.name, r.cat
        ].filter(Boolean).join(' ').toLowerCase()
        return hay.includes(qq)
      })
      .sort((a,b) => {
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
  const nextLb = useCallback(() => setLightbox(s => {
    if (!s) return s
    const { i, j } = s
    const imgs = records[i]?.images || []
    if (j + 1 < imgs.length) return { i, j: j + 1 }
    if (i + 1 < records.length) return { i: i + 1, j: 0 }
    return s
  }), [records])
  const prevLb = useCallback(() => setLightbox(s => {
    if (!s) return s
    const { i, j } = s
    if (j - 1 >= 0) return { i, j: j - 1 }
    if (i - 1 >= 0) {
      const prevImgs = records[i - 1]?.images || []
      return { i: i - 1, j: Math.max(0, prevImgs.length - 1) }
    }
    return s
  }), [records])

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
      <h1 className="h1" style={{ marginTop: 0 }}>Gallery</h1>
      <p className="lead">Real catches from real anglers using RIP Custom Lures.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0' }}>
        <select value={cat} onChange={e => { setCat(e.target.value); setShow(24) }}>
          <option value="">All categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={lure} onChange={e => { setLure(e.target.value); setShow(24) }}>
          <option value="">All lures</option>
          {allLures.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>

        <input
          value={q}
          onChange={e => { setQ(e.target.value); setShow(24) }}
          placeholder="Search (angler, tag, species, location)…"
          style={{ padding: '8px 10px', minWidth: 260 }}
        />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16
      }}>
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
                {c.lureId && productById.get(c.lureId)?.name
                  ? <> • <a href={"/product/" + c.lureId} style={{ color: 'var(--brand)' }}>
                      {productById.get(c.lureId)?.name}
                    </a></>
                  : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Load more */}
      {show < records.length && (
        <div style={{ display: 'grid', placeItems: 'center', margin: '24px 0' }}>
          <button className="btn btn-ghost" onClick={() => setShow(s => s + 24)}>
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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
            display: 'grid', placeItems: 'center', zIndex: 1000
          }}
        >
          <div
            className="card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 'min(92vw, 1100px)', width: '100%', padding: 12, background: 'var(--bg-2)' }}
          >
            <LightboxContent rec={records[lightbox.i]} idx={lightbox.j} onPrev={prevLb} onNext={nextLb} />
          </div>
        </div>
      )}
    </main>
  )
}

function LightboxContent({ rec, idx, onPrev, onNext }:{
  rec: CatchItem, idx: number, onPrev: ()=>void, onNext: ()=>void
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          <strong style={{ color: 'var(--text)' }}>{rec.title || rec.species || 'Catch'}</strong>
          {rec.angler ? ' • ' + rec.angler : ''}{rec.location ? ' • ' + rec.location : ''}
          {fmt(rec.lengthIn) ? ' • ' + fmt(rec.lengthIn) + ' in' : ''}
          {fmt(rec.weightLb) ? ' • ' + fmt(rec.weightLb) + ' lb' : ''}
          {rec.lureId ? <> • <a href={"/product/" + rec.lureId} style={{ color: 'var(--brand)' }}>View lure</a></> : null}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onPrev} disabled={idx <= 0}>Prev</button>
          <button className="btn" onClick={onNext} disabled={idx >= len - 1}>Next</button>
        </div>
      </div>
    </div>
  )
}
`

;(async () => {
  // 1) Create Gallery page if missing or overwrite safely
  const gpExists = await exists(galleryPagePath)
  if (!gpExists) await write(galleryPagePath, galleryPageCode)
  else console.log('• Gallery.tsx exists (leaving as-is).')

  // 2) Ensure src/data/catches.json exists (empty array by default)
  await ensureJsonArray(path.join(root, 'src', 'data', 'catches.json'))

  // 3) Build script: scripts/build-catches.mjs
  const buildCatchesPath = path.join(root, 'scripts', 'build-catches.mjs')
  const buildCatchesCode = `// Node 18+
// Build step: bundles /content/catches/*.json -> src/data/catches.json
// Validates shape, skips drafts, normalizes images.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const CONTENT_DIR = path.join(root, 'content', 'catches')
const OUT_FILE = path.join(root, 'src', 'data', 'catches.json')

function asArr(v) { return Array.isArray(v) ? v : [] }
function normStr(v) { return typeof v === 'string' ? v : '' }
function normNum(v) { return typeof v === 'number' && isFinite(v) ? v : undefined }

function normImages(arr) {
  return asArr(arr).map(x => {
    if (typeof x === 'string') return { src: x }
    const src = x?.src || x?.url || x?.image
    if (!src) return null
    return {
      src: src,
      alt: x?.alt || undefined,
      width: normNum(x?.width),
      height: normNum(x?.height)
    }
  }).filter(Boolean)
}

async function main() {
  let files = []
  try { files = await fs.readdir(CONTENT_DIR) } catch { /* dir may not exist yet */ }

  const jsonFiles = files.filter(f => f.endsWith('.json'))
  if (jsonFiles.length === 0) {
    // keep existing if present, else write []
    try {
      const existing = await fs.readFile(OUT_FILE, 'utf8')
      JSON.parse(existing)
      console.log('No catches content found — kept existing src/data/catches.json')
      return
    } catch {
      await fs.mkdir(path.dirname(OUT_FILE), { recursive: true })
      await fs.writeFile(OUT_FILE, '[]')
      console.log('No catches content — wrote empty catches.json')
      return
    }
  }

  const out = []
  const seen = new Set()

  for (const f of jsonFiles) {
    const raw = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, f), 'utf8'))
    const id = normStr(raw.id) || f.replace(/\\.json$/, '')
    const status = raw.status || 'published'
    if (status === 'draft') continue

    const images = normImages(raw.images)
    if (images.length === 0) continue

    if (seen.has(id)) throw new Error('Duplicate catch id: ' + id)
    seen.add(id)

    out.push({
      id,
      title: normStr(raw.title),
      date: normStr(raw.date),
      angler: normStr(raw.angler),
      lureId: normStr(raw.lureId),
      location: normStr(raw.location),
      species: normStr(raw.species),
      lengthIn: normNum(raw.lengthIn),
      weightLb: normNum(raw.weightLb),
      tags: asArr(raw.tags).map(normStr).filter(Boolean),
      images,
      status,
      featured: !!raw.featured,
      sort: normNum(raw.sort),
      publishedAt: normStr(raw.publishedAt) || undefined
    })
  }

  out.sort((a,b) => {
    const as = isFinite(a.sort) ? a.sort : Number.MAX_SAFE_INTEGER
    const bs = isFinite(b.sort) ? b.sort : Number.MAX_SAFE_INTEGER
    if (as !== bs) return as - bs
    const ad = a.publishedAt || a.date || ''
    const bd = b.publishedAt || b.date || ''
    return String(bd).localeCompare(String(ad))
  })

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true })
  await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2))
  console.log('✓ Wrote', out.length, 'catches -> src/data/catches.json')
}

main().catch(e => { console.error(e); process.exit(1) })
`
  if (!(await exists(buildCatchesPath))) await write(buildCatchesPath, buildCatchesCode)
  else console.log('• scripts/build-catches.mjs exists (leaving as-is).')

  // 4) Patch package.json prebuild to include build-catches
  const pkgPath = path.join(root, 'package.json')
  const pkgText = await read(pkgPath)
  if (pkgText) {
    let pkg = JSON.parse(pkgText)
    const prebuild = pkg.scripts?.prebuild || ''
    const want = 'node scripts/build-catches.mjs'
    if (!prebuild.includes('build-catalog.mjs')) {
      // keep original prebuild if present, else create the full chain
      const chain = [
        'node scripts/build-catalog.mjs',
        'node scripts/build-catches.mjs',
        'node scripts/build-sitemap.mjs',
      ].join(' && ')
      pkg.scripts = pkg.scripts || {}
      pkg.scripts.prebuild = prebuild && !prebuild.includes(want) ? prebuild + ' && ' + want : chain
    } else if (!prebuild.includes('build-catches.mjs')) {
      pkg.scripts.prebuild = prebuild.replace(
        'build-catalog.mjs',
        'build-catalog.mjs && node scripts/build-catches.mjs'
      )
    }
    await write(pkgPath, JSON.stringify(pkg, null, 2))
  }

  // 5) Add /gallery route to src/App.tsx (if missing)
  const appPath = path.join(root, 'src', 'App.tsx')
  let appSrc = await read(appPath)
  if (appSrc && !appSrc.includes('path="gallery"')) {
    if (!appSrc.includes("import Gallery from './pages/Gallery'")) {
      appSrc = appSrc.replace(/(\nimport .*?;\s*)$/m, `$1import Gallery from './pages/Gallery'\n`)
    }
    appSrc = appSrc.replace(/<Routes>([\s\S]*?)<\/Routes>/m, (m) =>
      m.replace(/<\/Routes>/m, `  <Route path="gallery" element={<Gallery />} />\n</Routes>`)
    )
    await write(appPath, appSrc)
  } else {
    console.log('• App.tsx already has a /gallery route (or missing).')
  }

  // 6) Add "Gallery" to Header nav if not present
  const headerPath = path.join(root, 'src', 'components', 'Header.tsx')
  let headerSrc = await read(headerPath)
  if (headerSrc && !/Gallery<\/?/.test(headerSrc)) {
    // Handle two common nav patterns (nav('/xyz', 'Label') or <NavLink ...>Label</NavLink>)
    if (headerSrc.includes("{nav('/about', 'About')}")) {
      headerSrc = headerSrc.replace(
        "{nav('/about', 'About')}",
        "{nav('/gallery', 'Gallery')}\n          {nav('/about', 'About')}"
      )
    } else if (headerSrc.includes("{nav('/catalog', 'Catalog')}")) {
      headerSrc = headerSrc.replace(
        "{nav('/catalog', 'Catalog')}",
        "{nav('/catalog', 'Catalog')}\n          {nav('/gallery', 'Gallery')}"
      )
    } else if (headerSrc.includes('About</NavLink>')) {
      headerSrc = headerSrc.replace('About</NavLink>', 'Gallery</NavLink> About</NavLink>')
    }
    await write(headerPath, headerSrc)
  } else {
    console.log('• Header nav already includes Gallery (or missing).')
  }

  // 7) Patch sitemap builder to include /gallery
  const smPath = path.join(root, 'scripts', 'build-sitemap.mjs')
  let smSrc = await read(smPath)
  if (smSrc && !smSrc.includes('/gallery')) {
    smSrc = smSrc.replace(
      /(\{ loc: `\$\{site\}\/catalog`,[\s\S]*?\},)/,
      `$1\n    { loc: \`\${site}/gallery\`, changefreq: 'weekly', priority: '0.6' },`
    )
    await write(smPath, smSrc)
  } else {
    console.log('• build-sitemap.mjs already includes /gallery (or missing).')
  }

  // 8) Patch Decap CMS config to add Catches collection (append if not present)
  const cfgPath = path.join(root, 'public', 'admin', 'config.yml')
  let cfgSrc = await read(cfgPath)
  const collectionBlock = `
  - label: "Catches"
    name: "catches"
    label_singular: "Catch"
    folder: "content/catches"
    create: true
    slug: "{{id}}"
    extension: "json"
    format: "json"
    summary: "{{title}} ({{angler}})"
    fields:
      - { label: "ID (slug)", name: "id", widget: "string", hint: "e.g. catch-2025-10-11-dan-bass" }
      - { label: "Title / Caption", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime", required: false }
      - { label: "Angler", name: "angler", widget: "string", required: false }
      - label: "Lure"
        name: "lureId"
        widget: "relation"
        collection: "products"
        search_fields: ["name","id"]
        value_field: "id"
        display_fields: ["name","id"]
        required: false
      - { label: "Location", name: "location", widget: "string", required: false }
      - { label: "Species", name: "species", widget: "string", required: false }
      - { label: "Length (in)", name: "lengthIn", widget: "number", required: false, min: 0, step: 0.1 }
      - { label: "Weight (lb)", name: "weightLb", widget: "number", required: false, min: 0, step: 0.1 }
      - { label: "Tags", name: "tags", widget: "list", required: false }
      - label: "Images"
        name: "images"
        widget: "list"
        fields:
          - { label: "Image", name: "src", widget: "image" }
          - { label: "Alt", name: "alt", widget: "string", required: false }
      - { label: "Featured", name: "featured", widget: "boolean", default: false, required: false }
      - { label: "Status", name: "status", widget: "select", options: ["draft","published"], default: "published" }
      - { label: "Sort", name: "sort", widget: "number", required: false }
      - { label: "Published At", name: "publishedAt", widget: "datetime", required: false }
`
  if (cfgSrc) {
    if (!/name:\s*["']?catches["']?/.test(cfgSrc)) {
      // Append under collections: or at end
      if (/^collections:\s*$/m.test(cfgSrc) || /(^collections:\s*\n)/m.test(cfgSrc)) {
        cfgSrc = cfgSrc.replace(/(^collections:\s*\n)/m, `$1${collectionBlock}\n`)
      } else if (/^collections:/m.test(cfgSrc)) {
        cfgSrc = cfgSrc.replace(/^collections:.*$/m, (line) => line + '\n' + collectionBlock)
      } else {
        cfgSrc = cfgSrc + `\ncollections:\n${collectionBlock}\n`
      }
      await write(cfgPath, cfgSrc)
    } else {
      console.log("• Decap config already has 'catches' collection.")
    }
  } else {
    console.log('• public/admin/config.yml not found — skipping CMS patch.')
  }

  // 9) Ensure content/catches exists
  await fs.mkdir(path.join(root, 'content', 'catches'), { recursive: true })

  console.log(
    '\nAll set. Add entries via Admin → Catches. Build step will output src/data/catches.json.'
  )
})()
