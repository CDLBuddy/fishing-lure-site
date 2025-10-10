// src/state/cart.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { z } from 'zod'

const clamp = (n: number, min = 1, max = 99) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min))

// Schema
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

// Normalize & validate any incoming item (useful on rehydrate)
function normalize(item: CartItem): CartItem {
  const parsed = CartItem.safeParse({ ...item, qty: clamp(item.qty) })
  if (!parsed.success) {
    // drop invalid items quietly
    throw new Error('Invalid cart item')
  }
  return parsed.data
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const safe = normalize(item)
          const i = s.items.findIndex(
            (x) => x.productId === safe.productId && x.variantId === safe.variantId
          )
          if (i >= 0) {
            const items = s.items.slice()
            const existing = items[i]
            items[i] = { ...existing, qty: clamp(existing.qty + safe.qty) }
            return { items }
          }
          return { items: [...s.items, safe] }
        }),
      remove: (pid, vid) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.productId === pid && i.variantId === vid)),
        })),
      setQty: (pid, vid, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === pid && i.variantId === vid ? { ...i, qty: clamp(qty) } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart-v1',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Only persist items (future-proof if you add derived fields)
      partialize: (s) => ({ items: s.items }),
      migrate: (persisted, version) => {
        // Clean any old/corrupt storage
        const inState = (persisted as any)?.items
        const arr: unknown[] = Array.isArray(inState) ? inState : []
        const items: CartItem[] = []
        for (const x of arr) {
          const res = CartItem.safeParse({ ...(x as object), qty: clamp((x as any)?.qty ?? 1) })
          if (res.success) items.push(res.data)
        }
        return { items }
      },
    }
  )
)