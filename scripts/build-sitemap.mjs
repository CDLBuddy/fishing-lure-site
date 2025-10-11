// scripts/build-sitemap.mjs
/**
 * Build a production-ready sitemap.xml
 *
 * What it does
 *  - Reads normalized products from:  src/data/products.json
 *  - Emits a sitemap at:              public/sitemap.xml
 *  - Includes static routes (/, /catalog, /about)
 *  - Adds product detail pages:       /product/:id
 *  - Excludes hidden items:           status === "hidden"
 *
 * Environment
 *  - SITE_URL     Absolute site origin for production (recommended), e.g. https://fishing-lure-site.vercel.app
 *  - VERCEL_URL   Auto-provided on Vercel previews (e.g. my-deploy.vercel.app); used when SITE_URL is unset
 *
 * Integration
 *  - Add to "prebuild" so it runs after your catalog bundler:
 *      "prebuild": "node scripts/build-catalog.mjs && node scripts/build-sitemap.mjs"
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const OUT = path.join(root, 'public', 'sitemap.xml')
const PRODUCTS_JSON = path.join(root, 'src', 'data', 'products.json')

// Prefer SITE_URL (set in Vercel env). Fallback to VERCEL_URL for previews, else localhost.
const site =
  process.env.SITE_URL?.replace(/\/+$/, '') ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')

const iso = (d = new Date()) => new Date(d).toISOString().slice(0, 10)

async function readProducts() {
  try {
    const txt = await fs.readFile(PRODUCTS_JSON, 'utf-8')
    const arr = JSON.parse(txt)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function uniqUrls(urls) {
  const seen = new Set()
  const out = []
  for (const u of urls) {
    if (!seen.has(u.loc)) {
      seen.add(u.loc)
      out.push(u)
    }
  }
  return out
}

async function main() {
  const products = await readProducts()

  // Only public products; sitemap shouldn't list hidden ones.
  const publicProducts = products.filter((p) => (p?.status ?? 'active') !== 'hidden')

  const urls = uniqUrls([
    // Static routes
    { loc: `${site}/`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${site}/catalog`, changefreq: 'weekly', priority: '0.7' },
    { loc: `${site}/gallery`, changefreq: 'weekly', priority: '0.6' },
    { loc: `${site}/about`, changefreq: 'yearly', priority: '0.3' },

    // Product detail pages
    ...publicProducts.map((p) => ({
      loc: `${site}/product/${encodeURIComponent(p.id)}`,
      lastmod: p.publishedAt ? iso(p.publishedAt) : iso(),
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ])

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => {
      return [
        '  <url>',
        `    <loc>${u.loc}</loc>`,
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
        u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : null,
        u.priority ? `    <priority>${u.priority}</priority>` : null,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    }),
    '</urlset>\n',
  ].join('\n')

  await fs.mkdir(path.dirname(OUT), { recursive: true })
  await fs.writeFile(OUT, body)
  console.log(`✓ Wrote sitemap with ${urls.length} urls -> public/sitemap.xml`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})