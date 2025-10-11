// scripts/brand-update.mjs
// Robust branding updater for RIP Custom Lures (no auth/config changes).
// What it updates (only if present):
//   - src/components/Header.tsx  -> replace "Handmade Lures" brand text with <img> logo
//   - src/utils/seo.ts           -> set title suffix to "RIP Custom Lures"
//   - index.html                 -> <title>, meta description, and favicon link
//   - public/admin/index.html    -> <title> only
//   - src/components/Footer.tsx  -> replace brand text if it exists
//   - src/pages/Home.tsx         -> replace brand text if it exists
//   - src/pages/About.tsx        -> replace brand text if it exists
//   - README.md                  -> replace brand text in docs if it exists
//   - public/owner-guide.html    -> replace brand text in guide if it exists
//   - owner_guide.md             -> replace brand text in markdown guide if it exists
//
// It will NEVER modify:
//   - /api/*
//   - vercel.json
//   - admin/config.yml
//
// Usage:
//   node scripts/brand-update.mjs                    # dry run (no file writes)
//   node scripts/brand-update.mjs --apply            # apply changes
//   node scripts/brand-update.mjs --apply --logo ~/Downloads/rip-logo.png
//
// If --logo is given, copies to public/images/logo-rip.<ext> and uses it in Header + favicon.
// If not, it tries to find an existing public/images/logo-rip.(png|jpg|jpeg|svg|webp).
// If none exists, it references /images/logo-rip.png and warns (add the file later).

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const APPLY = process.argv.includes('--apply')
const logoArgIdx = process.argv.indexOf('--logo')
const logoSource = logoArgIdx >= 0 ? process.argv[logoArgIdx + 1] : null

const OLD = 'Handmade Lures'
const BRAND = 'RIP Custom Lures'
const IMG_DIR = path.join(root, 'public', 'images')
const LOGO_BASENAME = 'logo-rip'
const exts = ['.png', '.jpg', '.jpeg', '.svg', '.webp']

const ensureDir = (p) => fs.mkdir(p, { recursive: true })

async function copyLogoIfProvided() {
  if (!logoSource) return null
  const ext = path.extname(logoSource).toLowerCase()
  if (!exts.includes(ext)) {
    console.warn(`⚠️ Unsupported logo extension "${ext}". Use one of: ${exts.join(', ')}`)
    return null
  }
  await ensureDir(IMG_DIR)
  const dest = path.join(IMG_DIR, `${LOGO_BASENAME}${ext}`)
  if (APPLY) {
    await fs.copyFile(path.resolve(logoSource), dest)
    console.log(`✓ Copied logo -> ${path.relative(root, dest)}`)
  } else {
    console.log(`(dry run) Would copy logo -> ${path.relative(root, dest)}`)
  }
  return `/images/${LOGO_BASENAME}${ext}`
}

async function findExistingLogoPublicPath() {
  try {
    const files = await fs.readdir(IMG_DIR)
    const found = files.find(
      (f) => exts.includes(path.extname(f).toLowerCase()) && f.startsWith(`${LOGO_BASENAME}`)
    )
    return found ? `/images/${found}` : null
  } catch {
    return null
  }
}

async function read(file) {
  try {
    return await fs.readFile(file, 'utf-8')
  } catch {
    return null
  }
}

async function write(file, content) {
  if (!APPLY) return console.log(`(dry run) Would update ${path.relative(root, file)}`)
  await fs.writeFile(file, content)
  console.log(`✓ Updated ${path.relative(root, file)}`)
}

function replaceAll(txt, from, to) {
  return txt.split(from).join(to)
}

function patchIfExists(fileRel, transform) {
  return (async () => {
    const file = path.join(root, fileRel)
    const src = await read(file)
    if (src == null) return
    const out = transform(src)
    if (out != null && out !== src) await write(file, out)
  })()
}

async function main() {
  let logoPublicPath = await copyLogoIfProvided()
  if (!logoPublicPath) logoPublicPath = await findExistingLogoPublicPath()
  if (!logoPublicPath) {
    logoPublicPath = '/images/logo-rip.png'
    console.warn(
      `⚠️ No logo found. Referencing ${logoPublicPath}. Place your file at public${logoPublicPath}.`
    )
  }

  // 1) Header.tsx — swap brand text with <img> (keeps link + styles)
  await patchIfExists('src/components/Header.tsx', (txt) => {
    // Replace link contents "Handmade Lures" -> <img ... />
    const imgTag = `<img src="${logoPublicPath}" alt="${BRAND}" style={{ height: 32 }} />`
    const linkContent = /(>|\})\s*Handmade Lures\s*<\/Link>/
    let out = txt
    if (linkContent.test(out)) {
      out = out.replace(linkContent, `$1 ${imgTag}</Link>`)
    }
    // Also replace any plain text mentions (e.g., aria-labels)
    out = replaceAll(out, OLD, BRAND)
    return out
  })

  // 2) SEO title suffix
  await patchIfExists('src/utils/seo.ts', (txt) => {
    let out = txt.replace(/(['"])Handmade Lures\1/g, `'${BRAND}'`)
    // handle any stray text
    out = replaceAll(out, OLD, BRAND)
    return out
  })

  // 3) index.html — <title>, meta description, favicon link
  await patchIfExists('index.html', (txt) => {
    let out = txt

    // <title>
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${BRAND}</title>`)

    // meta description (if exists)
    out = out.replace(
      /(<meta\s+name=["']description["']\s+content=["'])[^"']*(["'][^>]*>)/i,
      `$1Custom, hand-made fishing lures by ${BRAND}.$2`
    )

    // favicon: replace or insert a <link rel="icon">
    if (/<link[^>]+rel=["']icon["']/i.test(out)) {
      out = out.replace(
        /<link[^>]+rel=["']icon["'][^>]*>/i,
        `<link rel="icon" href="${logoPublicPath}">`
      )
    } else {
      out = out.replace(/<\/head>/i, `  <link rel="icon" href="${logoPublicPath}">\n</head>`)
    }

    // any plain text references
    out = replaceAll(out, OLD, BRAND)
    return out
  })

  // 4) Admin title
  await patchIfExists('public/admin/index.html', (txt) =>
    txt.replace(/<title>.*<\/title>/i, `<title>Admin • ${BRAND}</title>`)
  )

  // 5) Footer (if it mentions the brand)
  await patchIfExists('src/components/Footer.tsx', (txt) => replaceAll(txt, OLD, BRAND))

  // 6) Home/About pages (if they mention the brand)
  await patchIfExists('src/pages/Home.tsx', (txt) => replaceAll(txt, OLD, BRAND))
  await patchIfExists('src/pages/About.tsx', (txt) => replaceAll(txt, OLD, BRAND))

  // 7) README + Owner Guides
  await patchIfExists('README.md', (txt) => replaceAll(txt, OLD, BRAND))
  await patchIfExists('owner_guide.md', (txt) => replaceAll(txt, OLD, BRAND))
  await patchIfExists('public/owner-guide.html', (txt) => replaceAll(txt, OLD, BRAND))

  console.log(APPLY ? 'Done.' : 'Dry run complete. Re-run with --apply to write changes.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
