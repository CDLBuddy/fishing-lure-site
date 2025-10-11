# RIP Custom Lures (Vite + React + TypeScript)

RIP Custom Lures is a fast static storefront for showcasing a curated fishing lure catalog. The app is built with Vite, React, and TypeScript, serves a static JSON product catalog, and keeps all cart logic on the client. Stripe Checkout is optional and currently disabled.

## 🎯 Goals

- Static product catalog with responsive browsing and rich product detail pages
- Client-side cart powered by Zustand, persisted to `localStorage`
- Clean, modern theme with dark/light toggle defined by CSS tokens
- Solid SEO fundamentals: dynamic titles and JSON-LD product metadata
- Deployable as an SPA on Vercel with rewrites for client-side routing

## 🗂️ Project Structure

```
src/
	components/     # UI building blocks (cards, filters, header, footer)
	pages/          # Router pages (Home, Catalog, Product, Cart, etc.)
	state/          # Zustand stores (cart)
	utils/          # Helpers (currency, SEO)
	data/           # Static product JSON feed
	styles/         # Global CSS tokens and base styles
api/
	create-checkout-session.ts # Serverless function stub for Stripe (future)
```

## 🚀 Getting Started

```powershell
npm install
npm run dev
```

Environment variables live in `.env`. Stripe checkout is disabled by default:

```
VITE_CHECKOUT_ENABLED=false
```

## 🧰 Tooling & Conventions

- Formatting: Prettier (`.prettierrc`), EditorConfig (`.editorconfig`)
- Suggested VS Code extensions: Prettier, ESLint, Code Spell Checker
- TypeScript path: configured via `tsconfig.json`
- Tests: not configured yet; add Vitest or Playwright when needed

## 🛣️ Roadmap

- ✅ Persist cart via `zustand/middleware`
- ✅ Global CSS tokens and base styles, dark/light theme
- ✅ Product JSON-LD injection for SEO
- ⏳ Contact form via Vercel function with transactional email
- ⏳ Toast notifications for cart actions
- ⏳ Stripe Checkout enablement once keys are configured

 ## Owner Guide
Owners: use the admin at https://fishing-lure-site.vercel.app/admin

Full instructions: [owner_guide.md](./owner_guide.md)

## 📄 License

Proprietary. All rights reserved unless explicit permission is granted.
