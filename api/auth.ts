// /api/auth.ts
// Starts the GitHub OAuth flow (Decap opens this in a popup).
// Env: OAUTH_CLIENT_ID, COMPLETE_URL
import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed')

  const client_id = process.env.OAUTH_CLIENT_ID
  const redirect_uri = process.env.COMPLETE_URL // e.g. https://fishing-lure-site.vercel.app/api/callback
  if (!client_id || !redirect_uri) {
    return res.status(500).json({ error: 'missing_env' })
  }

  // If OAUTH_SCOPE is set, use it; otherwise default to 'public_repo' (public repos) and fall back to 'repo' if needed.
  const scope = process.env.OAUTH_SCOPE || 'public_repo'

  const state = crypto.randomBytes(16).toString('hex')
  res.setHeader(
    'Set-Cookie',
    `gh_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  )

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    scope,
    state,
    allow_signup: 'true',
  })

  res.status(302).setHeader('Location', `https://github.com/login/oauth/authorize?${params}`)
  res.end()
}