# Logo Assets

Place your highest-resolution logo at:

```
assets/logo/source.png
```

## Tips:

- **Transparent background** gives cleaner vectors
- **Width ≥ 2400 px** recommended for best quality
- PNG format works best as source

## Output

When you run `npm run build` or `npm run logo:build`, the pipeline generates:

**Raster Formats:**

- `public/images/logo-rip@2x.png` (2400w) - High-res master
- `public/images/logo-rip.png` (1200w) - Standard header fallback
- `public/images/logo-rip@2x.webp` (2400w) - WebP format
- `public/images/logo-rip.webp` (1200w) - WebP format
- `public/images/logo-rip@2x.avif` (2400w) - AVIF format (most efficient)
- `public/images/logo-rip.avif` (1200w) - AVIF format

**Vector Formats:**

- `public/images/logo-rip.svg` - Best color trace (auto-selected from 240+ candidates)
- `public/images/logo-rip-mono.svg` - Single-color mark (for watermarks, favicons)

**Preview:**

- `public/_logo-preview.html` - Visual QA page showing all formats

## How It Works

The pipeline automatically:

1. Normalizes and upscales your source image
2. Tests 240+ different SVG tracing parameters
3. Scores each by pixel-perfect comparison to source
4. Picks the best quality/size ratio
5. Generates all modern image formats
6. Creates a preview page for quick review

No manual tweaking needed!
