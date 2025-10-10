// src/utils/currency.ts

// Cached formatters (faster than constructing every call)
const USD2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const USD0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

/** Standard USD with cents (e.g., $7.99) */
export const fmtUSD = (n: number): string => USD2.format(n)

/** USD with no cents (e.g., $8) -- handy for whole-dollar pricing or totals */
export const fmtUSDNoCents = (n: number): string => USD0.format(n)

/** Graceful formatter that returns undefined when value is missing/invalid */
export const fmtMaybeUSD = (n: number | null | undefined): string | undefined =>
  typeof n === 'number' && isFinite(n) ? fmtUSD(n) : undefined

/** Formats a min–max price range (e.g., "$6.99 – $9.99" or a single value if equal) */
export const fmtUSDRange = (a: number, b: number): string =>
  a === b ? fmtUSD(a) : `${fmtUSD(a)} – ${fmtUSD(b)}`