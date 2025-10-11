// Node 18+
// Quick repo audit with a special focus on Decap + GitHub OAuth wiring.
// - Validates package.json structure
// - Checks vercel.json rewrites/headers
// - Checks admin/index.html and admin/config.yml essentials
// - Checks OAuth env wiring hints via .env (optional)
// - Verifies products.json exists and local images resolve

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const die = (m) => {
  console.error('✗', m)
  process.exitCode = 1
}
const ok = (m) => console.log('✓', m)
const warn = (m) => console.warn('! ', m)

async function readJSON(p) {
  try {
    return JSON.parse(await fs.readFile(p, 'utf-8'))
  } catch {
    return null
  }
}
async function readText(p) {
  try {
    return await fs.readFile(p, 'utf-8')
  } catch {
    return ''
  }
}

function has(obj, pathStr) {
  return pathStr.split('.').reduce((o, k) => (o && k in o ? o[k] : undefined), obj) !== undefined
}

async function checkPackageJson() {
  const file = path.join(root, 'package.json')
  const pkg = await readJSON(file)
  if (!pkg) return die('package.json is missing or invalid JSON')

  // duplicate keys: dependencies/devDependencies (common user error)
  const raw = await readText(file)
  const depsCount = (raw.match(/"dependencies"\s*:/g) || []).length
  if (depsCount > 1) die('package.json contains duplicate "dependencies" keys')
  const devDepsCount = (raw.match(/"devDependencies"\s*:/g) || []).length
  if (devDepsCount > 1) die('package.json contains duplicate "devDependencies" keys')

  // scripts
  const scripts = pkg.scripts || {}
  if (
    !scripts.prebuild?.includes('build-catalog') ||
    !scripts.prebuild?.includes('build-sitemap')
  ) {
    warn('scripts.prebuild should run build-catalog.mjs and build-sitemap.mjs')
  }
  if (!scripts.build?.includes('vite build')) warn('scripts.build should be "vite build"')
  if (!scripts.dev?.includes('vite')) warn('scripts.dev should be "vite"')
  if (!scripts.preview?.includes('vite preview')) warn('scripts.preview should be "vite preview"')
  if (!scripts.audit?.includes('scripts/validate-repo.mjs'))
    warn('Add "audit": "node scripts/validate-repo.mjs" to scripts')

  // engines
  if (!has(pkg, 'engines.node')) warn('Add "engines": { "node": ">=18.18.0" }')

  ok('package.json looks sane')
}

async function checkVercelJson() {
  const file = path.join(root, 'vercel.json')
  const vjson = await readJSON(file)
  if (!vjson) return die('vercel.json is missing or invalid JSON')

  const rewrites = vjson.rewrites || []
  const headers = vjson.headers || []

  const hasAPI = rewrites.some(
    (r) => r.source === '/api/(.*)' && r.destination?.includes('/api/$1')
  )
  const hasAdmin = rewrites.some(
    (r) => r.source === '/admin' && r.destination === '/admin/index.html'
  )
  const hasAdminSub = rewrites.some(
    (r) => r.source === '/admin/(.*)' && r.destination === '/admin/index.html'
  )
  const hasCatch = rewrites.some((r) => r.source === '/(.*)' && r.destination === '/')

  if (!hasAPI) die('vercel.json rewrites: missing API passthrough for /api/(.*)')
  if (!hasAdmin || !hasAdminSub)
    die('vercel.json rewrites: missing /admin and/or /admin/(.*) to /admin/index.html')
  if (!hasCatch) warn('vercel.json rewrites: consider SPA catch-all {"/(.*)":" /"}')

  const adminHdr = headers.find((h) => h.source === '/admin(.*)')
  if (!adminHdr) warn('vercel.json headers: add X-Robots-Tag noindex for /admin(.*)')

  ok('vercel.json structure OK')
}

async function checkAdminIndex() {
  const file = path.join(root, 'public', 'admin', 'index.html')
  const html = await readText(file)
  if (!html) return die('public/admin/index.html missing')

  if (!html.includes('<base href="/admin/">'))
    warn('admin/index.html: add <base href="/admin/"> for relative assets')
  if (!html.includes('window.CMS_MANUAL_INIT'))
    warn('admin/index.html: set window.CMS_MANUAL_INIT = true before loading Decap')
  if (!html.match(/CMS\.init\(\s*\{[^}]*config_path:\s*'config\.yml'/))
    warn('admin/index.html: call CMS.init({ load_config_file: true, config_path: "config.yml" })')
  if (!html.includes('decap-cms')) warn('admin/index.html: decap-cms script tag missing')

  ok('admin/index.html checks passed')
}

async function checkAdminConfig() {
  const file = path.join(root, 'public', 'admin', 'config.yml')
  const y = await readText(file)
  if (!y) return die('public/admin/config.yml missing')

  const must = [
    [/backend:\s*\n\s*name:\s*github/i, 'backend.name: github'],
    [/repo:\s*CDLBuddy\/fishing-lure-site/i, 'backend.repo: CDLBuddy/fishing-lure-site'],
    [/branch:\s*main/i, 'backend.branch: main'],
    [/base_url:\s*https:\/\/fishing-lure-site\.vercel\.app/i, 'base_url matches deployment'],
    [/auth_endpoint:\s*\/api\/auth/i, 'auth_endpoint: /api/auth'],
    [/media_folder:\s*"?public\/images\/uploads"?/i, 'media_folder public/images/uploads'],
    [/public_folder:\s*"?\/images\/uploads"?/i, 'public_folder /images/uploads'],
    [/folder:\s*"?content\/products"?/i, 'collections.products.folder = content/products'],
  ]

  for (const [re, label] of must) {
    if (!re.test(y)) die(`config.yml: missing or incorrect -> ${label}`)
  }

  ok('admin/config.yml values look correct')
}

async function checkAPIHandlers() {
  const auth = await readText(path.join(root, 'api', 'auth.ts'))
  const cb = await readText(path.join(root, 'api', 'callback.ts'))

  if (!auth) die('/api/auth.ts missing')
  if (!cb) die('/api/callback.ts missing')

  if (!/scope.*'repo'/.test(auth)) warn('api/auth.ts: scope should be "repo" for private repos')
  if (!/authorization:github:success/.test(cb) || !/authorization:github:error/.test(cb)) {
    warn('api/callback.ts: postMessage channels should be authorization:github:success/error')
  }
  if (!/gh_oauth_state=/.test(auth)) warn('api/auth.ts: should set gh_oauth_state cookie')
  if (!/gh_oauth_state=.*Max-Age=0/.test(cb))
    warn('api/callback.ts: should clear gh_oauth_state cookie on return')

  ok('api/auth.ts & api/callback.ts look sane')
}

async function checkEnvHints() {
  const envFile = path.join(root, '.env')
  const text = await readText(envFile)
  if (!text) {
    warn('.env not present locally (fine on Vercel)')
    return
  }

  const must = ['OAUTH_CLIENT_ID=', 'OAUTH_CLIENT_SECRET=', 'COMPLETE_URL=', 'SITE_URL=']
  for (const k of must) {
    if (!text.includes(k)) warn(`.env: consider adding ${k} for local dev`)
  }
  ok('.env presence checked')
}

async function checkDataAndImages() {
  const productsFile = path.join(root, 'src', 'data', 'products.json')
  const products = await readJSON(productsFile)
  if (!Array.isArray(products)) return die('src/data/products.json missing or not an array')

  const missing = []
  for (const p of products) {
    const imgs = Array.isArray(p.images) ? p.images : []
    for (const src of imgs) {
      if (typeof src !== 'string') continue
      if (src.startsWith('/images/uploads/')) {
        const abs = path.join(root, 'public', src.replace(/^\//, ''))
        try {
          await fs.access(abs)
        } catch {
          missing.push(src)
        }
      }
    }
  }
  if (missing.length) die(`Missing local images: \n - ${missing.join('\n - ')}`)
  else ok('products.json exists and local image paths resolve')
}

async function main() {
  console.log('--- Repo audit starting ---')
  await checkPackageJson()
  await checkVercelJson()
  await checkAdminIndex()
  await checkAdminConfig()
  await checkAPIHandlers()
  await checkEnvHints()
  await checkDataAndImages()
  console.log('--- Audit finished ---')
  if (process.exitCode > 0) {
    console.error('One or more checks failed.')
  } else {
    console.log('All checks passed.')
  }
}
main()
