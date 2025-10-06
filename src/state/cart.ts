import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const i = s.items.findIndex(
            (x) => x.productId === item.productId && x.variantId === item.variantId
          )
          if (i >= 0) {
            const items = s.items.slice()
            const existing = items[i]
            if (!existing) {
              return { items: s.items }
            }
            items[i] = { ...existing, qty: Math.min(99, existing.qty + item.qty) }
            return { items }
          }
          return { items: [...s.items, item] }
        }),
      remove: (pid, vid) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.productId === pid && i.variantId === vid)),
        })),
      setQty: (pid, vid, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === pid && i.variantId === vid ? { ...i, qty } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
