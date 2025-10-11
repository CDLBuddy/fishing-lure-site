// /api/callback.ts
// Completes GitHub OAuth and hands token back to Decap CMS popup.
// Env: OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, COMPLETE_URL
import type { VercelRequest, VercelResponse } from '@vercel/node'

function popup(res: VercelResponse, kind: 'success' | 'error', payload: unknown) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  const messageString = `authorization:github:${kind}:${JSON.stringify(payload)}`
  res.status(200).send(`<!doctype html><html><head><title>OAuth Callback</title></head><body>
  <p>Authorization ${kind}. This window should close automatically...</p>
  <script>
    (function() {
      try {
        var message = ${JSON.stringify(messageString)};
        console.log('Sending message:', message);
        if (window.opener) {
          window.opener.postMessage(message, '*');
          console.log('Message sent to opener');
        } else {
          console.error('No window.opener found');
        }
      } catch(e) {
        console.error('Error sending message:', e);
      }
      setTimeout(function() {
        window.close();
      }, 1000);
    })();
  </script></body></html>`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed')

  const { code, state } = req.query as { code?: string; state?: string }
  const cookieState = (req.headers.cookie || '')
    .split(';').map(s => s.trim())
    .find(s => s.startsWith('gh_oauth_state='))?.split('=')[1]

  if (!code || !state || !cookieState || state !== cookieState) {
    return popup(res, 'error', { error: 'invalid_state_or_code' })
  }

  // Clear the state cookie
  res.setHeader('Set-Cookie', 'gh_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')

  const client_id = process.env.OAUTH_CLIENT_ID
  const client_secret = process.env.OAUTH_CLIENT_SECRET
  const redirect_uri = process.env.COMPLETE_URL
  if (!client_id || !client_secret || !redirect_uri) {
    return popup(res, 'error', { error: 'missing_env' })
  }

  // Exchange code -> token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({ client_id, client_secret, code, redirect_uri }),
  })

  if (!tokenRes.ok) {
    return popup(res, 'error', { error: 'token_exchange_failed', status: tokenRes.status })
  }

  const data = (await tokenRes.json()) as { access_token?: string; error?: string }
  if (!data.access_token) {
    return popup(res, 'error', { error: data.error || 'no_token' })
  }

  return popup(res, 'success', { token: data.access_token })
}
