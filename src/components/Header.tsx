// src/components/Header.tsx
import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useCart } from '../state/cart'

export default function Header() {
  const totalQty = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const cartLabel = totalQty > 0 ? `Cart (${totalQty})` : 'Cart'

  const link = (to: string, label: string) => (
    <NavLink
      to={to}
      style={({ isActive }: { isActive: boolean }) => ({
        color: isActive ? 'var(--brand)' : 'var(--text-dim)',
        textDecoration: 'none',
        marginRight: 16,
        fontWeight: isActive ? 650 : 500,
        outline: 'none'
      })}
      className="navlink"
    >
      {label}
    </NavLink>
  )

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Skip link (off-screen but accessible) */}
      <a
        href="#main"
        style={{
          position: 'absolute',
          left: -9999,
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden'
        }}
      >
        Skip to content
      </a>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '12px 20px',
          maxWidth: 1100,
          margin: '0 auto'
        }}
      >
        <Link
          to="/"
          style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 800, fontSize: 18 }}
          aria-label="RIP Custom Lures – home"
        > <img src="/images/logo-rip.png" alt="RIP Custom Lures" style={{ height: 32 }} /></Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <nav aria-label="Main" style={{ display: 'flex', alignItems: 'center' }}>
            {link('/catalog', 'Catalog')}
            {link('/about', 'About')}
            {link('/cart', cartLabel)}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}