import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useCart } from '../state/cart'

export default function Header() {
  const { items } = useCart()
  const count = items.reduce((n, i) => n + i.qty, 0)
  const nav = (to: string, label: string) => (
    <NavLink to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      {label}
    </NavLink>
  )

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" aria-label="RIP Custom Lures" className="brand">
          <img src="/images/logo-rip.png" alt="RIP Custom Lures" />
        </Link>

        <nav className="main-nav">
          {nav('/catalog', 'Catalog')}
          {nav('/gallery', 'Gallery')}
          {nav('/about', 'About')}
          {nav('/cart', count ? `Cart · ${count}` : 'Cart')}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
