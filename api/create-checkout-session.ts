//api/create-checkout-session.ts

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const body = req.body as { items: { stripePriceId: string; qty: number }[] }
    if (!Array.isArray(body.items) || body.items.length === 0) return res.status(400).json({ error: 'No items' })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: body.items.map(i => ({ price: i.stripePriceId, quantity: i.qty })),
      allow_promotion_codes: true,
      shipping_address_collection: { allowed_countries: ['US','CA'] },
      success_url: `${process.env.PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_BASE_URL}/cancel`,
      automatic_tax: { enabled: process.env.STRIPE_TAX_ENABLED === 'true' },
      shipping_options: process.env.STRIPE_SHIP_FLAT_RATE_ID ? [
        { shipping_rate: process.env.STRIPE_SHIP_FLAT_RATE_ID }
      ] : undefined
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Checkout error' })
  }
}