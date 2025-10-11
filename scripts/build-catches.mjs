// Node 18+
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
    const id = normStr(raw.id) || f.replace(/\.json$/, '')
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
