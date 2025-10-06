//src/components/Header.tsx

import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
export default function Header() {
  const link = (to: string, label: string) => (
    <NavLink
      to={to}
      style={({ isActive }: { isActive: boolean }) => ({
        color: isActive ? 'var(--brand)' : 'var(--text-dim)',
        textDecoration: 'none',
        marginRight: 16,
        fontWeight: isActive ? 600 : 500,
      })}
    >
      {label}
    </NavLink>
  )
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 20px',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        to="/"
        style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}
      >
        Handmade Lures
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {link('/catalog', 'Catalog')}
          {link('/about', 'About')}
          {link('/cart', 'Cart')}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
