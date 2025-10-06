//src/utils/currency.ts

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const fmtUSD = (n: number) => USD.format(n)