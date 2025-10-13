// src/components/Header.tsx
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../state/cart'

export default function Header() {
  const { items } = useCart()
  const count = items.reduce((n, i) => n + i.qty, 0)

  const nav = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
    >
      {label}
    </NavLink>
  )

  return (
    <>
      {/* Accessible skip link (styled in base.css) */}
      <a href="#main" className="sr-only">Skip to main content</a>

      <header className="site-header" role="banner">
        <div className="container header-inner">
          {/* Brand */}
          <Link to="/" aria-label="RIP Custom Lures" className="brand">
            <span className="brand-plate" aria-hidden="true">
              <picture>
                {/* best quality first */}
                <source
                  srcSet="/images/logo-rip.avif 1x, /images/logo-rip@2x.avif 2x"
                  type="image/avif"
                />
                <source
                  srcSet="/images/logo-rip.webp 1x, /images/logo-rip@2x.webp 2x"
                  type="image/webp"
                />
                {/* fallback PNG (2x-aware) */}
                <img
                  className="logo"
                  src="/images/logo-rip.png"
                  srcSet="/images/logo-rip.png 1x, /images/logo-rip@2x.png 2x"
                  width={160}
                  height={48}
                  alt="RIP Custom Lures"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  draggable={false}
                />
              </picture>
            </span>
          </Link>

          {/* Nav */}
          <nav className="main-nav" aria-label="Primary">
            {nav('/catalog', 'Catalog')}
            {nav('/gallery', 'Gallery')}
            {nav('/about', 'About')}
            {nav('/cart', count ? `Cart · ${count}` : 'Cart')}
          </nav>
        </div>
      </header>
    </>
  )
}