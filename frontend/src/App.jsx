import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Componentes de Navegación y Estructura
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import AdminLayout from "./components/Admin/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas Públicas
import Landing from "./components/Landing";
import Catalog from "./components/Catalog";
import Sellers from "./components/Entrepreneurship";
import AboutUs from "./components/AboutUs";
import ProductDetailPage from "./components/ProductDetail/ProductDetailPage";
import PublicProfile from "./components/PublicProfile";
import Login from "./components/Login";
import Register from "./components/Register";
import CouponDetailPage from "./components/Admin/Coupons/CouponDetailPage.jsx";
import PublicCoupons from "./components/PublicCoupons.jsx";

// Páginas Privadas (Usuario)
import Profile from "./components/Profile";

// Páginas de Administración
import RequestManagement from "./components/Admin/Requests/RequestManagement.jsx";
import ActivityManagement from "./components/Admin/Activities/ActivityManagement.jsx";
import CategoryManagement from "./components/Admin/Categories/CategoryManagement.jsx";
import AdministratorsManagement from "./components/Admin/Administrators/AdministratorsManagement.jsx";
import EntrepreneursManagement from "./components/Admin/Entrepreneurs/EntrepreneusManagement.jsx";
import CouponManagement from "./components/Admin/Coupons/CouponManagement.jsx";

// Páginas de Error
import NotFound from "./components/ErrorPages/NotFound";
import Forbidden from "./components/ErrorPages/Forbidden";
import InternalServerError from "./components/ErrorPages/InternalServerError";
import BadRequest from "./components/ErrorPages/BadRequest";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const updateCurrentUser = useCallback((userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setCurrentUser(userData);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("emprendimientoCache");
      setCurrentUser(null);
    }
  }, []);

  const handleLogout = useCallback(() => {
    updateCurrentUser(null);
  }, [updateCurrentUser]);

useEffect(() => {
  const handleStorageChange = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}, []);

  return (
    <Router>
      <ScrollToTop />
      <TopBar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onUpdateUser={updateCurrentUser} 
      />

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Landing currentUser={currentUser}/>} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/emprendimientos" element={<Sellers />} />
        <Route path="/emprendimiento/:id" element={<PublicProfile />} />
        <Route path="/sobreNosotros" element={<AboutUs />} />
        <Route path="/detalle/:id" element={<ProductDetailPage />} />
        <Route path="/registrar" element={<Register />} />
        <Route path="/vender" element={<Login onLoginSuccess={updateCurrentUser} />} />
        <Route path="/cupones" element={<PublicCoupons />} />
        <Route path="/cupones/detalle/:id" element={<CouponDetailPage />} />

        {/* --- RUTAS PROTEGIDAS (USUARIO) --- */}
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <Profile 
                user={currentUser} 
                onUpdateUser={updateCurrentUser} 
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfil/producto/nuevo" 
          element={
            <ProtectedRoute>
              <Profile user={currentUser} onUpdateUser={updateCurrentUser} />
            </ProtectedRoute>
          } 
        />

        {/* --- RUTAS PROTEGIDAS (ADMIN) */}
        <Route 
          path="/Admin" 
          element={
            <ProtectedRoute requiredRole="Administrador">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Sub-rutas que se renderizan dentro AdminLayout */}
          <Route path="entrepreneurship-applications" element={<RequestManagement />} />
          <Route path="activity-management" element={<ActivityManagement />} />
          <Route path="categories" element={<CategoryManagement/>} />
          <Route path="administrators" element={<AdministratorsManagement/>} />
          <Route path="entrepreneurs" element={<EntrepreneursManagement/>} />
          <Route path="coupons" element={<CouponManagement />} />
        </Route>

        {/* --- RUTAS DE ERROR --- */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/bad-request" element={<BadRequest />} />
        <Route path="/internal-server-error" element={<InternalServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </Router>
  );
}