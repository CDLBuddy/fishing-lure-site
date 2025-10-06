//src/pages/Cancel.tsx

import { setTitle } from '../utils/seo'
import { useEffect } from 'react'

export default function Cancel() {
  useEffect(()=>setTitle('Checkout Canceled'),[])
  return <main style={{padding:20,color:'#e6edf3'}}><h1>Checkout canceled</h1><p style={{color:'#9fb3c8'}}>No worries--your cart is saved.</p></main>
}