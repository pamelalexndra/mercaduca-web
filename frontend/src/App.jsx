import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Landing from './components/Landing';
import { ALL_PRODUCTS, BEST_SELLERS, NEW_PRODUCTS } from './data/products';
import Catalog from './components/Catalog';
import Sellers from './components/Sellers';
import AboutUS from './components/AboutUs';
import Footer from './components/Footer';
import Login from './components/Login';

export default function App() {
  return (
    <Router>
      <TopBar />

      <Routes>
        <Route path="/" element={<Landing NEW_PRODUCTS={NEW_PRODUCTS} BEST_SELLERS={BEST_SELLERS} />}/>
        <Route path="/catalog" element={<Catalog ALL_PRODUCTS={ALL_PRODUCTS} />}/>
        <Route path="/emprendedores" element={<Sellers />}/>
        <Route path="/sobreNosotros" element={<AboutUS />}/>
        <Route path='/vender' element={<Login />}/>
      </Routes>

      <Footer />
    </Router>
  );
}