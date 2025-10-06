//src/pages/About.tsx

import { useEffect } from 'react'
import { setTitle } from '../utils/seo'

export default function About() {
  useEffect(()=>setTitle('About'),[])
  return (
    <main style={{padding:'24px 20px',maxWidth:900,margin:'0 auto',color:'#e6edf3'}}>
      <h1>About</h1>
      <p style={{color:'#9fb3c8'}}>Every lure is poured, wired, painted, and tuned by hand. Materials are selected for action first, looks second.</p>
    </main>
  )
}