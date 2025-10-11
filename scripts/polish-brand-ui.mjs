// Polishes the brand UI (header, CSS, meta tags) without touching auth/CMS.
// - Replaces src/components/Header.tsx with a refined version
// - Appends pro-level CSS to src/styles/base.css (nav, cards, buttons, image frames)
// - Injects favicon/OG/Twitter meta into index.html
// Safe to run multiple times; it won't duplicate injections.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// ---------- helpers ----------
async function read(file) {
  try {
    return await fs.readFile(file, 'utf8')
  } catch {
    return null
  }
}
async function write(file, text) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, text)
}
function has(hay, needle) {
  return hay && hay.includes(needle)
}
function appendOnce(orig, block, marker) {
  if (has(orig, marker)) return orig // already added
  return `${orig}\n\n/* ${marker} */\n${block}\n`
}
function insertBefore(orig, markerRegex, block, presenceCheck) {
  if (has(orig, presenceCheck)) return orig
  const idx = orig.search(markerRegex)
  if (idx === -1) return orig + '\n' + block + '\n'
  return orig.slice(0, idx) + block + '\n' + orig.slice(idx)
}

// ---------- 1) Header.tsx ----------
async function updateHeader() {
  const file = path.join(root, 'src', 'components', 'Header.tsx')
  const before = await read(file)
  if (!before) return { file, changed: false, note: 'missing (skipped)' }

  // If it already has the new class hook, skip
  if (has(before, 'site-header')) {
    return { file, changed: false, note: 'already polished' }
  }

  const after = `import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useCart } from '../state/cart'

export default function Header() {
  const { items } = useCart()
  const count = items.reduce((n, i) => n + i.qty, 0)
  const nav = (to: string, label: string) => (
    <NavLink to={to} className={({ isActive }) => \`nav-link\${isActive ? ' active' : ''}\`}>
      {label}
    </NavLink>
  )

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" aria-label="RIP Custom Lures" className="brand">
          <img src="/images/logo-rip.png" alt="RIP Custom Lures" />
        </Link>

        <nav className="main-nav">
          {nav('/catalog', 'Catalog')}
          {nav('/about', 'About')}
          {nav('/cart', count ? \`Cart · \${count}\` : 'Cart')}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
`
  await write(file, after)
  return { file, changed: true }
}

// ---------- 2) base.css ----------
async function updateBaseCss() {
  const file = path.join(root, 'src', 'styles', 'base.css')
  const before = await read(file)
  if (!before) return { file, changed: false, note: 'missing (skipped)' }

  const CSS_HEADER = `
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: saturate(140%) blur(8px);
  background: color-mix(in oklab, var(--bg), transparent 15%);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-3);
  padding: 10px var(--space-3);
}
.brand img { height: 34px; width: auto; display: block; }
.main-nav { display: flex; gap: 6px 14px; align-items: center; }
.nav-link {
  position: relative;
  padding: 10px 2px;
  color: var(--text-dim);
  text-decoration: none;
  font-weight: 600;
  transition: color .18s ease;
}
.nav-link:hover { color: var(--text); }
.nav-link::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: 4px;
  height: 2px; transform: scaleX(0); transform-origin: left;
  background: var(--brand);
  transition: transform .18s ease;
  border-radius: 2px;
}
.nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }
`

  const CSS_POLISH = `
/* Subtle motion + focus polish */
.btn {
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease, opacity .15s ease;
  box-shadow: 0 1px 0 rgba(0,0,0,.05);
}
.btn:hover:not([disabled]) { transform: translateY(-1px); }
.btn:active:not([disabled]) { transform: translateY(0); }
.btn-ghost {
  background: var(--bg-2);
  color: var(--text);
  border: 1px solid var(--border);
}

/* Card lift */
.card {
  transition: transform .18s ease, box-shadow .2s ease, border-color .2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 26px rgba(0,0,0,.25);
  border-color: color-mix(in oklab, var(--brand), transparent 84%);
}

/* Badge pill */
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 8px; border-radius: 999px;
  background: color-mix(in oklab, var(--brand), transparent 85%);
  color: var(--brand); font-weight: 700; font-size: 12px;
  border: 1px solid color-mix(in oklab, var(--brand), transparent 60%);
}

/* Consistent product image framing */
.img-frame {
  position: relative; aspect-ratio: 4 / 3; overflow: hidden;
  border-radius: 12px; background: #e5e7eb1a; border: 1px solid var(--border);
}
.img-frame > img { width: 100%; height: 100%; object-fit: cover; }

/* Fluid headings & hero utility */
h1, .h1 { font-size: clamp(28px, 4.2vw, 44px); line-height: 1.1; letter-spacing: -0.01em; }
h2, .h2 { font-size: clamp(22px, 3.2vw, 32px); line-height: 1.15; letter-spacing: -0.005em; }
.lead { font-size: clamp(16px, 2.2vw, 18px); color: var(--text-dim); }
.hero {
  padding: 28px var(--space-3) 14px;
  border-bottom: 1px solid var(--border);
  background:
    radial-gradient(800px 240px at 0% -10%, color-mix(in oklab, var(--brand), transparent 92%), transparent 60%),
    var(--bg);
}
`

  let after = before
  after = appendOnce(after, CSS_HEADER, 'POLISH: header/nav styles')
  after = appendOnce(after, CSS_POLISH, 'POLISH: buttons/cards/badges/hero/img-frame')
  if (after !== before) await write(file, after)
  return { file, changed: after !== before }
}

// ---------- 3) index.html meta/og ----------
async function updateIndexHtml() {
  const file = path.join(root, 'index.html')
  const before = await read(file)
  if (!before) return { file, changed: false, note: 'missing (skipped)' }

  const META = `
    <!-- POLISH: brand favicon & social preview -->
    <link rel="icon" href="/images/logo-rip.png">
    <link rel="apple-touch-icon" href="/images/logo-rip-512.png" sizes="180x180">
    <meta property="og:site_name" content="RIP Custom Lures">
    <meta property="og:title" content="RIP Custom Lures">
    <meta property="og:description" content="Custom, hand-made fishing lures. Built to be fished—not framed.">
    <meta property="og:image" content="/images/logo-rip-512.png">
    <meta name="twitter:card" content="summary_large_image">
`

  const headClose = /<\/head>/i
  const after = insertBefore(before, headClose, META, 'og:site_name" content="RIP Custom Lures"')
  if (after !== before) await write(file, after)
  return { file, changed: after !== before }
}

// ---------- run all ----------
const results = []
results.push(await updateHeader())
results.push(await updateBaseCss())
results.push(await updateIndexHtml())

const summary = results
  .map((r) => {
    const s = path.relative(root, r.file)
    return `- ${s}: ${r.changed ? 'UPDATED' : 'ok'}${r.note ? ` (${r.note})` : ''}`
  })
  .join('\n')

console.log('Brand polish completed:\n' + summary)
console.log('\nNext (optional):')
console.log('• In ProductCard.tsx, wrap images with <div className="img-frame"><img .../></div>')
console.log('• In Home.tsx, wrap hero content in <section className="hero container">…</section>')
