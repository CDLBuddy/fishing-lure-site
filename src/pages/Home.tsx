// src/pages/Home.tsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setTitle } from '../utils/seo'

export default function Home() {
  useEffect(() => setTitle(''), [])

  return (
    <main id="main">
      <section className="hero">
        <div className="container" style={{ paddingTop: 28, paddingBottom: 28 }}>
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              marginBottom: 8,
            }}
          >
            Handmade • Small Batch • Pro-Grade
          </div>

          {/* Headline & subhead */}
          <h1 className="h1" style={{ marginTop: 0, marginBottom: 8 }}>
            RIP Custom Lures
          </h1>
          <p className="lead" style={{ margin: 0 }}>
            Built to be fished--not framed.
          </p>

          {/* CTAs */}
          <div
            aria-label="Primary actions"
            style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}
          >
            <Link to="/catalog" className="btn">
              Browse Catalog
            </Link>
            <Link to="/gallery" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              See Customer Catches
            </Link>
          </div>

          {/* Badges / quick value props */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <span className="badge">Hand-tied skirts</span>
            <span className="badge">Premium hooks</span>
            <span className="badge">Balanced action</span>
          </div>
        </div>
      </section>
    </main>
  )
}