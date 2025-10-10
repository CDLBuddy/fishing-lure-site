// src/components/Filters.tsx
import type { CSSProperties } from 'react'

type Props = {
  categories: string[]
  selected: string
  setSelected: (c: string) => void
  query: string
  setQuery: (q: string) => void
}

const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0
}

export default function Filters({ categories, selected, setSelected, query, setQuery }: Props) {
  const clear = () => {
    setSelected('')
    setQuery('')
    const el = document.getElementById('catalog-search') as HTMLInputElement | null
    el?.focus()
  }

  return (
    <form
      role="search"
      aria-label="Filter catalog"
      onSubmit={(e) => e.preventDefault()}
      style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', margin: '16px 0' }}
    >
      <label htmlFor="category-select" style={srOnly}>Category</label>
      <select
        id="category-select"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{
          padding: '8px 10px',
          background: 'var(--bg-2)',
          color: 'var(--text)',
          border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 6
        }}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label htmlFor="catalog-search" style={srOnly}>Search lures</label>
      <input
        id="catalog-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') setQuery('') }}
        placeholder="Search lures…"
        style={{
          padding: '8px 10px',
          minWidth: 220,
          background: 'var(--bg-2)',
          color: 'var(--text)',
          border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 6
        }}
      />

      {(selected || query) && (
        <button type="button" onClick={clear} className="btn" aria-label="Clear filters">
          Clear
        </button>
      )}
    </form>
  )
}