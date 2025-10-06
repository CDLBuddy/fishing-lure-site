//src/types/product.ts

import { z } from 'zod'

export const Variant = z.object({
  id: z.string(),
  label: z.string(),          // "3/8 oz • Chartreuse"
  sku: z.string(),
  stripePriceId: z.string(),  // price_xxx (Stripe)
})

export const Product = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().min(1),
  category: z.enum(['spinnerbait','jig','crankbait','topwater','soft-plastic']),
  images: z.array(z.string()).min(1),
  variants: z.array(Variant).min(1),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
})

export type Product = z.infer<typeof Product>
export type Variant = z.infer<typeof Variant>
export const ProductList = z.array(Product)
export type ProductList = z.infer<typeof ProductList>