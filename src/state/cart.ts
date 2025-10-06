//src/state/cart.ts

import { create } from 'zustand'
import { z } from 'zod'

const CartItem = z.object({
  productId: z.string(),
  variantId: z.string(),
  name: z.string(),
  label: z.string(),
  stripePriceId: z.string(),
  qty: z.number().int().min(1).max(99),
})
export type CartItem = z.infer<typeof CartItem>

type CartState = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (productId: string, variantId: string) => void
  setQty: (productId: string, variantId: string, qty: number) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((s) => {
      const i = s.items.findIndex(
        (x) => x.productId === item.productId && x.variantId === item.variantId,
      )
      if (i >= 0) {
        const items = s.items.slice()
        items[i] = { ...items[i], qty: Math.min(99, items[i].qty + item.qty) }
        return { items }
      }
      return { items: [...s.items, item] }
    }),
  remove: (pid, vid) =>
    set((s) => ({ items: s.items.filter((i) => !(i.productId === pid && i.variantId === vid)) })),
  setQty: (pid, vid, qty) =>
    set((s) => ({
      items: s.items.map((i) => (i.productId === pid && i.variantId === vid ? { ...i, qty } : i)),
    })),
  clear: () => set({ items: [] }),
}))