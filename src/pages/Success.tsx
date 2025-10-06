//src/pages/Success.tsx

import { setTitle } from '../utils/seo'
import { useEffect } from 'react'

export default function Success() {
  useEffect(()=>setTitle('Order Success'),[])
  return <main style={{padding:20,color:'#e6edf3'}}><h1>Thank you!</h1><p style={{color:'#9fb3c8'}}>Your order has been received.</p></main>
}