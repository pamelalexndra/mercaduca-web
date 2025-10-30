import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Landing from './components/Landing';
import { ALL_PRODUCTS, BEST_SELLERS, NEW_PRODUCTS } from './data/products';
import Catalog from './components/Catalog';
import Sellers from './components/Sellers';
import AboutUs from './components/AboutUs';

export default function App() {
  return (
    <Router>
      <TopBar />

      <Routes>
        <Route path="/" element={<Landing NEW_PRODUCTS={NEW_PRODUCTS} BEST_SELLERS={BEST_SELLERS} />}/>
        <Route path="/catalog" element={<Catalog ALL_PRODUCTS={ALL_PRODUCTS} />}/>
        <Route path="/emprendedores" element={<Sellers />}/>
        <Route path="/sobreNosotros" element={<AboutUs />}/>
      </Routes>

      <footer className="mt-20 border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-zinc-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} MercadUCA</span>
          <a href="#" className="hover:text-zinc-700">
            Redes sociales de MercadUca
          </a>
        </div>
      </footer>
    </Router>
  );
}