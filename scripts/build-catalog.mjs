// Node 18+
// Build step: bundles /content/products/*.json -> src/data/products.json
// Normalizes images (objects/string), enforces required fields, sorts, and strips drafts.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const CONTENT_DIR = path.join(root, 'content', 'products')
const OUT_FILE = path.join(root, 'src', 'data', 'products.json')

const REQUIRED_CATEGORIES = new Set(['spinnerbait', 'jig', 'crankbait', 'topwater', 'soft-plastic'])

function assert(cond, msg) { if (!cond) throw new Error(msg) }

async function readJson(file) {
  const txt = await fs.readFile(file, 'utf-8')
  return JSON.parse(txt)
}

function normImages(list) {
  if (!Array.isArray(list)) return []
  return list
    .map(x => {
      if (typeof x === 'string') return x
      if (x && typeof x === 'object') return x.src || x.image || x.url || null
      return null
    })
    .filter(Boolean)
}

function normVariants(list) {
  if (!Array.isArray(list)) return []
  return list.map(v => ({
    id: v.id,
    label: v.label,
    sku: v.sku,
    stripePriceId: v.stripePriceId ?? undefined,
    price: typeof v.price === 'number' ? v.price : undefined
  }))
}

function sortProducts(a, b) {
  const as = Number.isFinite(a.sort) ? a.sort : Number.MAX_SAFE_INTEGER
  const bs = Number.isFinite(b.sort) ? b.sort : Number.MAX_SAFE_INTEGER
  if (as !== bs) return as - bs
  return String(a.name).localeCompare(String(b.name))
}

async function main() {
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true })
  let files = []
  try { files = await fs.readdir(CONTENT_DIR) } catch { /* directory may not exist yet */ }

  const products = []
  const seenIds = new Set()

  for (const f of files.filter(f => f.endsWith('.json'))) {
    const raw = await readJson(path.join(CONTENT_DIR, f))

    // Required fields
    assert(raw.id && raw.name && raw.category, `Missing required fields in ${f}`)
    assert(REQUIRED_CATEGORIES.has(raw.category), `Invalid category for ${raw.id} in ${f}`)

    // Drafts/hidden handling
    const status = raw.status || 'active'
    if (status === 'draft') continue // skip drafts entirely
    // keep 'hidden' in output, UI can filter it out if needed

    // Images & variants
    const images = normImages(raw.images)
    assert(images.length > 0, `At least one image required for ${raw.id} in ${f}`)

    const variants = normVariants(raw.variants)
    assert(variants.length > 0, `At least one variant required for ${raw.id} in ${f}`)
    for (const v of variants) {
      assert(v.id && v.label && v.sku, `Variant fields missing on ${raw.id} in ${f}`)
    }

    if (seenIds.has(raw.id)) throw new Error(`Duplicate product id: ${raw.id}`)
    seenIds.add(raw.id)

    products.push({
      id: raw.id,
      name: raw.name,
      description: raw.description ?? '',
      category: raw.category,
      images,
      variants,
      tags: Array.isArray(raw.tags) ? raw.tags : undefined,
      featured: !!raw.featured,
      status,
      sort: Number.isFinite(raw.sort) ? raw.sort : undefined,
      publishedAt: raw.publishedAt || undefined
    })
  }

  products.sort(sortProducts)
  await fs.writeFile(OUT_FILE, JSON.stringify(products, null, 2))
  console.log(`✓ Wrote ${products.length} products to src/data/products.json`)
}

main().catch(e => { console.error(e); process.exit(1) })