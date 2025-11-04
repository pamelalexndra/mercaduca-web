import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import Landing from "./components/Landing";
import { ALL_PRODUCTS, BEST_SELLERS, NEW_PRODUCTS } from "./data/products";
import Catalog from "./components/Catalog";
import Sellers from "./components/Sellers";
import AboutUs from "./components/AboutUs";
import ProductDetailPage from "./components/ProductDetail/ProductDetailPage";
import Login from "./components/Login";
import Footer from "./components/Footer";
import Perfil from "./components/Profile";
import NotFound from "./components/ErrorPages/NotFound";
import Forbidden from "./components/ErrorPages/Forbidden";
import InternalServerError from "./components/ErrorPages/InternalServerError";
import BadRequest from "./components/ErrorPages/BadRequest";

export default function App() {
  return (
    <Router>
      <TopBar />

      <Routes>
        {" "}
        {/* Pasamos los productos reales a landing y catalogo */}
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/emprendedores" element={<Sellers />} />
        <Route path="/sobreNosotros" element={<AboutUs />} />
        <Route path="/detalle/:id" element={<ProductDetailPage />} />
        <Route path="/vender" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/bad-request" element={<BadRequest />} />
        <Route
          path="/internal-server-error"
          element={<InternalServerError />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}
