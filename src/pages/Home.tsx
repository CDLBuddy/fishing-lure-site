//src/pages/Home.tsx

import { setTitle } from '../utils/seo'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  useEffect(() => setTitle(''), [])
  return (
    <main>
      <section className="hero container">
        <h1>Welcome to RIP Custom Lures</h1>
        <p className="lead">Built to be fished—not framed.</p>
        <Link
          to="/catalog"
          className="btn"
          style={{
            display: 'inline-block',
            background: 'var(--brand)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 'var(--radius-2)',
            textDecoration: 'none',
            fontWeight: 600,
            marginTop: 16
          }}
        >
          Browse Catalog
        </Link>
      </section>
    </main>
  )
}