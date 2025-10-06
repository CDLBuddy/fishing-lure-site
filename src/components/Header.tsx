//src/components/Header.tsx

import { Link, NavLink } from 'react-router-dom'
export default function Header() {
  const link = (to: string, label: string) => (
    <NavLink to={to} style={({ isActive }) => ({ color: isActive ? '#53b1f0' : '#e6edf3', textDecoration: 'none', marginRight: 16 })}>
      {label}
    </NavLink>
  )
  return (
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',background:'#0b1220',position:'sticky',top:0}}>
      <Link to="/" style={{color:'#e6edf3',textDecoration:'none',fontWeight:700}}>Handmade Lures</Link>
      <nav>{link('/catalog','Catalog')}{link('/about','About')}{link('/cart','Cart')}</nav>
    </header>
  )
}