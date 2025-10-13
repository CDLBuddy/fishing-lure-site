// scripts/build-catches.mjs
// Node 18+
// Build step: bundles /content/catches/*.json -> src/data/catches.json
// Validates shape, skips drafts, normalizes images, warns on orphan lureId.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const CONTENT_DIR = path.join(root, 'content', 'catches')
const OUT_FILE = path.join(root, 'src', 'data', 'catches.json')

// We can warn if a lureId doesn't match a product
const PRODUCTS_FILE = path.join(root, 'src', 'data', 'products.json')

const asArr = (v) => (Array.isArray(v) ? v : [])
const normStr = (v) => (typeof v === 'string' ? v.trim() : '')
const normNum = (v) =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined

function normImages(arr) {
  return asArr(arr)
    .map((x) => {
      if (typeof x === 'string') return { src: x }
      const src = x?.src || x?.url || x?.image
      if (!src) return null
      const w = Number.isFinite(x?.width) ? Number(x.width) : undefined
      const h = Number.isFinite(x?.height) ? Number(x.height) : undefined
      const alt = normStr(x?.alt) || undefined
      return { src: String(src), alt, width: w, height: h }
    })
    .filter(Boolean)
}

const warn = (...m) => console.warn('⚠️ [catches]', ...m)

async function readProductsSet() {
  try {
    const txt = await fs.readFile(PRODUCTS_FILE, 'utf8')
    const arr = JSON.parse(txt)
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.map((p) => p?.id).filter(Boolean))
  } catch {
    // No products yet? Fine--just no cross-check.
    return new Set()
  }
}

async function main() {
  let files = []
  try {
    files = await fs.readdir(CONTENT_DIR)
  } catch {
    // dir may not exist yet
  }

  const jsonFiles = files.filter((f) => f.endsWith('.json'))

  if (jsonFiles.length === 0) {
    // keep existing if present, else write []
    try {
      const existing = await fs.readFile(OUT_FILE, 'utf8')
      JSON.parse(existing)
      console.log('No catches content found -- kept existing src/data/catches.json')
      return
    } catch {
      await fs.mkdir(path.dirname(OUT_FILE), { recursive: true })
      await fs.writeFile(OUT_FILE, '[]')
      console.log('No catches content -- wrote empty catches.json')
      return
    }
  }

  const productIds = await readProductsSet()

  const out = []
  const seen = new Set()

  for (const f of jsonFiles) {
    const filePath = path.join(CONTENT_DIR, f)
    let raw
    try {
      raw = JSON.parse(await fs.readFile(filePath, 'utf8'))
    } catch (e) {
      warn(`Skipping "${f}": invalid JSON (${e?.message || 'parse error'})`)
      continue
    }

    const id = normStr(raw.id) || f.replace(/\.json$/i, '')
    if (!id) {
      warn(`Skipping "${f}": missing id`)
      continue
    }

    if (seen.has(id)) {
      warn(`Skipping "${f}": duplicate id "${id}"`)
      continue
    }

    const status = raw.status || 'published'
    if (status === 'draft') {
      continue
    }

    const images = normImages(raw.images)
    if (images.length === 0) {
      warn(`Skipping "${f}": no images`)
      continue
    }

    const lureId = normStr(raw.lureId)
    if (lureId && !productIds.has(lureId)) {
      warn(`"${id}" references unknown lureId "${lureId}" (no matching product id)`)
    }

    seen.add(id)

    out.push({
      id,
      title: normStr(raw.title),
      date: normStr(raw.date),
      angler: normStr(raw.angler),
      lureId: lureId || undefined,
      location: normStr(raw.location),
      species: normStr(raw.species),
      lengthIn: normNum(raw.lengthIn),
      weightLb: normNum(raw.weightLb),
      tags: asArr(raw.tags).map(normStr).filter(Boolean),
      images,
      status,
      featured: !!raw.featured,
      sort: normNum(raw.sort),
      publishedAt: normStr(raw.publishedAt) || undefined,
    })
  }

  out.sort((a, b) => {
    const as = Number.isFinite(a.sort) ? a.sort : Number.MAX_SAFE_INTEGER
    const bs = Number.isFinite(b.sort) ? b.sort : Number.MAX_SAFE_INTEGER
    if (as !== bs) return as - bs
    const ad = a.publishedAt || a.date || ''
    const bd = b.publishedAt || b.date || ''
    return String(bd).localeCompare(String(ad))
  })

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true })
  await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2))
  console.log(`✓ Wrote ${out.length} catches -> src/data/catches.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})