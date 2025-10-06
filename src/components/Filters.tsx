//src/components/Filters.tsx

type Props = {
  categories: string[]
  selected: string
  setSelected: (c: string) => void
  query: string
  setQuery: (q: string) => void
}
export default function Filters({ categories, selected, setSelected, query, setQuery }: Props) {
  return (
    <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',margin:'16px 0'}}>
      <select value={selected} onChange={(e)=>setSelected(e.target.value)} style={{padding:'8px 10px'}}>
        <option value="">All categories</option>
        {categories.map((c)=> (<option key={c} value={c}>{c}</option>))}
      </select>
      <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search lures..." style={{padding:'8px 10px',minWidth:220}}/>
    </div>
  )
}