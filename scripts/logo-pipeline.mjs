/**
 * RIP Custom Lures -- High-fidelity logo pipeline
 *
 * INPUT
 *   assets/logo/source.png  (hi-res; ideally ≥ 2400px wide; transparent bg)
 *
 * OUTPUT (to public/images/)
 *   logo-rip@2x.png  (2400w)     • normalized master
 *   logo-rip.png     (1200w)     • standard header fallback
 *   logo-rip@2x.webp,  logo-rip.webp
 *   logo-rip@2x.avif,  logo-rip.avif
 *   logo-rip.svg                 • best color trace (auto-selected)
 *   logo-rip-mono.svg            • one-color mark
 *   ../_logo-preview.html        • quick visual QA page
 *
 * BEHAVIOR
 *   1) Normalize / upscale with sharp (soft fallback if sharp fails)
 *   2) Sweep Posterize (color) params; score each by pixel MAE vs source → pick lowest error
 *   3) If error > 0.065, widen search (steps 16–20, optTolerance 0.3–0.5) and retry
 *   4) Build mono mark via Potrace (threshold sweep → best)
 *   5) Optimize SVGs via SVGO; keep viewBox; remove dimensions
 *   6) If tracing fails (e.g., CI env), keep PNG/WebP/AVIF and log a warning (no hard fail)
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import potracePkg from 'potrace'
import { optimize } from 'svgo'

const { Potrace, Posterizer } = potracePkg

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const SRC = path.join(root, 'assets', 'logo', 'source.png')
const OUTDIR = path.join(root, 'public', 'images')
const OUT_PNG2 = path.join(OUTDIR, 'logo-rip@2x.png')
const OUT_PNG = path.join(OUTDIR, 'logo-rip.png')
const OUT_WEBP2 = path.join(OUTDIR, 'logo-rip@2x.webp')
const OUT_WEBP = path.join(OUTDIR, 'logo-rip.webp')
const OUT_AVIF2 = path.join(OUTDIR, 'logo-rip@2x.avif')
const OUT_AVIF = path.join(OUTDIR, 'logo-rip.avif')
const OUT_SVG = path.join(OUTDIR, 'logo-rip.svg')
const OUT_SVG_MONO = path.join(OUTDIR, 'logo-rip-mono.svg')

const PREVIEW = path.join(root, 'public', '_logo-preview.html')

const TARGET_W_2X = 2400
const TARGET_W = 1200

const log = (...a) => console.log('[logo]', ...a)
const warn = (...a) => console.warn('[logo]', ...a)

async function exists(p) {
  try {
    await fs.stat(p)
    return true
  } catch {
    return false
  }
}

function svgo(svg) {
  const { data } = optimize(svg, {
    multipass: true,
    plugins: [
      { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
      'convertStyleToAttrs',
      'removeDimensions',
    ],
  })
  return data
}

async function normalizeRasterOutputs() {
  await fs.mkdir(OUTDIR, { recursive: true })
  try {
    const base = sharp(SRC).trim().toColorspace('srgb')
    const meta = await base.metadata()
    const width = meta.width || TARGET_W_2X
    const up = Math.max(1, Math.ceil(TARGET_W_2X / width))

    // Master @2x PNG
    await base
      .resize({ width: width * up })
      .sharpen(0.8)
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(OUT_PNG2)

    // 1x PNG
    await sharp(OUT_PNG2)
      .resize({ width: TARGET_W })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(OUT_PNG)

    // WebP & AVIF (1x + 2x)
    await sharp(OUT_PNG2).webp({ quality: 86 }).toFile(OUT_WEBP2)
    await sharp(OUT_PNG2).resize({ width: TARGET_W }).webp({ quality: 86 }).toFile(OUT_WEBP)
    await sharp(OUT_PNG2).avif({ quality: 70 }).toFile(OUT_AVIF2)
    await sharp(OUT_PNG2).resize({ width: TARGET_W }).avif({ quality: 70 }).toFile(OUT_AVIF)

    log('✓ raster outputs:', path.basename(OUT_PNG2), path.basename(OUT_PNG), 'webp/avif')
    return true
  } catch (e) {
    warn('sharp failed, falling back to copying source only:', e?.message || e)
    if (!(await exists(SRC))) throw new Error(`Missing ${path.relative(root, SRC)}`)
    // Best-effort copy as 2x; create a 1x by resizing only if sharp works
    await fs.mkdir(OUTDIR, { recursive: true })
    await fs.copyFile(SRC, OUT_PNG2)
    try {
      await sharp(SRC).resize({ width: TARGET_W }).png({ compressionLevel: 9 }).toFile(OUT_PNG)
    } catch {
      await fs.copyFile(SRC, OUT_PNG)
    }
    return false
  }
}

async function renderSvgToPng(svgStr, width = TARGET_W) {
  return await sharp(Buffer.from(svgStr)).resize({ width }).png().toBuffer()
}

async function maeAgainst(sourceBuf, candidateBuf) {
  const a = sharp(sourceBuf)
  const b = sharp(candidateBuf)
  const { width, height } = await a.metadata()
  const sa = await a.ensureAlpha().raw().toBuffer()
  const sb = await b.resize({ width, height }).ensureAlpha().raw().toBuffer()
  let sum = 0
  for (let i = 0; i < sa.length; i++) sum += Math.abs(sa[i] - sb[i])
  return sum / sa.length / 255
}

function countPaths(svgStr) {
  return (svgStr.match(/<path\b/gi) || []).length
}

async function posterizeToSvg(opts) {
  return await new Promise((resolve, reject) => {
    new Posterizer(opts).loadImage(OUT_PNG2, function (err) {
      if (err) return reject(err)
      this.getSVG((err2, svg) => (err2 ? reject(err2) : resolve(svg)))
    })
  })
}

async function potraceMono(threshold) {
  return await new Promise((resolve, reject) => {
    new Potrace({
      turnPolicy: 'minority',
      turdSize: 20,
      optCurve: true,
      optTolerance: 0.4,
      threshold,
      background: 'transparent',
      color: '#000000',
    }).loadImage(OUT_PNG2, function (err) {
      if (err) return reject(err)
      this.getSVG((err2, svg) => (err2 ? reject(err2) : resolve(svg)))
    })
  })
}

async function buildColorSvg() {
  const src1200 = await sharp(OUT_PNG2).resize({ width: TARGET_W }).png().toBuffer()

  const initial = {
    stepsList: [8, 10, 12, 14],
    thresholds: [160, 170, 180, 190, 200],
    turdSizes: [10, 18, 25],
    optTols: [0.35, 0.45, 0.6],
  }
  const widen = {
    stepsList: [16, 18, 20],
    thresholds: [170, 180, 190],
    turdSizes: [12, 18, 24],
    optTols: [0.3, 0.4, 0.5],
  }

  async function sweep(grid) {
    let best = null
    for (const steps of grid.stepsList) {
      for (const threshold of grid.thresholds) {
        for (const turdSize of grid.turdSizes) {
          for (const optTolerance of grid.optTols) {
            const rawSvg = await posterizeToSvg({
              steps,
              threshold,
              turdSize,
              optTolerance,
              turnPolicy: 'minority',
            })
            const svg = svgo(rawSvg)
            const png = await renderSvgToPng(svg, TARGET_W)
            const score = await maeAgainst(src1200, png)
            const paths = countPaths(svg)
            const size = Buffer.byteLength(svg)
            const cand = { svg, score, paths, size, steps, threshold, turdSize, optTolerance }
            if (
              !best ||
              cand.score < best.score - 1e-6 ||
              (Math.abs(cand.score - best.score) < 1e-6 &&
                (cand.paths < best.paths || (cand.paths === best.paths && cand.size < best.size)))
            ) {
              best = cand
            }
          }
        }
      }
    }
    return best
  }

  let best = await sweep(initial)
  if (best?.score > 0.065) {
    log(`color sweep widening (current error≈${best.score.toFixed(4)})`)
    const wider = await sweep(widen)
    if (
      wider &&
      (wider.score < best.score - 1e-6 ||
        (Math.abs(wider.score - best.score) < 1e-6 &&
          (wider.paths < best.paths || wider.size < best.size)))
    ) {
      best = wider
    }
  }

  if (!best) throw new Error('Posterize sweep produced no candidates')
  await fs.writeFile(OUT_SVG, best.svg)
  log(
    `✓ color svg -> ${path.basename(OUT_SVG)}  (steps=${best.steps}, thr=${best.threshold}, turd=${
      best.turdSize
    }, tol=${best.optTolerance}, err≈${best.score.toFixed(4)}, paths=${best.paths})`
  )
  return best
}

async function buildMonoSvg() {
  const src1200 = await sharp(OUT_PNG2).resize({ width: TARGET_W }).png().toBuffer()
  const trials = [150, 160, 170, 180, 190, 200]
  let best = null
  for (const threshold of trials) {
    const raw = await potraceMono(threshold)
    const svg = svgo(raw)
    const png = await renderSvgToPng(svg, TARGET_W)
    const score = await maeAgainst(src1200, png)
    const paths = countPaths(svg)
    const size = Buffer.byteLength(svg)
    const cand = { svg, score, paths, size, threshold }
    if (
      !best ||
      cand.score < best.score - 1e-6 ||
      (Math.abs(cand.score - best.score) < 1e-6 &&
        (cand.paths < best.paths || cand.size < best.size))
    ) {
      best = cand
    }
  }
  await fs.writeFile(OUT_SVG_MONO, best.svg)
  log(
    `✓ mono svg -> ${path.basename(OUT_SVG_MONO)} (thr=${best.threshold}, err≈${best.score.toFixed(
      4
    )}, paths=${best.paths})`
  )
  return best
}

async function writePreview(colorBest, monoBest) {
  const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Logo Preview</title>
<style>
  :root { color-scheme: light dark; --bg:#0b1220; --card:#0f172a; --txt:#e6edf3; }
  body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif; background: var(--bg); color: var(--txt) }
  .wrap { padding:24px; display:grid; gap:16px; max-width:1100px; margin:0 auto }
  .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:16px }
  .card { background: var(--card); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:16px }
  .plate { display:flex; align-items:center; justify-content:center; padding:12px; border-radius:10px; background:#0e1528; border:1px solid rgba(255,255,255,.08) }
  img, svg { display:block; max-width:100%; height:auto }
  code { background:#0003; padding:2px 6px; border-radius:6px }
</style>
<div class="wrap">
  <h1>Logo Preview</h1>
  <div>Best color trace: <code>steps=${colorBest.steps}, threshold=${
    colorBest.threshold
  }, turdSize=${colorBest.turdSize}, optTolerance=${
    colorBest.optTolerance
  }, error≈${colorBest.score.toFixed(4)}</code></div>
  <div>Best mono trace: <code>threshold=${monoBest.threshold}, error≈${monoBest.score.toFixed(
    4
  )}</code></div>
  <div class="grid">
    <div class="card"><h3>Source (normalized)</h3><img src="/images/logo-rip@2x.png" alt=""></div>
    <div class="card"><h3>Color SVG</h3><div class="plate"><img src="/images/logo-rip.svg" alt=""></div></div>
    <div class="card"><h3>Mono SVG</h3><div class="plate"><img src="/images/logo-rip-mono.svg" alt=""></div></div>
    <div class="card"><h3>WebP</h3><div class="plate"><img src="/images/logo-rip.webp" alt=""></div></div>
    <div class="card"><h3>AVIF</h3><div class="plate"><img src="/images/logo-rip.avif" alt=""></div></div>
  </div>
</div>`
  await fs.writeFile(PREVIEW, html)
  log('✓ wrote preview ->', path.relative(root, PREVIEW))
}

async function run() {
  if (!(await exists(SRC))) {
    console.error(`❌ Missing ${path.relative(root, SRC)}. Put a hi-res PNG there (≥ 2400px).`)
    process.exit(1)
  }

  const rastersOK = await normalizeRasterOutputs()

  // If sharp failed hard, skip tracing but succeed build with warning
  if (!rastersOK) {
    warn('Skipping SVG tracing due to sharp failure; PNGs are in place.')
    return
  }

  try {
    const colorBest = await buildColorSvg()
    const monoBest = await buildMonoSvg()
    await writePreview(colorBest, monoBest)
  } catch (e) {
    warn('Tracing failed; keeping raster outputs only:', e?.message || e)
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
