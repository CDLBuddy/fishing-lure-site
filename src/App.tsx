// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Success from './pages/Success'
import Cancel from './pages/Cancel'
import Header from './components/Header'
import Footer from './components/Footer'
import ToastProvider from './components/ToastProvider'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Header />
        <Routes>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="cart" element={<Cart />} />
          <Route path="success" element={<Success />} />
          <Route path="cancel" element={<Cancel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="gallery" element={<Gallery />} />
</Routes>
        <Footer />
      </ToastProvider>
    </BrowserRouter>
  )
}