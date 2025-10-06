//src/pages/Home.tsx

import { setTitle } from '../utils/seo'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  useEffect(()=>setTitle(''),[])
  return (
    <main style={{padding:'24px 20px',maxWidth:1100,margin:'0 auto',color:'#e6edf3'}}>
      <h1 style={{marginBottom:8}}>Handmade Fishing Lures</h1>
      <p style={{color:'#9fb3c8',marginBottom:24}}>Custom-crafted, tuned by hand, built to be fished--not framed.</p>
      <Link to="/catalog" style={{background:'#53b1f0',color:'#0b1220',padding:'10px 14px',borderRadius:8,textDecoration:'none',fontWeight:600}}>Browse Catalog</Link>
    </main>
  )
}